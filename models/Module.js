const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Module title is required.'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Module description is required.'],
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true,
  },
  order: {
    type: Number, // To control the sequence of modules (e.g., 1, 2, 3...)
    required: true,
  },
  subscriptionTier: {
    type: String,
    required: true,
    enum: ['Free', 'Plus', 'Premium'],
    // By default, a new module will inherit the tier of its parent course,
    // but this can be overridden by the admin.
    default: 'Free',
  },
  lessons: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson'
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Module', moduleSchema);