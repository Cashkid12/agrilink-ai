const express = require('express');
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const router = express.Router();

// Get chat history
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

// Save message
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

    res.status(201).json({ message: 'Message sent', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;