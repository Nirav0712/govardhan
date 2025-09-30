const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  kg: {
    type: Number,
    required: true,
    min: 0
  },
  img: {
    type: String, // Cloudinary URL
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    default: 'General'
  },
  unit: {
    type: String,
    required: true,
    default: 'kg'
  },
  minStock: {
    type: Number,
    default: 0
  },
  maxStock: {
    type: Number,
    default: 1000
  },
  isLowStock: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Index for better query performance
inventorySchema.index({ name: 'text', category: 1 });
inventorySchema.index({ isLowStock: 1 });

// Pre-save middleware to check if stock is low
inventorySchema.pre('save', function(next) {
  this.isLowStock = this.kg <= this.minStock;
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
