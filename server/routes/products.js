const express = require('express');
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');

const router = express.Router();

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
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new product (Farmers only) - FIXED FORM DATA PARSING
router.post('/', auth, async (req, res) => {
  try {
    console.log('=== ADD PRODUCT REQUEST ===');
    console.log('User ID:', req.user.userId);
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers['content-type']);

    // Check if user is a farmer
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'farmer') {
      return res.status(403).json({ message: 'Only farmers can add products' });
    }

    // Parse form data - handle both JSON and form-data
    const {
      name,
      category,
      description,
      price,
      quantity,
      unit,
      county,
      subcounty
    } = req.body;

    console.log('Parsed fields:', {
      name, category, description, price, quantity, unit, county, subcounty
    });

    // Validate required fields
    if (!name || !category || !description || !price || !quantity || !unit || !county || !subcounty) {
      return res.status(400).json({
        message: 'Missing required fields',
        missing: {
          name: !name,
          category: !category,
          description: !description,
          price: !price,
          quantity: !quantity,
          unit: !unit,
          county: !county,
          subcounty: !subcounty
        }
      });
    }

    // Create product data
    const productData = {
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      price: parseFloat(price),
      quantity: parseFloat(quantity),
      unit: unit.trim(),
      farmer: req.user.userId,
      location: {
        county: county.trim(),
        subcounty: subcounty.trim()
      },
      images: [] // Empty for now, we'll add image upload later
    };

    console.log('Final product data:', productData);

    // Add AI suggestions
    productData.suggestedPrice = productData.price * 1.1; // Simple 10% increase
    productData.aiRecommendation = {
      score: Math.random() * 0.3 + 0.7,
      message: `Great price for ${productData.name} in ${productData.location.county}!`
    };

    // Create and save product
    const product = new Product(productData);
    await product.save();

    // Populate farmer info for response
    await product.populate('farmer', 'name profile');

    console.log('✅ Product added successfully:', product._id);
    
    res.status(201).json({ 
      success: true,
      message: 'Product added successfully', 
      product 
    });

  } catch (error) {
    console.error('❌ Error adding product:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors
      });
    }
    
    res.status(500).json({ 
      message: 'Error adding product', 
      error: error.message
    });
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
    console.error('Error fetching product:', error);
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
    console.error('Error fetching farmer products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
