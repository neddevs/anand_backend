const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required.'],
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    required: [true, 'Course description is required.'],
  },
  catalogue: {
    type: mongoose.Schema.ObjectId,
    ref: 'Catalogue',
    required: [true, 'Every course must belong to a catalogue.'],
  },
  instructor: {
    type: String,
    required: [true, 'Instructor name is required.'],
    default: 'Bhakti Bhoomi Faculty',
  },
  thumbnail: {
    type: String, // URL to a course cover image
    required: [true, 'Course thumbnail image is required.'],
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    default: 'All Levels',
  },
  subscriptionTier: {
    type: String,
    required: true,
    enum: ['Free', 'Plus', 'Premium'],
    default: 'Free',
  },
  modules: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Module'
  }],

  isPublished: {
    type: Boolean,
    default: false, // Admins can create draft courses
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Course', courseSchema);