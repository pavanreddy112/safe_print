const express = require('express');
const { getChatRoom, addMessage } = require('../controllers/chatController');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.get('/:roomId', verifyToken, getChatRoom);
router.post('/messages', async (req, res) => {
    const { senderId, receiverId, message } = req.body;

    if (!senderId || !receiverId || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const newMessage = await Message.create({
            senderId,
            receiverId,
            content: message,
            timestamp: new Date(),
        });

        res.status(201).json({ message: 'Message sent successfully', data: newMessage });
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
