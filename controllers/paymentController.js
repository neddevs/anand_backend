const Razorpay = require('razorpay');
const crypto = require('crypto');
const PoojaBooking = require('../models/PoojaBooking');
const Order = require('../models/Order');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const emailService = require('../services/emailService');
const subscriptionPlans = require('../config/subscriptions');

// Initialize Razorpay client from environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @desc    Create a generic Razorpay order for any entity
 * @route   POST /api/payment/create-order
 * @access  Private
 */
const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', entityId, entityType, courseId } = req.body;
    let orderAmount = amount;

    if (!entityId || !entityType) {
      return res.status(400).json({ success: false, message: 'entityId and entityType are required.' });
    }

    if (entityType === 'subscription') {
      const plan = subscriptionPlans[entityId];
      if (!plan) {
        return res.status(404).json({ success: false, message: 'Subscription plan not found.' });
      }
      orderAmount = plan.price;
    }

    if (!orderAmount || orderAmount <= 0) {
        return res.status(400).json({ success: false, message: 'A valid amount is required.' });
    }

    const options = {
      amount: Math.round(orderAmount * 100),
      currency,
      // --- CHANGE : Generate a shorter, more robust receipt ID ---
      receipt: `rcpt_${crypto.randomBytes(12).toString('hex')}`, // This will be ~30 chars long, well within the limit
      notes: {
        entityId,
        entityType,
        userId: req.user.id,
        courseId: entityType === 'subscription' ? courseId : undefined,
      }
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ success: false, message: 'Error creating Razorpay order.' });
    }

    res.status(200).json({
      success: true,
      data: order,
    });

  } catch (error) {
    console.error('Razorpay order creation error:', error);
    // Send back Razorpay's specific error message if it exists
    if (error.error && error.error.description) {
        return res.status(error.statusCode).json({ success: false, message: error.error.description });
    }
    res.status(500).json({ success: false, message: 'Internal Server Error during order creation' });
  }
};

/**
 * @desc    Verify a generic payment and confirm the associated entity
 * @route   POST /api/payment/verify-payment
 * @access  Private
 */
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing required payment details for verification.' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }
    
    const orderDetails = await razorpay.orders.fetch(razorpay_order_id);
    const { entityId, entityType, courseId } = orderDetails.notes;

    if (entityType === 'booking') {
      const booking = await PoojaBooking.findOne({ bookingId: entityId.toUpperCase() });
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      booking.paymentDetails = { orderId: razorpay_order_id, paymentId: razorpay_payment_id, paidAt: new Date() };
      await booking.save();

      emailService.sendPoojaBookingConfirmation(booking.toObject()).catch(emailError => {
        console.error(`Failed to send email for booking ${entityId}:`, emailError);
      });

    } else if (entityType === 'order') {
      const order = await Order.findById(entityId);
      if (!order) return res.status(404).json({ success: false, message: 'Store order not found.' });
      
      order.paymentStatus = 'paid';
      order.paymentDetails = { orderId: razorpay_order_id, paymentId: razorpay_payment_id };
      await order.save();
      
      const orderUser = await User.findById(order.user);
      emailService.sendStoreOrderConfirmation({ ...order.toObject(), user: orderUser.toObject() }).catch(emailError => {
        console.error(`Failed to send email for store order ${entityId}:`, emailError);
      });

    } else if (entityType === 'subscription') {
      const plan = subscriptionPlans[entityId];
      if (!plan) return res.status(404).json({ success: false, message: 'Subscription plan not found.' });
      
      const user = await User.findById(req.user.id);
      user.subscription.tier = entityId;
      user.subscription.status = 'active';

      if (plan.durationMonths) {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + plan.durationMonths);
        user.subscription.expiresAt = expiryDate;
      } else {
        user.subscription.expiresAt = null;
      }
      await user.save();
      
      emailService.sendSubscriptionConfirmation({ user: user.toObject(), plan }).catch(emailError => {
        console.error(`Failed to send subscription email for user ${user.email}:`, emailError);
      });

      if (courseId) {
        const course = await Course.findById(courseId);
        const existingEnrollment = await Enrollment.findOne({ user: req.user.id, course: courseId });
        
        if (course && !existingEnrollment) {
            await Enrollment.create({
                user: req.user.id,
                course: courseId,
                subscriptionTier: course.subscriptionTier,
            });
            console.log(`User ${user.email} auto-enrolled in course ${course.title} after subscription.`);
        }
      }

    } else {
      return res.status(400).json({ success: false, message: 'Invalid entity type for payment verification.' });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      data: { orderId: razorpay_order_id, paymentId: razorpay_payment_id }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error during payment verification' });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};