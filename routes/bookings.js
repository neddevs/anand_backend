const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getBookingById,
  // getBookingsByEmail,
  updateBookingStatus,
  getAllBookings,
  getBookingStats,
  getUserBookings
} = require('../controllers/bookingController');
const { protect: auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation middleware for booking creation
const bookingValidation = [
  body('devoteeName').trim().notEmpty().withMessage('Devotee name is required'),
  body('email').isEmail().withMessage('Please enter a valid email address'),
  body('phone').matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please enter a valid phone number'),
  body('poojaType').notEmpty().withMessage('Please select a valid pooja type'),
  body('temple').trim().notEmpty().withMessage('Please select a temple'),
  body('poojaDate').isISO8601().withMessage('Please enter a valid date'),
  body('poojaTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Please enter a valid time format (HH:MM)'),
];

// @route   POST /api/bookings
// @desc    Create a new pooja booking
// @access  Private
// 'protect' will run first, create req.user, and then call createBooking.
router.post('/', auth, bookingValidation, createBooking);


// @route   GET /api/bookings/my-bookings
// @desc    Get bookings for the currently logged-in user
// @access  Private
// NOTE: Ensure you have created the `getUserBookings` function in your controller.
router.get('/my-bookings', auth, getUserBookings);


// @route   GET /api/bookings/:bookingId
// @desc    Get a specific booking by its ID
// @access  Private (Your controller should verify ownership)
router.get('/:bookingId', auth, getBookingById);


// --- Admin Only Routes ---

// @route   GET /api/bookings
// @desc    Get all bookings
// @access  Private/Admin
router.get('/', auth, authorize('admin'), getAllBookings);

// @route   GET /api/bookings/stats
// @desc    Get booking statistics
// @access  Private/Admin
router.get('/stats', auth, authorize('admin'), getBookingStats);

// @route   PUT /api/bookings/:bookingId/status
// @desc    Update booking status
// @access  Private/Admin
router.put('/:bookingId/status', auth, authorize('admin'), updateBookingStatus);


module.exports = router;