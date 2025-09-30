const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const initAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log(`📧 Email: ${existingAdmin.email || 'N/A'}`);
      console.log(`📱 Phone: ${existingAdmin.phone}`);
      return;
    }

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@govardhanthal.com',
      phone: process.env.ADMIN_PHONE || '9999999999',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      isVerified: true,
      isActive: true
    });

    await admin.save();
    
    console.log('✅ Admin user created successfully');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`📱 Phone: ${admin.phone}`);
    console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log('⚠️  Please change the default password after first login');

  } catch (error) {
    console.error('❌ Error initializing admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
  }
};

// Run if this file is executed directly
if (require.main === module) {
  initAdmin();
}

module.exports = initAdmin;
