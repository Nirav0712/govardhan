const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String, // Cloudinary URL
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  ingredients: {
    type: [String],
    default: []
  },
  allergens: {
    type: [String],
    default: []
  },
  preparationTime: {
    type: Number, // in minutes
    default: 15
  }
}, {
  timestamps: true
});

// Index for better query performance
menuSchema.index({ category: 1 });
menuSchema.index({ isAvailable: 1 });
menuSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Menu', menuSchema);
