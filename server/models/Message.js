const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create room name from sender and receiver IDs
messageSchema.statics.getRoomName = function(user1, user2) {
  return [user1, user2].sort().join('_');
};

// Get conversations for a user
messageSchema.statics.getConversations = async function(userId) {
  const messages = await this.find({
    $or: [{ sender: userId }, { receiver: userId }]
  })
    .populate('sender', 'name profile')
    .populate('receiver', 'name profile')
    .sort({ createdAt: -1 });

  // Group by conversation
  const conversations = {};
  
  for (const message of messages) {
    const otherUser = message.sender._id.toString() === userId ? message.receiver : message.sender;
    const room = this.getRoomName(userId, otherUser._id.toString());
    
    if (!conversations[room]) {
      // Count unread messages for this conversation
      const unreadCount = await this.countDocuments({
        room: room,
        receiver: userId,
        read: false
      });
      
      conversations[room] = {
        _id: room,
        participant: otherUser,
        lastMessage: message.content,
        lastMessageTime: message.createdAt,
        unread: unreadCount
      };
    }
  }

  return Object.values(conversations);
};

module.exports = mongoose.model('Message', messageSchema);
