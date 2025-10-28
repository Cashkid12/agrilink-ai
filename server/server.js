const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'https://agrilink-ai.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files statically
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agrilink-ai', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => {
  console.log('❌ MongoDB Connection Error:', err);
});

// Import and use routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));

// Try to import optional routes (messages and analytics)
try {
  app.use('/api/messages', require('./routes/messages'));
  console.log('✅ Messages routes loaded');
} catch (error) {
  console.log('⚠️ Messages routes not found, using fallback');
  app.use('/api/messages', (req, res) => {
    res.json({ message: 'Messages API coming soon' });
  });
}

try {
  app.use('/api/analytics', require('./routes/analytics'));
  console.log('✅ Analytics routes loaded');
} catch (error) {
  console.log('⚠️ Analytics routes not found, using fallback');
  app.use('/api/analytics', (req, res) => {
    res.json({ message: 'Analytics API coming soon' });
  });
}

// Basic routes
app.get('/api', (req, res) => {
  res.json({ 
    message: '🌾 AgriLink AI Backend is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      'GET /api',
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/users/:id',
      'GET /api/products',
      'POST /api/products'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('🚨 Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(error.errors).map(e => e.message)
    });
  }
  
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
🚀 AgriLink AI Server Started!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 Database: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌'}
  
Available Routes:
✅ GET  /api          - Server status
✅ GET  /api/health   - Health check  
✅ POST /api/auth/*   - Authentication
✅ GET  /api/users/*  - User management
✅ GET  /api/products - Product marketplace
✅ POST /api/products - Add products
✅ GET  /api/messages/* - Messaging
✅ GET  /api/analytics/* - Analytics

📱 Frontend: https://agrilink-ai.vercel.app
  `);
});
