const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required.'],
    trim: true,
  },
  module: {
    type: mongoose.Schema.ObjectId,
    ref: 'Module',
    required: true,
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true,
  },
  order: {
    type: Number, // To control the sequence of lessons within a module
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['Video', 'PDF', 'Text'],
    default: 'Video',
  },
  videoUrl: {
    type: String,
    // This is only required if the lesson type is 'Video'
    required: function() { return this.type === 'Video'; },
  },
  notesUrl: {
    type: String, // URL to a downloadable PDF
  },
  textContent: {
    type: String,
  },
  duration: {
    type: Number, // Optional: duration of video in minutes
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Lesson', lessonSchema);