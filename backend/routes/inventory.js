const express = require('express');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const Inventory = require('../models/Inventory');
const cloudinary = require('../config/cloudinary');
const upload = require('../middleware/upload');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Upload image to Cloudinary
const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'govardhan-thal/inventory',
        transformation: [
          { width: 400, height: 400, crop: 'fill', quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(file.buffer);
  });
};

// Get all inventory items (Admin only)
router.get('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { category, lowStock, search } = req.query;
    const query = {};

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by low stock
    if (lowStock === 'true') {
      query.isLowStock = true;
    }

    // Search by name
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Inventory.find(query)
      .sort({ name: 1 });

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching inventory'
    });
  }
});

// Get inventory categories
router.get('/categories', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const categories = await Inventory.distinct('category');
    
    res.json({
      success: true,
      categories: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

// Get inventory statistics
router.get('/stats', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const totalItems = await Inventory.countDocuments();
    const lowStockItems = await Inventory.countDocuments({ isLowStock: true });
    const totalStock = await Inventory.aggregate([
      { $group: { _id: null, total: { $sum: '$kg' } } }
    ]);
    
    const categoryStats = await Inventory.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalKg: { $sum: '$kg' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalItems,
        lowStockItems,
        totalStock: totalStock[0]?.total || 0,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Get inventory stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching inventory statistics'
    });
  }
});

// Create inventory item (Admin only)
router.post('/', authenticate, authorizeAdmin, upload.single('img'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('kg').isNumeric().withMessage('KG must be a number'),
  body('category').notEmpty().withMessage('Category is required')
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    // Upload image to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(req.file);

    const { name, kg, category, unit, minStock, maxStock, notes } = req.body;

    const inventoryItem = new Inventory({
      name,
      kg: parseFloat(kg),
      img: cloudinaryResult.secure_url,
      category,
      unit: unit || 'kg',
      minStock: minStock ? parseFloat(minStock) : 0,
      maxStock: maxStock ? parseFloat(maxStock) : 1000,
      notes: notes || ''
    });

    await inventoryItem.save();

    res.json({
      success: true,
      message: 'Inventory item created successfully',
      data: inventoryItem
    });
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating inventory item'
    });
  }
});

// Update inventory item (Admin only)
router.put('/:id', authenticate, authorizeAdmin, upload.single('img'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('kg').isNumeric().withMessage('KG must be a number'),
  body('category').notEmpty().withMessage('Category is required')
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

    const { name, kg, category, unit, minStock, maxStock, notes } = req.body;
    
    const updateData = {
      name,
      kg: parseFloat(kg),
      category,
      unit: unit || 'kg',
      minStock: minStock ? parseFloat(minStock) : 0,
      maxStock: maxStock ? parseFloat(maxStock) : 1000,
      notes: notes || ''
    };

    // If new image is uploaded, upload to Cloudinary
    if (req.file) {
      const cloudinaryResult = await uploadToCloudinary(req.file);
      updateData.img = cloudinaryResult.secure_url;
    }

    const inventoryItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: inventoryItem
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating inventory item'
    });
  }
});

// Delete inventory item (Admin only)
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const inventoryItem = await Inventory.findByIdAndDelete(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting inventory item'
    });
  }
});

// Update stock quantity (Admin only)
router.patch('/:id/stock', authenticate, authorizeAdmin, [
  body('kg').isNumeric().withMessage('KG must be a number')
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

    const { kg, notes } = req.body;
    
    const inventoryItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      { 
        kg: parseFloat(kg),
        notes: notes || '',
        lastUpdated: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: inventoryItem
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating stock'
    });
  }
});

module.exports = router;