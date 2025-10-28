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
    required: true,
    min: 0
  },
  suggestedPrice: {
    type: Number, // AI suggested price
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  initialQuantity: {
    type: Number, // Store initial quantity for analytics
    min: 0
  },
  unit: {
    type: String,
    enum: ['kg', 'g', 'pieces', 'bunches', 'crates', 'bags'],
    required: true
  },
  images: [{
    type: String // For base64 images or URLs
  }],
  location: {
    county: {
      type: String,
      required: true
    },
    subcounty: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  available: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  aiRecommendation: {
    score: {
      type: Number,
      min: 0,
      max: 1
    },
    message: String
  },
  tags: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set initialQuantity if not set
  if (!this.initialQuantity) {
    this.initialQuantity = this.quantity;
  }
  
  // Generate tags from name and category
  if (this.name && this.category) {
    this.tags = [
      this.name.toLowerCase(),
      this.category.toLowerCase(),
      ...this.name.toLowerCase().split(' '),
      ...this.description.toLowerCase().split(' ').slice(0, 5) // First 5 words from description
    ].filter((tag, index, array) => 
      tag.length > 2 && array.indexOf(tag) === index
    );
  }
  
  next();
});

// Static method to get products by farmer
productSchema.statics.findByFarmer = function(farmerId) {
  return this.find({ farmer: farmerId })
    .populate('farmer', 'name profile')
    .sort({ createdAt: -1 });
};

// Static method to get available products with filters
productSchema.statics.findAvailable = function(filters = {}) {
  const query = { available: true, ...filters };
  return this.find(query)
    .populate('farmer', 'name profile rating')
    .sort({ createdAt: -1 });
};

// Instance method to check if product is low in stock
productSchema.methods.isLowStock = function() {
  return this.quantity < (this.initialQuantity * 0.2); // Less than 20% of initial quantity
};

// Instance method to get stock percentage
productSchema.methods.getStockPercentage = function() {
  if (!this.initialQuantity) return 100;
  return Math.round((this.quantity / this.initialQuantity) * 100);
};

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
  return `KES ${this.price.toLocaleString()}`;
});

// Virtual for formatted quantity
productSchema.virtual('formattedQuantity').get(function() {
  return `${this.quantity.toLocaleString()} ${this.unit}`;
});

// Index for better performance
productSchema.index({ farmer: 1, createdAt: -1 });
productSchema.index({ category: 1, available: 1 });
productSchema.index({ 'location.county': 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
