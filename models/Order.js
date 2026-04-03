const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  orderItems: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }, // Price at the time of purchase
    image: { type: String, required: true },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true,
    },
  }],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
    phoneNo: { type: String, required: true },
  },
    gstNumber: {
    type: String,
    trim: true,
  },
  paymentDetails: {
    paymentId: { type: String },
    orderId: { type: String }, // Razorpay Order ID
    signature: { type: String },
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0.0,
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing',
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  deliveredAt: {
    type: Date,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);