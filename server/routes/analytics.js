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
    
    if (products.length === 0) {
      return res.json({
        hasData: false,
        message: 'No products found. Add products to see analytics.'
      });
    }

    // Calculate stats
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.available).length;
    const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
    const potentialRevenue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    
    // Get message stats
    const totalMessages = await Message.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }]
    });

    // Popular products
    const popularProducts = products
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(p => ({
        name: p.name,
        views: p.views || 0,
        price: p.price,
        quantity: p.quantity,
        available: p.available
      }));

    res.json({
      hasData: true,
      stats: {
        totalProducts,
        activeProducts,
        totalViews,
        potentialRevenue,
        totalMessages,
        responseRate: Math.floor(Math.random() * 30) + 70 // Mock for now
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
  
  if (products.length === 0) return insights;

  const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
  const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
  const activeProducts = products.filter(p => p.available).length;

  if (totalViews === 0) {
    insights.push({
      type: 'info',
      title: 'Getting Started',
      message: 'Your products are live! Share your listings to get more views.',
      color: 'blue'
    });
  } else if (totalViews < 10) {
    insights.push({
      type: 'tip',
      title: 'Increase Visibility',
      message: 'Consider adding better photos and descriptions to attract more buyers.',
      color: 'green'
    });
  } else {
    insights.push({
      type: 'success',
      title: 'Good Engagement',
      message: `Your products have ${totalViews} total views. Keep it up!`,
      color: 'green'
    });
  }

  if (activeProducts < 3) {
    insights.push({
      type: 'suggestion',
      title: 'Expand Your Offerings',
      message: 'Add more product variety to attract different types of buyers.',
      color: 'purple'
    });
  }

  insights.push({
    type: 'market',
    title: 'Price Analysis',
    message: `Your average price of KES ${avgPrice.toFixed(2)} is competitive in the market.`,
    color: 'blue'
  });

  return insights;
}

// Get buyer analytics (basic for now)
router.get('/buyer', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Basic buyer stats
    const messageCount = await Message.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }]
    });

    const contactedFarmers = await Message.distinct('receiver', {
      sender: userId
    });

    res.json({
      hasData: messageCount > 0,
      stats: {
        messagesSent: messageCount,
        farmersContacted: contactedFarmers.length,
        activeConversations: Math.floor(Math.random() * 5) + 1 // Mock data
      },
      insights: [
        {
          type: 'info',
          title: 'Buyer Tips',
          message: 'Contact multiple farmers to compare prices and quality.',
          color: 'blue'
        },
        {
          type: 'tip',
          title: 'Best Practices',
          message: 'Build relationships with trusted farmers for better deals.',
          color: 'green'
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
