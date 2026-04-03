const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const emailService = require('../services/emailService');

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private
 */
exports.createOrder = async (req, res) => {
  try {
    // --- THIS IS THE UPDATED PART ---
    const { orderItems, shippingAddress, gstNumber } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items provided.' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping address is required.' });
    }

    let totalAmount = 0;
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
      }
      totalAmount += product.price * item.quantity;
    }

    const order = new Order({
      user: req.user.id,
      orderItems,
      shippingAddress,
      gstNumber: gstNumber || '', // Save the GST number, or an empty string if not provided
      totalAmount,
    });
    // ---------------------------------

    const createdOrder = await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully. Please proceed to payment.',
      data: createdOrder,
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get orders for the logged-in user
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id fullName email').sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Update order status (Admin)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required.' });
    }
    
    const order = await Order.findById(req.params.id).populate('user', 'fullName email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    
    const oldStatus = order.orderStatus;
    
    const allowedStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status provided.' });
    }

    order.orderStatus = status;

    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    if (status !== oldStatus) {
      try {
        await emailService.sendStatusUpdateNotification({
          email: updatedOrder.user.email,
          userName: updatedOrder.user.fullName,
          entityType: 'Store Order',
          entityId: updatedOrder._id.toString(),
          newStatus: status,
          entityName: `Order of ${updatedOrder.orderItems.length} item(s)`
        });
      } catch (emailError) {
        console.error(`Failed to send status update email for order ${updatedOrder._id}:`, emailError);
      }
    }

    res.json({
      success: true,
      message: 'Order status updated successfully.',
      data: updatedOrder,
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};