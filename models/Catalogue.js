const mongoose = require('mongoose');

const catalogueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Catalogue name is required.'],
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    required: [true, 'A short description is required.'],
  },
  // Optional: an image to represent the category
  image: {
    type: String, 
  },
  // This will store a list of all courses belonging to this catalogue
  courses: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Course'
  }],
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Catalogue', catalogueSchema);