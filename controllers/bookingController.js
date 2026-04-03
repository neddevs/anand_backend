const PoojaBooking = require('../models/PoojaBooking');
const emailService = require('../services/emailService');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// @desc    Create a new pooja booking and prepare for payment
// @route   POST /api/bookings
// @access  Private (This route must be protected)
const createBooking = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      devoteeName,
      email,
      phone,
      poojaType,
      temple,
      poojaDate,
      poojaTime,
      specialRequests
    } = req.body;

    // Check if the date is not in the past
    const bookingDate = new Date(poojaDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Booking date cannot be in the past'
      });
    }

    // Create new booking and associate with the logged-in user
    const booking = new PoojaBooking({
      user: req.user.id, // FIX: Associate the booking with the user from the auth token
      devoteeName,
      email,
      phone,
      poojaType,
      temple,
      poojaDate: bookingDate,
      poojaTime,
      specialRequests: specialRequests || ''
      // paymentStatus will default to 'pending'
    });

    // Save booking to database
    const savedBooking = await booking.save();

    // The confirmation email is now sent AFTER successful payment via the paymentController.
    // We simply return the necessary data to the frontend to initiate the payment.
    res.status(201).json({
      success: true,
      message: 'Booking created successfully. Proceeding to payment.',
      data: {
        bookingId: savedBooking.bookingId,
        poojaType: savedBooking.poojaType, // Send the ID for consistency
        amount: savedBooking.amount,
        currency: savedBooking.currency,
        devoteeName: savedBooking.devoteeName,
        email: savedBooking.email,
        phone: savedBooking.phone
      }
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate Booking ID error. Please try again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:bookingId
// @access  Public
const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await PoojaBooking.findOne({ bookingId: bookingId.toUpperCase() });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: {
        bookingId: booking.bookingId,
        devoteeName: booking.devoteeName,
        email: booking.email,
        phone: booking.phone,
        poojaType: booking.poojaTypeName,
        temple: booking.templeName,
        poojaDate: booking.formattedDate,
        poojaTime: booking.formattedTime,
        specialRequests: booking.specialRequests,
        amount: booking.amount,
        currency: booking.currency,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        liveStreamLink: booking.liveStreamLink,
        emailSent: booking.emailSent,
        createdAt: booking.createdAt
      }
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get bookings by email
// @route   GET /api/bookings/email/:email
// @access  Public
// Deprecated

// @desc    Update booking status
// @route   PUT /api/bookings/:bookingId/status
// @access  Private (Admin only)
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, liveStreamLink, notes } = req.body;

    // Use .populate() to efficiently fetch the booking AND its associated user's details
    const booking = await PoojaBooking.findOne({ bookingId: bookingId.toUpperCase() })
                                      .populate('user', 'fullName email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const oldStatus = booking.status; // Store the status before any changes

    // Update fields if they were provided in the request body
    if (status) booking.status = status;
    if (liveStreamLink) booking.liveStreamLink = liveStreamLink;
    if (notes) booking.notes = notes;
    
    // The liveStreamPassword field seems to be missing from your model, I've removed it from here.
    // If you add it to the model, you can uncomment the line below.
    // if (liveStreamPassword) booking.liveStreamPassword = liveStreamPassword;

    const updatedBooking = await booking.save();

    // --- Send Email Notification on Status Change ---
    // Check if the status was provided and has actually changed
    if (status && status !== oldStatus) {
      try {
        await emailService.sendStatusUpdateNotification({
          email: updatedBooking.user.email,
          userName: updatedBooking.user.fullName,
          entityType: 'Pooja Booking',
          entityId: updatedBooking.bookingId,
          newStatus: status,
          entityName: updatedBooking.poojaTypeName // Using the virtual getter for display
        });
      } catch (emailError) {
        console.error(`Failed to send status update email for booking ${bookingId}:`, emailError);
      }
    }

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking
    });

  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private (Admin only)
const getAllBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {};
    
    if (req.query.status) filter.status = req.query.status;
    if (req.query.poojaType) filter.poojaType = req.query.poojaType;
    if (req.query.temple) filter.temple = req.query.temple;
    if (req.query.dateFrom || req.query.dateTo) {
      filter.poojaDate = {};
      if (req.query.dateFrom) filter.poojaDate.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) filter.poojaDate.$lte = new Date(req.query.dateTo);
    }

    const bookings = await PoojaBooking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PoojaBooking.countDocuments(filter);
    const formattedBookings = bookings.map(booking => ({
      bookingId: booking.bookingId,
      devoteeName: booking.devoteeName,
      email: booking.email,
      phone: booking.phone,
      poojaType: booking.poojaTypeName,
      temple: booking.templeName,
      poojaDate: booking.formattedDate,
      poojaTime: booking.formattedTime,
      specialRequests: booking.specialRequests,
      amount: booking.amount,
      currency: booking.currency,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      emailSent: booking.emailSent,
      createdAt: booking.createdAt
    }));

    res.json({
      success: true,
      data: formattedBookings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBookings: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get booking statistics
// @route   GET /api/bookings/stats
// @access  Private (Admin only)
const getBookingStats = async (req, res) => {
  try {
    const stats = await PoojaBooking.aggregate([ { $group: { _id: null, totalBookings: { $sum: 1 }, totalRevenue: { $sum: '$amount' }, confirmedBookings: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } }, completedBookings: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } } ]);
    const poojaTypeStats = await PoojaBooking.aggregate([ { $group: { _id: '$poojaType', count: { $sum: 1 }, revenue: { $sum: '$amount' } } }, { $sort: { count: -1 } } ]);
    const templeStats = await PoojaBooking.aggregate([ { $group: { _id: '$temple', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 } ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || { totalBookings: 0, totalRevenue: 0, confirmedBookings: 0, completedBookings: 0 },
        poojaTypeStats,
        templeStats
      }
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// TODO :- Remove the less secure getBookingsByEmail (no authentication)
// @desc    Get bookings for the logged-in user
// @route   GET /api/bookings/my-bookings
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    const bookings = await PoojaBooking.find({ user: req.user.id })
      .sort({ poojaDate: -1 }); // Sort by newest pooja date first

    if (!bookings) {
      return res.status(404).json({ success: false, message: 'No bookings found for this user' });
    }

    const formattedBookings = bookings.map(booking => ({
      bookingId: booking.bookingId,
      devoteeName: booking.devoteeName,
      poojaType: booking.poojaTypeName,
      temple: booking.templeName,
      poojaDate: booking.formattedDate,
      poojaTime: booking.formattedTime,
      amount: booking.amount,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt
    }));

    res.json({
      success: true,
      data: formattedBookings
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createBooking,
  getBookingById,
  // getBookingsByEmail, // TODO :- To be depricated 
  getUserBookings,
  updateBookingStatus,
  getAllBookings,
  getBookingStats
};