const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

// Public routes - anyone can view products
router.route('/').get(getAllProducts);
router.route('/:id').get(getProductById);

// Admin only routes - only admins can create, update, or delete products
router.route('/').post(protect, authorize('admin'), createProduct);
router.route('/:id').put(protect, authorize('admin'), updateProduct);
router.route('/:id').delete(protect, authorize('admin'), deleteProduct);

module.exports = router;