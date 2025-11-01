import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// Routes imports - ONLY USE EXISTING ROUTES
import cakeRoutes from './routes/cakes.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
// Remove customCakeRoutes import if it exists

const app = express();

// FIXED: Better CORS configuration for mobile and production
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000', 
      'https://valentine-cake-house.vercel.app',
      'https://valentine-cake-house-git-main-cashkid12s-projects.vercel.app',
      /\.vercel\.app$/, // All Vercel deployments
      /\.render\.com$/, // All Render deployments
      /\.netlify\.app$/ // All Netlify deployments
    ];
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(pattern => {
      if (typeof pattern === 'string') return origin === pattern;
      if (pattern instanceof RegExp) return pattern.test(origin);
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ONLY USE EXISTING ROUTES - don't add customCakeRoutes if it doesn't exist
app.use('/api/cakes', cakeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
// Remove app.use('/api/custom-cakes', customCakeRoutes) if it exists

// Root API route
app.get('/api', (req, res) => {
  res.json({ 
    message: '🎂 Valentine Cake House API',
    version: '1.0.0',
    status: 'Running 🚀',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      cakes: '/api/cakes',
      orders: '/api/orders', 
      admin: '/api/admin',
      auth: '/api/auth',
      health: '/api/health'
    }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    uptime: process.uptime()
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/valentine_cake_house')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Handle undefined routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found' 
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('🚨 Server Error:', error);
  
  // CORS errors
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy: Origin not allowed'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});
