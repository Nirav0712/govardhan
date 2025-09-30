const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: function() {
      return this.provider === 'local';
    },
    unique: true,
    sparse: true, // Allows multiple null values
    trim: true,
    validate: {
      validator: function(v) {
        // Skip phone validation for Google users without phone
        if (this.provider === 'google' && !v) {
          return true;
        }
        // If phone is provided, validate format
        return !v || /^[6-9]\d{9}$/.test(v);
      },
      message: 'Please enter a valid 10-digit phone number'
    }
  },
  password: {
    type: String,
    required: function() {
      return this.provider === 'local';
    },
    validate: {
      validator: function(v) {
        // Only validate minlength if provider is local or if password is provided
        if (this.provider === 'google' && !v) {
          return true; // Skip validation for Google users without password
        }
        return !v || v.length >= 6;
      },
      message: 'Password must be at least 6 characters'
    },
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    select: false
  },
  otpExpires: {
    type: Date,
    select: false
  },
  profileImage: {
    type: String,
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  preferences: {
    dietaryRestrictions: [String],
    favoriteCategories: [String],
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance (removed duplicate indexes)
userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate OTP method
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return otp;
};

// Verify OTP method
userSchema.methods.verifyOTP = function(otp) {
  return this.otp === otp && this.otpExpires > new Date();
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.otp;
  delete userObject.otpExpires;
  return userObject;
};

// Static method to find user by phone or email
userSchema.statics.findByCredentials = async function(identifier, password) {
  const user = await this.findOne({
    $or: [
      { phone: identifier },
      { email: identifier }
    ]
  }).select('+password');
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
  
  return user;
};

module.exports = mongoose.model('User', userSchema);
