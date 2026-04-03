const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true,
  },
  subscriptionTier: {
    type: String,
    required: true,
    enum: ['Free', 'Plus', 'Premium'],
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    // This will be set for 'Plus' subscriptions, null for 'Free' and 'Premium' (lifetime)
  },
  progress: [{
    lesson: {
      type: mongoose.Schema.ObjectId,
      ref: 'Lesson',
    },
    completedAt: {
      type: Date,
    },
  }],
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create a compound index to ensure a user can only enroll in a course once
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

// Virtual property to calculate the percentage of completion
enrollmentSchema.virtual('completionPercentage').get(function() {
  // This is a placeholder for now. We will need to populate the total number of lessons
  // in the course to make this calculation accurate. We will do this in the controller logic.
  if (!this.course.lessons || this.course.lessons.length === 0) {
    return 0;
  }
  const completedLessons = this.progress.length;
  const totalLessons = this.course.lessons.length;
  return (completedLessons / totalLessons) * 100;
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);