# 🏠 Local Development Setup Guide

This guide will help you set up the Govardhan Thal Restaurant project for local development.

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (Local installation or MongoDB Atlas account)
3. **Git** (to clone the repository)

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd Govardhan

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

### 2. Database Setup

**Keep your existing MongoDB Atlas connection!**
- No need to set up a new database
- Your existing production MongoDB Atlas connection will work for local development
- Just make sure your `.env` file has the correct `MONGODB_URI` from your production setup

### 3. Environment Configuration

#### Backend Environment
```bash
# Copy the local environment template
cd backend
cp local-env-example.txt .env

# Edit the .env file with your configuration
```

**Required Environment Variables:**
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Keep your existing production values for these:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/govardhanthal?retryWrites=true&w=majority
# JWT_SECRET=your-existing-production-jwt-secret
# CLOUDINARY_CLOUD_NAME=your-existing-cloud-name
# CLOUDINARY_API_KEY=your-existing-api-key
# CLOUDINARY_API_SECRET=your-existing-api-secret
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-existing-email@gmail.com
# EMAIL_PASS=your-existing-app-password
# EMAIL_FROM=noreply@govardhanthal.com
# CONTACT_EMAIL=info@govardhanthal.com
# ADMIN_EMAIL=admin@govardhanthal.com
# ADMIN_PASSWORD=your-existing-admin-password
```

#### Frontend Environment
```bash
# Copy the local environment template
cd Frontend
cp local-env-example.txt .env.local

# Edit the .env.local file with your configuration
```

**Required Environment Variables:**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_NODE_ENV=development
```

### 4. Start the Development Servers

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
# Server will start on http://localhost:5000
```

#### Terminal 2 - Frontend Server
```bash
cd Frontend
npm run dev
# Frontend will start on http://localhost:5173
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Admin Panel**: http://localhost:5173/admin/login

## 🔧 Configuration Details

### Backend Configuration

The backend has been updated to allow local development:

1. **CORS Settings**: Updated to allow localhost origins
2. **API Endpoints**: All hardcoded URLs changed to localhost
3. **Environment Variables**: Configured for local development

### Frontend Configuration

The frontend has been updated to use local backend:

1. **API Base URL**: Changed to `http://localhost:5000/api`
2. **Environment Variables**: Using local development settings
3. **Service Layer**: Updated to use local endpoints

## 🧪 Testing the Setup

### Test API Endpoints
```bash
# Run the test script
node test-api-fixes.js
```

### Test Frontend-Backend Connection
1. Open http://localhost:5173
2. Try to register a new user
3. Check if the backend receives the request at http://localhost:5000/api

## 🔐 Admin Credentials

Use your existing production admin credentials:
- **Email**: admin@govardhanthal.com (your existing admin email)
- **Password**: Your existing admin password

## 📁 Project Structure

```
Govardhan/
├── backend/                 # Node.js/Express backend
│   ├── .env                # Backend environment variables
│   ├── server.js           # Main server file
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   └── middleware/         # Custom middleware
├── Frontend/               # React frontend
│   ├── .env.local          # Frontend environment variables
│   ├── src/                # React source code
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
└── LOCAL_SETUP_GUIDE.md    # This file
```

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure your MongoDB Atlas connection string is correct in your `.env` file

#### 2. CORS Error
```
Access to fetch at 'http://localhost:5000/api' from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Solution**: The CORS settings have been updated to allow localhost origins

#### 3. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Kill the process using port 5000 or change the port in .env

#### 4. Frontend Can't Connect to Backend
```
ERR_CONNECTION_REFUSED
```
**Solution**: Make sure the backend server is running on port 5000

### Debug Steps

1. **Check Backend Server**: Visit http://localhost:5000/api/health
2. **Check Frontend**: Visit http://localhost:5173
3. **Check Console**: Open browser dev tools for errors
4. **Check Network**: Monitor network requests in browser dev tools

## 🔄 Switching Between Local and Production

### To Use Local Development:
- Use the environment files provided in this guide
- All URLs are already configured for localhost

### To Use Production:
- Change `VITE_API_BASE_URL` in Frontend/.env.local to production URL
- Change `API_BASE_URL` in Frontend/src/context/AppContext.jsx to production URL
- Update CORS settings in backend/server.js

## 📚 Additional Resources

- [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [React Documentation](https://reactjs.org/docs/)
- [Vite Documentation](https://vitejs.dev/guide/)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that both servers are running on the correct ports
5. Review the console logs for specific error messages

---

**Happy Coding! 🚀**
