// backend/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true, // Either 'User' or 'Owner'
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'sender', // Reference to User or Owner collection
    required: true,
  },
  receiver: {
    type: String,
    required: true, // Either 'User' or 'Owner'
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'receiver', // Reference to User or Owner collection
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', messageSchema);
