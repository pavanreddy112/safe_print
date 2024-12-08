const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Owner = require('../models/Owner');
const verifyToken = require('../middlewares/verifyToken');

// Send a message
router.post('/messages', async (req, res) => {
  const { sender, senderId, receiver, receiverId, message } = req.body;

  // Validate the required fields
  if (!sender || !senderId || !receiver || !receiverId || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    let senderUser, receiverUser;

    // Check sender existence
    if (sender === 'User') {
      senderUser = await User.findById(senderId);
      if (!senderUser) {
        return res.status(404).json({ error: 'Sender (User) not found' });
      }
    } else if (sender === 'Owner') {
      senderUser = await Owner.findById(senderId);
      if (!senderUser) {
        return res.status(404).json({ error: 'Sender (Owner) not found' });
      }
    }

    // Check receiver existence
    if (receiver === 'User') {
      receiverUser = await User.findById(receiverId);
      if (!receiverUser) {
        return res.status(404).json({ error: 'Receiver (User) not found' });
      }
    } else if (receiver === 'Owner') {
      receiverUser = await Owner.findById(receiverId);
      if (!receiverUser) {
        return res.status(404).json({ error: 'Receiver (Owner) not found' });
      }
    }

    // Create the new message
    const newMessage = new Message({
      sender,
      senderId,
      receiver,
      receiverId,
      message,
      timestamp: new Date(),
    });

    // Save the message to the database
    await newMessage.save();

    res.status(201).json({ message: 'Message sent successfully', data: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Fetch conversations for an owner
router.get('/owner/:ownerId/conversations', async (req, res) => {
  const { ownerId } = req.params;

  try {
    const conversations = await Message.find({ receiver: 'Owner', receiverId: ownerId }).populate('senderId', 'username');
    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching conversations', details: err });
  }
});

// Reply to a message
router.post('/reply', async (req, res) => {
  const { sender, senderId, receiverId, message } = req.body;

  try {
    const newMessage = new Message({
      sender,
      senderId,
      receiver: 'User',
      receiverId,
      message,
    });
    await newMessage.save();

    res.status(201).json({ message: 'Reply sent successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error sending reply', details: err });
  }
});

module.exports = router;
