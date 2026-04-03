const mongoose = require('mongoose');

const poojaBookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  bookingId: {
    type: String,
    unique: true,
    uppercase: true
  },
  devoteeName: {
    type: String,
    required: [true, 'Devotee name is required'],
    trim: true,
    maxlength: [100, 'Devotee name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  poojaType: {
    type: String,
    required: [true, 'Pooja type is required'],
    enum: ['daily', 'special', 'festival', 'remedial', 'house-warming', 'success'],
    trim: true
  },
  temple: {
    type: String,
    required: [true, 'Temple selection is required'],
    trim: true
  },
  poojaDate: {
    type: Date,
    required: [true, 'Pooja date is required']
  },
  poojaTime: {
    type: String,
    required: [true, 'Pooja time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format']
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: [500, 'Special requests cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  amount: {
    type: Number,
  },
  currency: {
    type: String,
    default: 'INR'
  },
  liveStreamLink: {
    type: String,
    trim: true
  },
  liveStreamPassword: {
    type: String,
    trim: true
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional, for logged-in users
  }
}, {
  timestamps: true
});

// Index for better query performance
poojaBookingSchema.index({ bookingId: 1 });
poojaBookingSchema.index({ email: 1 });
poojaBookingSchema.index({ poojaDate: 1 });
poojaBookingSchema.index({ status: 1 });
poojaBookingSchema.index({ createdAt: -1 });

// Virtual for formatted date
poojaBookingSchema.virtual('formattedDate').get(function () {
  return this.poojaDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for formatted time
poojaBookingSchema.virtual('formattedTime').get(function () {
  const [hours, minutes] = this.poojaTime.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
});

// Virtual for temple name
poojaBookingSchema.virtual('templeName').get(function () {
  const templeNames = {
    'tirupati': 'Tirupati Balaji Temple, Andhra Pradesh',
    'varanasi': 'Kashi Vishwanath Temple, Varanasi',
    'jagannath': 'Jagannath Temple, Puri',
    'somnath': 'Somnath Temple, Gujarat',
    'golden-temple': 'Golden Temple, Amritsar',
    'meenakshi': 'Meenakshi Temple, Madurai',
    'rameshwaram': 'Ramanathaswamy Temple, Rameshwaram',
    'badrinath': 'Badrinath Temple, Uttarakhand',
    'kedarnath': 'Kedarnath Temple, Uttarakhand',
    'gangotri': 'Gangotri Temple, Uttarakhand',
    'yamunotri': 'Yamunotri Temple, Uttarakhand',
    'vaishno-devi': 'Vaishno Devi Temple, Jammu',
    'siddhivinayak': 'Siddhivinayak Temple, Mumbai',
    'shirdi': 'Shirdi Sai Baba Temple, Maharashtra',
    'sabarimala': 'Sabarimala Temple, Kerala',
    'bagalamukhi': 'Maa Bagalamukhi Temple, Haridwar',
    'kalighat': 'Kalighat Temple, Kolkata',
    'vindhyvasini': 'Maa Vindhyvasini',
    'loknath': 'Loknath Temple, Puri',
    'lingaraj': 'Lingaraj Temple, Bhubaneswar'
  };
  return templeNames[this.temple] || this.temple;
});

// Virtual for pooja type name
poojaBookingSchema.virtual('poojaTypeName').get(function () {
  const poojaTypes = {
    'daily': 'Daily Pooja - ₹299',
    'special': 'Special Occasion Pooja - ₹599',
    'festival': 'Festival Pooja - ₹799',
    'remedial': 'Remedial Pooja - ₹999',
    'house-warming': 'House Warming Pooja - ₹1299',
    'success': 'Success Pooja - ₹699'
  };
  return poojaTypes[this.poojaType] || this.poojaType;
});

// Pre-save middleware to generate booking ID if not provided
poojaBookingSchema.pre('save', function (next) {
  if (!this.bookingId) {
    this.bookingId = `PB${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  next();
});

// Pre-save middleware to set amount based on pooja type
poojaBookingSchema.pre('save', function (next) {
  if (!this.amount) {
    const amounts = {
      'daily': 299,
      'special': 599,
      'festival': 799,
      'remedial': 999,
      'house-warming': 1299,
      'success': 699
    };
    this.amount = amounts[this.poojaType] || 299;
  }
  next();
});

// Method to check if booking is upcoming
poojaBookingSchema.methods.isUpcoming = function () {
  const now = new Date();
  const bookingDateTime = new Date(this.poojaDate);
  const [hours, minutes] = this.poojaTime.split(':');
  bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  return bookingDateTime > now && this.status === 'confirmed';
};

// Method to check if booking is today
poojaBookingSchema.methods.isToday = function () {
  const today = new Date();
  const bookingDate = new Date(this.poojaDate);

  return today.toDateString() === bookingDate.toDateString();
};

// Static method to get bookings by date range
poojaBookingSchema.statics.getBookingsByDateRange = function (startDate, endDate) {
  return this.find({
    poojaDate: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ poojaDate: 1, poojaTime: 1 });
};

// Static method to get upcoming bookings
poojaBookingSchema.statics.getUpcomingBookings = function () {
  const now = new Date();
  return this.find({
    poojaDate: { $gte: now },
    status: 'confirmed'
  }).sort({ poojaDate: 1, poojaTime: 1 });
};

module.exports = mongoose.model('PoojaBooking', poojaBookingSchema);

