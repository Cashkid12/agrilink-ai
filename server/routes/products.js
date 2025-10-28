const express = require('express');
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Images only!'));
    }
  }
});

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { category, county, search, minPrice, maxPrice, farmer } = req.query;
    let filter = { available: true };

    if (category) filter.category = category;
    if (county) filter['location.county'] = new RegExp(county, 'i');
    if (farmer) filter.farmer = farmer;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    const products = await Product.find(filter)
      .populate('farmer', 'name profile')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmer', 'name profile rating');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Increment view count
    product.views = (product.views || 0) + 1;
    await product.save();
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new product (Farmers only)
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'farmer') {
      return res.status(403).json({ message: 'Only farmers can add products' });
    }

    const productData = {
      ...req.body,
      farmer: req.user.userId,
      price: parseFloat(req.body.price),
      quantity: parseFloat(req.body.quantity),
      initialQuantity: parseFloat(req.body.quantity) // Store initial quantity
    };

    // Add image paths if files were uploaded
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => file.filename);
    }

    // Parse location if it's a string
    if (typeof productData.location === 'string') {
      try {
        productData.location = JSON.parse(productData.location);
      } catch (e) {
        // If parsing fails, use the original structure from form data
        productData.location = {
          county: req.body['location[county]'],
          subcounty: req.body['location[subcounty]']
        };
      }
    }

    // AI Price Suggestion
    const suggestedPrice = await calculateSuggestedPrice(productData);
    productData.suggestedPrice = suggestedPrice;

    // AI Recommendation
    productData.aiRecommendation = {
      score: Math.random() * 0.3 + 0.7, // Random score between 0.7-1.0
      message: getAIRecommendation(productData)
    };

    const product = new Product(productData);
    await product.save();

    // Populate farmer info
    await product.populate('farmer', 'name profile');

    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns the product
    if (product.farmer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updateData = { ...req.body };
    
    // Handle price and quantity conversion
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.quantity) updateData.quantity = parseFloat(updateData.quantity);

    // Handle location parsing
    if (updateData.location && typeof updateData.location === 'string') {
      try {
        updateData.location = JSON.parse(updateData.location);
      } catch (e) {
        updateData.location = {
          county: req.body['location[county]'],
          subcounty: req.body['location[subcounty]']
        };
      }
    }

    // Add new images if files were uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.filename);
      updateData.images = [...(product.images || []), ...newImages];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('farmer', 'name profile');

    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.farmer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get farmer's products
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.params.farmerId })
      .populate('farmer', 'name profile')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// AI Price Suggestion Function
async function calculateSuggestedPrice(productData) {
  const basePrice = productData.price;
  
  // Market adjustment factors
  const seasonalAdjustment = getSeasonalAdjustment();
  const locationAdjustment = getLocationAdjustment(productData.location);
  const categoryAdjustment = getCategoryAdjustment(productData.category);
  
  const suggestedPrice = basePrice * seasonalAdjustment * locationAdjustment * categoryAdjustment;
  
  return Math.round(suggestedPrice * 100) / 100; // Round to 2 decimal places
}

function getSeasonalAdjustment() {
  const month = new Date().getMonth();
  // Higher prices in off-seasons (basic example)
  return month >= 3 && month <= 8 ? 1.1 : 0.9;
}

function getLocationAdjustment(location) {
  const urbanCounties = ['nairobi', 'mombasa', 'kisumu'];
  return urbanCounties.includes(location?.county?.toLowerCase()) ? 1.15 : 1.0;
}

function getCategoryAdjustment(category) {
  const adjustments = {
    vegetables: 1.0,
    fruits: 1.1,
    flowers: 1.2,
    grains: 0.9,
    herbs: 1.15,
    other: 1.0
  };
  return adjustments[category] || 1.0;
}

function getAIRecommendation(productData) {
  const recommendations = [
    `Great price for ${productData.name} in ${productData.location?.county || 'your area'}!`,
    `Consider bulk pricing for better sales.`,
    `High demand expected next week for ${productData.category}.`,
    `Perfect timing for seasonal ${productData.name}.`,
    `Competitive pricing in your area.`,
    `Fresh ${productData.name} always attracts buyers quickly.`,
    `Consider organic certification for better pricing.`
  ];
  return recommendations[Math.floor(Math.random() * recommendations.length)];
}

module.exports = router;
