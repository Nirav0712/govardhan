const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const Menu = require('../models/Menu');

const router = express.Router();

// Get all orders (Admin only)
router.get('/admin', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.menuItem', 'name image')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const totalOrders = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          hasNext: page < Math.ceil(totalOrders / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

// Get order statistics (Admin only)
router.get('/admin/stats', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    const statusStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const todayStats = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      },
      {
        $group: {
          _id: null,
          todayOrders: { $sum: 1 },
          todayRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overall: stats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 },
        statusBreakdown: statusStats,
        today: todayStats[0] || { todayOrders: 0, todayRevenue: 0 }
      }
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order statistics'
    });
  }
});

// Get single order (Admin only)
router.get('/admin/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.menuItem', 'name image description')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
});

// Update order status (Admin only)
router.patch('/admin/:id/status', [
  authenticate,
  authorizeAdmin,
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'])
    .withMessage('Invalid status')
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

    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.updateStatus(status);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
});

// Create new order (User)
router.post('/', [
  authenticate,
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.menuItem')
    .isMongoId()
    .withMessage('Invalid menu item ID'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('orderType')
    .isIn(['DINE-IN', 'TAKEAWAY'])
    .withMessage('Invalid order type'),
  body('customerInfo.name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Customer name is required'),
  body('customerInfo.email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('customerInfo.phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Valid phone number is required')
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

    const { items, orderType, customerInfo, specialInstructions } = req.body;

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await Menu.findById(item.menuItem);
      if (!menuItem) {
        return res.status(400).json({
          success: false,
          message: `Menu item not found: ${item.menuItem}`
        });
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        menuItem: item.menuItem,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        total: itemTotal
      });
    }

    // Calculate charges
    const serviceChargeRate = orderType === 'DINE-IN' ? 0.10 : 0.05;
    const serviceCharge = subtotal * serviceChargeRate;
    const gstRate = 0.09;
    const gst = subtotal * gstRate;
    const totalAmount = subtotal + serviceCharge + gst;

    // Create order
    const order = new Order({
      orderNumber: Order.generateOrderNumber(),
      user: req.user._id,
      items: orderItems,
      orderType,
      subtotal,
      serviceCharge,
      gst,
      totalAmount,
      customerInfo,
      specialInstructions: specialInstructions || ''
    });

    await order.save();

    // Populate order details
    await order.populate('user', 'name email phone');
    await order.populate('items.menuItem', 'name image');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order'
    });
  }
});

// Get user's orders
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find({ user: req.user._id })
      .populate('items.menuItem', 'name image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const totalOrders = await Order.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          hasNext: page < Math.ceil(totalOrders / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

// Delete order (Admin only)
router.delete('/admin/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Find the order first
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Delete the order
    await Order.findByIdAndDelete(orderId);

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting order'
    });
  }
});

module.exports = router;