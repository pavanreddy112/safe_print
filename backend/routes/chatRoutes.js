const express = require('express');
const { getChatRoom, addMessage } = require('../controllers/chatController');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.get('/:roomId', verifyToken, getChatRoom);
router.post('/', verifyToken, addMessage);

module.exports = router;
