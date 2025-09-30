const express = require('express');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const Reservation = require('../models/Reservation');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Generate OTP function
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create reservation with OTP
router.post('/create', [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('partySize').isInt({ min: 1, max: 20 }).withMessage('Party size must be between 1 and 20')
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

    const { name, phone, email, date, time, partySize, specialRequests = '' } = req.body;
    
    // Generate OTP and set expiry (5 minutes from now)
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Create reservation
    const reservation = new Reservation({
      name,
      phone,
      email,
      date: new Date(date),
      time,
      partySize,
      specialRequests,
      otp,
      otpExpiry
    });

    await reservation.save();

    res.json({
      success: true,
      message: 'Reservation created. OTP sent for verification.',
      data: {
        reservationId: reservation._id,
        otp: otp, // For testing - remove in production
        message: `OTP: ${otp} (Valid for 5 minutes)`
      }
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating reservation'
    });
  }
});

// Verify OTP and confirm reservation
router.post('/verify-otp', [
  body('reservationId').notEmpty().withMessage('Reservation ID is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
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

    const { reservationId, otp } = req.body;
    
    // Trim whitespace from OTP
    const trimmedOtp = otp.trim();

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check if OTP is expired
    if (new Date() > reservation.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please create a new reservation.'
      });
    }

    // Check if already verified
    if (reservation.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Reservation already verified'
      });
    }

    // Verify OTP
    if (reservation.otp !== trimmedOtp) {
      console.log('OTP Verification Failed:');
      console.log('Stored OTP:', reservation.otp);
      console.log('Received OTP:', otp);
      console.log('Trimmed OTP:', trimmedOtp);
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Mark as verified
    reservation.isVerified = true;
    reservation.status = 'pending'; // Ready for admin approval
    await reservation.save();
    
    console.log('OTP Verification Success for reservation:', reservation._id);

    res.json({
      success: true,
      message: 'Reservation verified successfully! Thank you for booking with us.',
      data: {
        reservation: {
          id: reservation._id,
          name: reservation.name,
          date: reservation.date,
          time: reservation.time,
          partySize: reservation.partySize,
          status: reservation.status
        }
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying OTP'
    });
  }
});

// Get all reservations (Admin only)
router.get('/admin/all', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {
      isVerified: true // Only show verified reservations to admin
    };

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search by name, phone, or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const reservations = await Reservation.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Reservation.countDocuments(query);

    res.json({
      success: true,
      data: {
        reservations,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reservations'
    });
  }
});

// Get today's reservations
router.get('/today', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const reservations = await Reservation.find({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    }).sort({ time: 1 });

    res.json({
      success: true,
      data: {
        reservations,
        total: reservations.length
      }
    });
  } catch (error) {
    console.error('Get today reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching today\'s reservations'
    });
  }
});

// Approve reservation (Admin only)
router.patch('/admin/:id/approve', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    reservation.status = 'confirmed';
    await reservation.save();

    res.json({
      success: true,
      message: 'Reservation approved successfully',
      data: { reservation }
    });
  } catch (error) {
    console.error('Approve reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving reservation'
    });
  }
});

// Reject reservation (Admin only)
router.patch('/admin/:id/reject', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    reservation.status = 'rejected';
    await reservation.save();

    res.json({
      success: true,
      message: 'Reservation rejected successfully',
      data: { reservation }
    });
  } catch (error) {
    console.error('Reject reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting reservation'
    });
  }
});

// Delete reservation (Admin only)
router.delete('/admin/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      message: 'Reservation deleted successfully'
    });
  } catch (error) {
    console.error('Delete reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting reservation'
    });
  }
});

// Resend OTP for reservation
router.post('/resend-otp', [
  body('reservationId')
    .notEmpty()
    .withMessage('Reservation ID is required')
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

    const { reservationId } = req.body;
    
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check if already verified
    if (reservation.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Reservation already verified'
      });
    }

    // Generate new OTP
    const newOtp = generateOTP();
    reservation.otp = newOtp;
    reservation.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await reservation.save();

    res.json({
      success: true,
      message: 'New OTP sent successfully',
      data: {
        otp: newOtp, // For testing - remove in production
        message: `New OTP: ${newOtp} (Valid for 5 minutes)`
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

module.exports = router;
