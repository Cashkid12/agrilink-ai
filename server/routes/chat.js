const express = require('express');
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');
const router = express.Router();

// Get conversations for a user
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get all messages where user is either sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate('sender', 'name profile')
      .populate('receiver', 'name profile')
      .sort({ createdAt: -1 });

    // Group by conversation
    const conversations = {};
    messages.forEach(message => {
      const otherUser = message.sender._id.toString() === userId ? message.receiver : message.sender;
      const room = Message.getRoomName(userId, otherUser._id.toString());
      
      if (!conversations[room]) {
        conversations[room] = {
          _id: room,
          participant: otherUser,
          lastMessage: message.content,
          lastMessageTime: message.createdAt,
          unread: false // You can implement unread count logic
        };
      }
    });

    res.json(Object.values(conversations));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get messages for a specific room
router.get('/:room', auth, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room })
      .populate('sender', 'name profile')
      .populate('receiver', 'name profile')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send a message
router.post('/', auth, async (req, res) => {
  try {
    const { room, receiver, content } = req.body;
    
    const message = new Message({
      room,
      sender: req.user.userId,
      receiver,
      content
    });

    await message.save();
    
    // Populate sender info for real-time response
    await message.populate('sender', 'name profile');
    await message.populate('receiver', 'name profile');

    res.status(201).json({ message: 'Message sent', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark messages as read
router.put('/:room/read', auth, async (req, res) => {
  try {
    await Message.updateMany(
      { 
        room: req.params.room,
        receiver: req.user.userId,
        read: false
      },
      { $set: { read: true } }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
