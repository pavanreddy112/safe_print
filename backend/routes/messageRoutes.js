// backend/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Owner = require('../models/Owner');

// Send a message
// routes/messagesRoutes.js
router.post('/send', async (req, res) => {
    try {
      const { senderId, receiverUsername, message } = req.body;
      if (!senderId || !receiverUsername || !message) {
        return res.status(400).json({ error: "All fields are required." });
      }
  
      // Find the receiver (Owner) by username
      const receiver = await Owner.findOne({ username: receiverUsername });
      if (!receiver) {
        return res.status(404).json({ error: "Owner not found" });
      }
  
      // Create a new message
      const newMessage = new Message({
        sender: 'User',
        senderId,
        receiver: 'Owner',
        receiverId: receiver._id,
        message,
      });
      await newMessage.save();
  
      res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
      console.error("Error in /send:", error);
      res.status(500).json({ error: "Server error", details: error.message });
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
