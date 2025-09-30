// Example configuration file for production deployment
// Copy this to config.js and update with your actual values

module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'production',

  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/govardhanthal',
  
  // For production MongoDB Atlas:
  // MONGODB_URI: 'mongodb+srv://username:password@cluster.mongodb.net/govardhanthal?retryWrites=true&w=majority',

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this',
  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET || 'your-admin-jwt-secret-change-this',

  // Frontend Configuration
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://www.govardhanthal.com',

  // Cloudinary Configuration (for image uploads)
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
    API_KEY: process.env.CLOUDINARY_API_KEY || 'your-api-key',
    API_SECRET: process.env.CLOUDINARY_API_SECRET || 'your-api-secret'
  },

  // Email Configuration
  EMAIL: {
    HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    PORT: process.env.EMAIL_PORT || 587,
    USER: process.env.EMAIL_USER || 'your-email@gmail.com',
    PASS: process.env.EMAIL_PASS || 'your-app-password',
    FROM: process.env.EMAIL_FROM || 'noreply@govardhanthal.com'
  },

  // Google Maps API
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || 'your-google-maps-api-key'
};
