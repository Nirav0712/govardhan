const express = require('express');
const { body, validationResult } = require('express-validator');
const { generateToken, authenticate } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Register user (Step 1: Send OTP)
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Phone number already registered'
        });
      }
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Create user but mark as unverified
    const user = new User({
      name,
      email,
      phone,
      password,
      otp,
      otpExpires,
      isVerified: false
    });

    await user.save();

    console.log('User created with OTP:', { 
      userId: user._id, 
      otp: user.otp, 
      otpExpires: user.otpExpires,
      isVerified: user.isVerified 
    });

    res.status(201).json({
      success: true,
      message: 'OTP sent to your phone. Please verify to complete registration.',
      data: {
        userId: user._id,
        phone: phone,
        otp: otp, // In production, send via SMS service
        message: `Your OTP is: ${otp} (Valid for 5 minutes)`
      }
    });

  } catch (error) {
    console.error('User registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number already registered'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Verify Registration OTP
router.post('/verify-registration-otp', [
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId, otp } = req.body;

    console.log('OTP Verification Debug:', { userId, otp });

    const user = await User.findById(userId).select('+otp +otpExpires');

    console.log('User found:', { 
      userId: user?._id, 
      isVerified: user?.isVerified, 
      hasOtp: !!user?.otp, 
      hasOtpExpires: !!user?.otpExpires,
      otpExpires: user?.otpExpires,
      currentTime: new Date()
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User already verified'
      });
    }

    if (!user.otp || !user.otpExpires) {
      console.log('No OTP found:', { 
        otp: user.otp, 
        otpExpires: user.otpExpires,
        userFields: Object.keys(user.toObject())
      });
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new one.'
      });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Registration completed successfully!',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Registration OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP verification'
    });
  }
});

// Verify OTP
router.post('/verify-otp', [
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phone, otp } = req.body;

    const user = await User.findOne({ phone }).select('+otp +otpExpires');
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.verifyOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Phone number verified successfully',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP verification'
    });
  }
});

// Resend OTP
router.post('/resend-otp', [
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phone } = req.body;

    const user = await User.findOne({ phone });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // In development, return OTP for testing
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 New OTP for ${phone}: ${otp}`);
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phone: user.phone,
        ...(process.env.NODE_ENV === 'development' && { testOtp: otp })
      }
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resending OTP'
    });
  }
});

// Login user
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    const user = await User.findByCredentials(email, password);
    
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your phone number first'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('User login error:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid credentials'
    });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user data'
    });
  }
});

// Extend session (refresh last activity)
router.post('/extend-session', authenticate, async (req, res) => {
  try {
    // Update user's last login time
    await req.user.updateLastLogin();
    
    res.json({
      success: true,
      message: 'Session extended successfully',
      data: {
        lastActivity: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Extend session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during session extension'
    });
  }
});

// Logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// Google OAuth authentication
router.post('/google', async (req, res) => {
  try {
    const { token, email, name, photoURL } = req.body;

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Google authentication data'
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists, update last login
      user.lastLogin = new Date();
      if (photoURL) user.avatar = photoURL;
      await user.save();

      // Generate JWT token
      const jwtToken = generateToken(user._id, user.role);

      return res.json({
        success: true,
        message: 'Google login successful',
        token: jwtToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      });
    } else {
      // Create new user from Google data
      const newUser = new User({
        name: name || 'Google User',
        email: email,
        phone: '', // Google users might not have phone initially
        password: '', // No password for Google users
        isVerified: true, // Google users are pre-verified
        avatar: photoURL || '',
        provider: 'google',
        lastLogin: new Date()
      });

      await newUser.save();

      // Generate JWT token
      const jwtToken = generateToken(newUser._id, newUser.role);

      return res.status(201).json({
        success: true,
        message: 'Google signup successful',
        token: jwtToken,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar
        }
      });
    }
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google authentication'
    });
  }
});

module.exports = router;
