const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const createTestUser = async () => {
  await connectDB();

  const phone = '9876543210';
  const password = 'password123';

  try {
    let user = await User.findOne({ phone });

    if (user) {
      console.log(`Test user with phone ${phone} already exists.`);
    } else {
      user = new User({
        name: 'Test User',
        phone,
        password,
        email: `${phone}@temp.com`,
        role: 'user',
        isVerified: true,
      });
      await user.save();
      console.log(`✅ Test user created successfully: ${phone}`);
    }
    console.log(`📱 Phone: ${phone}`);
    console.log(`🔑 Password: ${password}`);
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestUser();
