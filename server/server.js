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
      'http://localhost:5173'
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// CORS configuration
app.use(cors({
  origin: [
    'https://agrilink-ai.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
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
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => {
  console.log('❌ MongoDB Connection Error:', err);
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('send_message', (data) => {
    socket.to(data.room).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Basic routes
app.get('/api', (req, res) => {
  res.json({ 
    message: '🌾 AgriLink AI Backend is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
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

// Handle undefined routes - FIXED: Use express built-in 404 handler
app.use((req, res, next) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(error.errors).map(e => e.message)
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
  
Available Routes:
✅ GET  /api          - Server status
✅ GET  /api/health   - Health check
✅ POST /api/auth/*   - Authentication routes
✅ GET  /api/users/*  - User management
✅ GET  /api/products - Product marketplace
✅ POST /api/products - Add products (Farmers)
  `);
});
