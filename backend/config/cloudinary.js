const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dqutwe474',
  api_key: process.env.CLOUDINARY_API_KEY || '186554387669824',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'qsl3dgPUo_YfTiXctAlYPnTosho'
});

module.exports = cloudinary;
