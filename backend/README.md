# Govardhan Thal Restaurant - Backend API

This is the backend API for the Govardhan Thal Restaurant application.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update the MongoDB Atlas connection string
   - Set your JWT secret key

4. **Initialize Admin User**
   ```bash
   node utils/initAdmin.js
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/govardhan_thal?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Admin Configuration
ADMIN_EMAIL=admin@govardhanthal.com
ADMIN_PASSWORD=admin123
ADMIN_PHONE=9999999999

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-otp` - Verify phone number with OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update admin profile
- `PUT /api/admin/change-password` - Change admin password
- `GET /api/admin/dashboard-stats` - Get dashboard statistics
- `POST /api/admin/logout` - Admin logout

### Users (Admin only)
- `GET /api/users/admin/users` - Get all users
- `GET /api/users/admin/:id` - Get user by ID
- `PATCH /api/users/admin/:id/status` - Update user status

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/categories` - Get menu categories
- `POST /api/menu/admin` - Create menu item (Admin)

### Orders
- `GET /api/orders` - Get all orders (Admin)

### Reservations
- `GET /api/reservations/admin/all` - Get all reservations (Admin)
- `GET /api/reservations/today` - Get today's reservations (Admin)

### Inventory
- `GET /api/inventory` - Get inventory items (Admin)
- `POST /api/inventory` - Create inventory item (Admin)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🗄️ Database

The application uses MongoDB Atlas with the following collections:
- `users` - User accounts and admin users
- `menuitems` - Restaurant menu items
- `orders` - Customer orders
- `reservations` - Table reservations
- `inventory` - Restaurant inventory

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- CORS protection
- Input validation
- Helmet security headers

## 🧪 Testing

### Admin Login Test
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@govardhanthal.com", "password": "admin123"}'
```

### User Registration Test
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "phone": "9876543210", "password": "password123"}'
```

## 📝 Default Admin Credentials

- **Phone**: 9999999999
- **Password**: admin123
- **Email**: admin@govardhanthal.com

⚠️ **Important**: Change the default admin password after first login!

## 🚀 Deployment

1. Set `NODE_ENV=production`
2. Update MongoDB connection string
3. Set secure JWT secret
4. Configure CORS for production domain
5. Use PM2 or similar process manager

## 📞 Support

For issues and questions, please contact the development team.
