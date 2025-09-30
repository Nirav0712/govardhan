# Govardhan Thal Restaurant - Deployment Guide

## 🚀 Production Deployment on Hostinger

This guide will help you deploy your Govardhan Thal Restaurant Management System to Hostinger hosting.

### 📋 Prerequisites

1. **Hostinger Account** with:
   - Shared hosting or VPS plan
   - Node.js support
   - MongoDB database access (or MongoDB Atlas)

2. **Domain Setup**:
   - Domain: `https://www.govardhanthal.com`
   - SSL certificate (usually included with Hostinger)

### 🔧 Backend Deployment

#### 1. Environment Configuration

Create a `.env` file in the `backend` folder with the following variables:

```env
NODE_ENV=production
PORT=5000

# Database (use MongoDB Atlas for production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/govardhanthal?retryWrites=true&w=majority

# JWT Secrets (change these to secure random strings)
JWT_SECRET=your-super-secret-jwt-key-here
ADMIN_JWT_SECRET=your-admin-jwt-secret-key-here

# Frontend URL
FRONTEND_URL=https://www.govardhanthal.com

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@govardhanthal.com

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

#### 2. Database Setup

**Option A: MongoDB Atlas (Recommended)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your server IP address
5. Get connection string and update `MONGODB_URI`

**Option B: Hostinger MongoDB**
1. Create MongoDB database in Hostinger control panel
2. Update `MONGODB_URI` with your database details

#### 3. Upload Backend Files

1. Upload the entire `backend` folder to your server
2. Install dependencies:
   ```bash
   cd backend
   npm install --production
   ```

#### 4. Start Backend Server

```bash
# For development/testing
npm run dev

# For production
npm start
```

### 🎨 Frontend Deployment

#### 1. Build Frontend for Production

```bash
cd Frontend
npm install
npm run build
```

This creates a `dist` folder with optimized production files.

#### 2. Upload Frontend Files

1. Upload the contents of the `dist` folder to your domain's public folder
2. Configure your web server to serve the React app

#### 3. Configure Web Server

Create a `.htaccess` file in your public folder:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QR,L]
```

### 🔑 Required External Services

#### 1. Cloudinary (Image Storage)
1. Sign up at [Cloudinary](https://cloudinary.com)
2. Get your cloud name, API key, and API secret
3. Update the `.env` file with these credentials

#### 2. Email Service (Gmail SMTP)
1. Enable 2-factor authentication on your Gmail account
2. Generate an app password
3. Update email credentials in `.env` file

#### 3. Google Maps API
1. Get API key from [Google Cloud Console](https://console.cloud.google.com)
2. Enable Maps JavaScript API
3. Update `GOOGLE_MAPS_API_KEY` in `.env`

### 🔒 Security Checklist

- [ ] Change all default JWT secrets
- [ ] Use strong database passwords
- [ ] Enable SSL/HTTPS
- [ ] Set up proper CORS configuration
- [ ] Configure rate limiting
- [ ] Set up error monitoring

### 📱 Testing Deployment

1. **Frontend**: Visit `https://www.govardhanthal.com`
2. **Backend API**: Test `https://www.govardhanthal.com/api/health`
3. **Admin Panel**: Visit `https://www.govardhanthal.com/admin/login`
4. **User Features**: Test registration, login, menu, orders, reservations

### 🚨 Common Issues & Solutions

#### CORS Errors
- Ensure `FRONTEND_URL` is correctly set in backend `.env`
- Check that CORS is properly configured in `server.js`

#### Database Connection Issues
- Verify MongoDB connection string
- Check if database user has proper permissions
- Ensure server IP is whitelisted (for Atlas)

#### Email Not Working
- Check Gmail app password
- Verify SMTP settings
- Test email functionality

#### Images Not Uploading
- Verify Cloudinary credentials
- Check file size limits
- Ensure proper permissions

### 📊 Monitoring & Maintenance

1. **Log Monitoring**: Set up log monitoring for errors
2. **Database Backup**: Regular MongoDB backups
3. **SSL Certificate**: Monitor SSL certificate expiration
4. **Performance**: Monitor API response times
5. **Updates**: Keep dependencies updated

### 🆘 Support

If you encounter issues:
1. Check server logs for errors
2. Verify all environment variables
3. Test API endpoints individually
4. Check browser console for frontend errors

---

**Note**: This deployment guide assumes you're using Hostinger's shared hosting or VPS. For dedicated servers or other hosting providers, some steps may vary.
