const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required.'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters.']
  },
  description: {
    type: String,
    required: [true, 'Product description is required.'],
  },
  price: {
    type: Number,
    required: [true, 'Product price is required.'],
    min: [0, 'Price cannot be negative.'],
  },
  category: {
    type: String,
    required: [true, 'Product category is required.'],
    trim: true,
    lowercase: true,
  },
  stock: {
    type: Number,
    required: [true, 'Product stock quantity is required.'],
    min: [0, 'Stock cannot be negative.'],
    default: 0,
  },
  images: [{
    type: String, // We will store image URLs hosted elsewhere (e.g., Cloudinary, S3)
    required: [true, 'At least one product image is required.']
  }],
  ratings: {
    type: Number,
    default: 0,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);