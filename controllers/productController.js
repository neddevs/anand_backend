const Product = require('../models/Product');

// @desc    Get all products (Public)
// @route   GET /api/products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error('Get All Products Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get a single product by ID (Public)
// @route   GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    console.error(`Get Product By ID Error for ID ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// --- ADMIN ONLY ---


// @desc    Create a new product (Admin)
// @route   POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      createdBy: req.user.id,
    });
    const createdProduct = await product.save();
    res.status(201).json({ success: true, data: createdProduct });
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(400).json({ success: false, message: 'Error creating product', error: error.message });
  }
};

// @desc    Update a product (Admin)
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Update fields from req.body
    Object.assign(product, req.body);
    
    const updatedProduct = await product.save();
    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error(`Update Product Error for ID ${req.params.id}:`, error);
    res.status(400).json({ success: false, message: 'Error updating product', error: error.message });
  }
};

// @desc    Delete a product (Admin)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    await product.deleteOne();
    
    res.json({ success: true, message: 'Product removed' });
  } catch (error) {
    console.error(`Delete Product Error for ID ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};