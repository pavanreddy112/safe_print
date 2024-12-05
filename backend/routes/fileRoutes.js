const express = require('express');
const multer = require('multer');
const fileController = require('../controllers/fileController');

const router = express.Router();

// Multer configuration for file uploads
const upload = multer({ dest: 'uploads/' });

// Routes
router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/download/:fileKey', fileController.downloadFile);

module.exports = router;
