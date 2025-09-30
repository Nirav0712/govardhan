@echo off
REM Govardhan Thal Restaurant - Production Build Script for Windows
REM This script prepares the application for deployment

echo 🚀 Building Govardhan Thal Restaurant for Production...

REM Check if we're in the right directory
if not exist "Frontend\package.json" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

if not exist "backend\package.json" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

REM Build Frontend
echo 📦 Building Frontend...
cd Frontend
call npm install
call npm run build
echo ✅ Frontend build completed

REM Go back to root
cd ..

REM Install backend dependencies
echo 📦 Installing Backend dependencies...
cd backend
call npm install --production
echo ✅ Backend dependencies installed

REM Go back to root
cd ..

echo 🎉 Production build completed!
echo.
echo 📁 Files ready for deployment:
echo    - Frontend: Upload contents of 'Frontend\dist\' to your web server
echo    - Backend: Upload entire 'backend\' folder to your server
echo.
echo 📋 Next steps:
echo    1. Set up environment variables (see DEPLOYMENT_GUIDE.md)
echo    2. Configure your database (MongoDB Atlas recommended)
echo    3. Set up external services (Cloudinary, Email, Google Maps)
echo    4. Upload files to your hosting provider
echo    5. Test the deployed application
echo.
echo 🔗 Domain: https://www.govardhanthal.com

pause
