const express = require('express');
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
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
      cb('Error: Images only!');
    }
  }
});

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { category, county, search, minPrice, maxPrice } = req.query;
    let filter = { available: true };

    if (category) filter.category = category;
    if (county) filter['location.county'] = new RegExp(county, 'i');
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
      quantity: parseFloat(req.body.quantity)
    };

    // Add image paths if files were uploaded
    if (req.files) {
      productData.images = req.files.map(file => file.path);
    }

    // AI Price Suggestion (basic implementation)
    const suggestedPrice = await calculateSuggestedPrice(productData);
    productData.suggestedPrice = suggestedPrice;

    const product = new Product(productData);
    await product.save();

    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
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
    if (req.files) {
      updateData.images = req.files.map(file => file.path);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

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

// AI Price Suggestion Function (Basic)
async function calculateSuggestedPrice(productData) {
  // This is a basic implementation - you can integrate with market data APIs
  const basePrice = productData.price;
  const seasonalAdjustment = getSeasonalAdjustment();
  const locationAdjustment = getLocationAdjustment(productData.location);
  
  return basePrice * seasonalAdjustment * locationAdjustment;
}

function getSeasonalAdjustment() {
  // Simple seasonal adjustment
  const month = new Date().getMonth();
  // Assume higher prices in off-seasons
  return month >= 3 && month <= 8 ? 1.1 : 0.9; // Example adjustment
}

function getLocationAdjustment(location) {
  // Adjust based on location (urban vs rural)
  const urbanCounties = ['nairobi', 'mombasa', 'kisumu'];
  return urbanCounties.includes(location?.county?.toLowerCase()) ? 1.15 : 1.0;
}

module.exports = router;