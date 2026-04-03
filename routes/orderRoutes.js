const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,       
  updateOrderStatus   
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth'); 

// --- USER-SPECIFIC ROUTES ---
// These routes are protected, requiring a valid login.
router.route('/').post(protect, createOrder);
router.route('/my-orders').get(protect, getMyOrders);

// --- ADMIN-ONLY ROUTES ---
// These routes require a valid login AND an 'admin' role.
router.route('/').get(protect, authorize('admin'), getAllOrders);
router.route('/:id/status').put(protect, authorize('admin'), updateOrderStatus);
// router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

module.exports = router;