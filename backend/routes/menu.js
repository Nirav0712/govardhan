const express = require('express');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const Menu = require('../models/Menu');
const cloudinary = require('../config/cloudinary');
const upload = require('../middleware/upload');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const { category, search, available } = req.query;
    const query = {};

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by availability
    if (available !== undefined) {
      query.isAvailable = available === 'true';
    }

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const menuItems = await Menu.find(query)
      .sort({ category: 1, name: 1 });

    res.json({
      success: true,
      data: menuItems
    });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching menu'
    });
  }
});

// Get menu categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Menu.distinct('category');
    
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

// Upload image to Cloudinary
const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'govardhan-thal/menu',
        transformation: [
          { width: 800, height: 600, crop: 'fill', quality: 'auto' }
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

// Admin routes for menu management

// Create menu item
router.post('/admin', authenticate, authorizeAdmin, upload.single('image'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
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

    const { name, description, price, category, ingredients, allergens, preparationTime } = req.body;

    const menuItem = new Menu({
      name,
      description,
      price: parseFloat(price),
      category,
      image: cloudinaryResult.secure_url,
      ingredients: ingredients ? JSON.parse(ingredients) : [],
      allergens: allergens ? JSON.parse(allergens) : [],
      preparationTime: preparationTime ? parseInt(preparationTime) : 15
    });

    await menuItem.save();

    res.json({
      success: true,
      message: 'Menu item created successfully',
      data: menuItem
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating menu item'
    });
  }
});

// Update menu item
router.put('/admin/:id', authenticate, authorizeAdmin, upload.single('image'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
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

    const { name, description, price, category, ingredients, allergens, preparationTime } = req.body;
    
    const updateData = {
      name,
      description,
      price: parseFloat(price),
      category,
      ingredients: ingredients ? JSON.parse(ingredients) : [],
      allergens: allergens ? JSON.parse(allergens) : [],
      preparationTime: preparationTime ? parseInt(preparationTime) : 15
    };

    // If new image is uploaded, upload to Cloudinary
    if (req.file) {
      const cloudinaryResult = await uploadToCloudinary(req.file);
      updateData.image = cloudinaryResult.secure_url;
    }

    const menuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: menuItem
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating menu item'
    });
  }
});

// Delete menu item
router.delete('/admin/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndDelete(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Optional: Delete image from Cloudinary
    // const publicId = menuItem.image.split('/').pop().split('.')[0];
    // await cloudinary.uploader.destroy(`govardhan-thal/menu/${publicId}`);

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting menu item'
    });
  }
});

// Toggle menu item availability
router.patch('/admin/:id/toggle', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save();

    res.json({
      success: true,
      message: `Menu item ${menuItem.isAvailable ? 'enabled' : 'disabled'} successfully`,
      data: menuItem
    });
  } catch (error) {
    console.error('Toggle menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling menu item'
    });
  }
});

module.exports = router;