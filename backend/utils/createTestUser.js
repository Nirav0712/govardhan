const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.email);
      return;
    }

    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: `999${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      isVerified: true
    });

    await testUser.save();
    console.log('✅ Test user created successfully:', testUser.email);
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: password123');

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createTestUser();
