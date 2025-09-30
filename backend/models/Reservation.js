const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  partySize: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  specialRequests: {
    type: String,
    trim: true,
    default: ''
  },
  otp: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  otpExpiry: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
reservationSchema.index({ phone: 1, date: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Reservation', reservationSchema);
