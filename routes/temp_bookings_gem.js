const PoojaBooking = require('../models/PoojaBooking');
const emailService = require('../services/emailService');
const { validationResult } = require('express-validator');

// @desc    Create a new pooja booking
// @route   POST /api/bookings
// @access  Private (Changed from Public)
const createBooking = async (req, res) => {
  try {
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

    const bookingDate = new Date(poojaDate);

    // Create new booking
    const booking = new PoojaBooking({
      // --- CHANGE: Associate the booking with the logged-in user ---
      user: req.user.id,
      // -----------------------------------------------------------
      devoteeName,
      email,
      phone,
      poojaType,
      temple,
      poojaDate: bookingDate,
      poojaTime,
      specialRequests: specialRequests || ''
    });

    const savedBooking = await booking.save();

    // The rest of your email logic remains the same.
    try {
      await emailService.sendPoojaBookingConfirmation({ ... });
      savedBooking.emailSent = true;
      savedBooking.emailSentAt = new Date();
      await savedBooking.save();

      emailService.sendAdminNotification({ ... }).catch(err => {
        console.error('Admin notification failed:', err);
      });

      res.status(201).json({
        success: true,
        message: 'Pooja booking created successfully and confirmation email sent',
        data: {
          bookingId: savedBooking.bookingId,
          // ... your existing response data
        }
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      res.status(201).json({
        success: true,
        message: 'Pooja booking created successfully, but email notification failed',
        data: {
          bookingId: savedBooking.bookingId,
          // ... your existing response data
        }
      });
    }
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


// @desc    Get booking by ID
// @route   GET /api/bookings/:bookingId
// @access  Private (Changed from Public)
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

    // --- CHANGE: Add Security Check for Ownership ---
    // Allow access if the user owns the booking OR if the user is an admin.
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }
    // ------------------------------------------------

    res.json({
      success: true,
      data: {
        bookingId: booking.bookingId,
        devoteeName: booking.devoteeName,
        // ... your existing response data
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


// --- NEW FUNCTION: Get bookings for the logged-in user ---
// @desc    Get bookings for the currently authenticated user
// @route   GET /api/bookings/my-bookings
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    // Find bookings where the 'user' field matches the ID from the JWT token
    const bookings = await PoojaBooking.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20); // Limit the results for performance

    // Use the same formatting as your other endpoints for consistency
    const formattedBookings = bookings.map(booking => ({
      bookingId: booking.bookingId,
      devoteeName: booking.devoteeName,
      poojaType: booking.poojaTypeName,
      temple: booking.templeName,
      poojaDate: booking.formattedDate,
      poojaTime: booking.formattedTime,
      amount: booking.amount,
      currency: booking.currency,
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


// --- REMOVED: getBookingsByEmail function is no longer needed for security reasons ---


// @desc    Update booking status
// @route   PUT /api/bookings/:bookingId/status
// @access  Private (Admin only)
const updateBookingStatus = async (req, res) => {
  // No changes needed here, authorization is handled in the router
  try {
    const { bookingId } = req.params;
    const { status, liveStreamLink, liveStreamPassword, notes } = req.body;
    const booking = await PoojaBooking.findOne({ bookingId: bookingId.toUpperCase() });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (status) booking.status = status;
    if (liveStreamLink) booking.liveStreamLink = liveStreamLink;
    if (liveStreamPassword) booking.liveStreamPassword = liveStreamPassword;
    if (notes) booking.notes = notes;

    await booking.save();
    res.json({ success: true, message: 'Booking updated successfully', data: booking });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private (Admin only)
const getAllBookings = async (req, res) => {
  // No changes needed here, authorization is handled in the router
  // Your existing pagination and filtering logic is excellent
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    // ... your other filters

    const bookings = await PoojaBooking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await PoojaBooking.countDocuments(filter);

    const formattedBookings = bookings.map(b => ({ /* your mapping */ }));

    res.json({
      success: true,
      data: formattedBookings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBookings: total,
      }
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Get booking statistics
// @route   GET /api/bookings/stats
// @access  Private (Admin only)
const getBookingStats = async (req, res) => {
  // No changes needed here, authorization is handled in the router
  try {
    // Your existing aggregation logic is perfect
    const stats = await PoojaBooking.aggregate([ /* ... */]);
    const poojaTypeStats = await PoojaBooking.aggregate([ /* ... */]);
    const templeStats = await PoojaBooking.aggregate([ /* ... */]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        poojaTypeStats,
        templeStats
      }
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// --- CHANGE: Update the exported modules ---
module.exports = {
  createBooking,
  getBookingById,
  getUserBookings, // Add the new function
  // getBookingsByEmail, // Remove the old, insecure function
  updateBookingStatus,
  getAllBookings,
  getBookingStats
};