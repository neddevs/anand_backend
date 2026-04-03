const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth'); // Your existing auth middleware

// All payment routes must be protected
router.use(protect);
  
router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);

module.exports = router;