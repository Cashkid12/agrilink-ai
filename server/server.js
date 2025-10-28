const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io configuration
const io = socketIo(server, {
  cors: {
    origin: [
      'https://agrilink-ai.vercel.app',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Enhanced CORS configuration
app.use(cors({
  origin: [
    'https://agrilink-ai.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agrilink-ai', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => {
  console.log('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('📊 MongoDB connected to database:', mongoose.connection.db.databaseName);
});

mongoose.connection.on('error', (err) => {
  console.log('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

// Socket.io for real-time messaging
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // User joins with their user ID
  socket.on('join_user', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`👤 User ${userId} joined with socket ${socket.id}`);
  });

  // Join a chat room
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`🚪 User ${socket.id} joined room ${room}`);
  });

  // Handle sending messages
  socket.on('send_message', async (data) => {
    try {
      console.log('💬 Message received:', data);
      
      // Import Message model
      const Message = require('./models/Message');
      const message = new Message({
        room: data.room,
        sender: data.sender,
        receiver: data.receiver,
        content: data.content
      });
      
      await message.save();
      await message.populate('sender', 'name profile');
      
      // Broadcast to room
      socket.to(data.room).emit('receive_message', {
        ...data,
        _id: message._id,
        sender: message.sender,
        createdAt: message.createdAt
      });
      
      // Send confirmation to sender
      socket.emit('message_sent', { 
        success: true, 
        messageId: message._id 
      });
      
    } catch (error) {
      console.error('❌ Error handling message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    socket.to(data.room).emit('user_typing', {
      userId: data.userId,
      typing: true
    });
  });

  socket.on('typing_stop', (data) => {
    socket.to(data.room).emit('user_typing', {
      userId: data.userId,
      typing: false
    });
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    // Remove user from connected users
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`👤 User ${userId} disconnected`);
        break;
      }
    }
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const chatRoutes = require('./routes/chat');
const analyticsRoutes = require('./routes/analytics');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);

// Basic routes
app.get('/api', (req, res) => {
  res.json({ 
    message: '🌾 AgriLink AI Backend is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Server info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'AgriLink AI Backend',
    version: '1.0.0',
    description: 'Agriculture Marketplace API',
    features: [
      'User Authentication',
      'Product Management', 
      'Real-time Chat',
      'Image Upload',
      'AI Recommendations',
      'Analytics Dashboard'
    ],
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      chat: '/api/chat',
      analytics: '/api/analytics'
    }
  });
});

// Handle undefined routes
app.use((req, res, next) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /api',
      'GET /api/health', 
      'GET /api/info',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/users/:id',
      'GET /api/products',
      'POST /api/products',
      'GET /api/chat/conversations',
      'GET /api/analytics/farmer'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('🚨 Global Error Handler:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(error.errors).map(e => e.message)
    });
  }
  
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired'
    });
  }

  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? {} : error.message
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
🚀 AgriLink AI Server Started!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 Database: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌'}
🕒 Started at: ${new Date().toISOString()}
  
Available Routes:
✅ GET  /api          - Server status
✅ GET  /api/health   - Health check  
✅ GET  /api/info     - Server information
✅ POST /api/auth/*   - Authentication routes
✅ GET  /api/users/*  - User management
✅ GET  /api/products - Product marketplace
✅ POST /api/products - Add products (Farmers)
✅ GET  /api/chat/*   - Real-time messaging
✅ GET  /api/analytics/* - Analytics dashboard

📱 Frontend: https://agrilink-ai.vercel.app
🔗 Socket.IO: Connected and ready
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  
  // Close MongoDB connection
  await mongoose.connection.close();
  console.log('📊 MongoDB connection closed.');
  
  // Close HTTP server
  server.close(() => {
    console.log('🚀 HTTP server closed.');
    process.exit(0);
  });
});

module.exports = app;
