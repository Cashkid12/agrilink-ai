const express = require('express');
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');
const Message = require('../models/Message');
const router = express.Router();

// Get farmer analytics
router.get('/farmer', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Check if user is a farmer
    const user = await User.findById(userId);
    if (user.role !== 'farmer') {
      return res.status(403).json({ message: 'Only farmers can access analytics' });
    }

    // Get farmer's products
    const products = await Product.find({ farmer: userId });
    
    // Calculate stats
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.available).length;
    const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
    const monthlyRevenue = products.reduce((sum, p) => sum + (p.price * (p.initialQuantity - p.quantity)), 0);
    
    // Get message stats
    const totalMessages = await Message.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }]
    });

    // Popular products (mock data for now)
    const popularProducts = products
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(p => ({
        name: p.name,
        views: p.views || 0,
        sales: Math.floor(Math.random() * 20) // Mock sales data
      }));

    res.json({
      stats: {
        totalProducts,
        activeProducts,
        totalViews,
        monthlyRevenue,
        totalMessages,
        responseRate: Math.floor(Math.random() * 30) + 70 // Mock data
      },
      popularProducts,
      aiInsights: generateAIInsights(products)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate AI insights based on products
function generateAIInsights(products) {
  const insights = [];
  
  if (products.length > 0) {
    const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
    
    insights.push({
      type: 'market_trend',
      title: 'Market Trend',
      message: `Your average price of KES ${avgPrice.toFixed(2)} is competitive in the market.`,
      color: 'blue'
    });

    insights.push({
      type: 'price_suggestion',
      title: 'Price Suggestion',
      message: 'Consider seasonal pricing adjustments for better sales.',
      color: 'green'
    });

    insights.push({
      type: 'inventory_tip',
      title: 'Inventory Tip',
      message: 'Restock popular items to meet demand.',
      color: 'purple'
    });
  }

  return insights;
}

module.exports = router;