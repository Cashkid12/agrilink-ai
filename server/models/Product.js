const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['vegetables', 'fruits', 'flowers', 'grains', 'herbs', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  suggestedPrice: {
    type: Number // AI suggested price
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ['kg', 'g', 'pieces', 'bunches', 'crates'],
    required: true
  },
  images: [{
    type: String
  }],
  location: {
    county: String,
    subcounty: String
  },
  available: {
    type: Boolean,
    default: true
  },
  aiRecommendation: {
    score: Number,
    message: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);