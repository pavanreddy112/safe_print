const express = require('express');
const multer = require('multer');
const s3 = require('../config/s3Config'); // Import the configured S3 instance
const Message = require('../models/Message'); // Assuming Message schema is used
const { authenticate } = require('../middlewares/authMiddleware'); // Correctly import the authentication middleware
const Document = require('../models/Document'); // Assuming you have a Document model to store documents
const router = express.Router();
const User = require('../models/User'); 
const verifyToken = require("../middlewares/verifyToken");

// Route to get all received documents for a specific owner
router.get('/received-documents/:ownerId', verifyToken, async (req, res) => {
  try {
    const { ownerId } = req.params;

    console.log(`Fetching documents for ownerId: ${ownerId}`);

    if (!ownerId) {
      return res.status(400).json({ message: 'Owner ID is required.' });
    }

    // Query the Message collection for all documents with the specified receiverId
    const messages = await Message.find({ receiverId: ownerId, receiver: 'Owner' })
      .select('fileUrl sender senderId message timestamp') // Select fields to return
      .sort({ timestamp: -1 }); // Sort by timestamp (newest first)

    if (!messages || messages.length === 0) {
      return res.status(404).json({ message: 'No documents found.' });
    }

    console.log(`Found ${messages.length} documents for ownerId: ${ownerId}`);

    // Fetch sender details from the User collection for each message senderId
    const documentsWithSender = await Promise.all(messages.map(async (msg) => {
      // Fetch sender information from the User collection by senderId
      const sender = await User.findById(msg.senderId).select('name username');

      // Check if sender was found and log details
      const senderName = sender ? sender.name : 'Unknown';
      const senderUsername = sender ? sender.username : 'Unknown';
      console.log(`Sender Name: ${senderName}, Sender Username: ${senderUsername}`);

      // Return the document with sender information
      return {
        ...msg.toObject(), // Convert mongoose document to plain JavaScript object
        senderName: senderName, // Add sender's name
        senderUsername: senderUsername, // Add sender's username
      };
    }));

    // Return the documents with sender details
    res.status(200).json({
      message: 'Documents fetched successfully.',
      documents: documentsWithSender,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// Set up multer for file handling (memory storage to directly handle file buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to handle file upload from user to owner
router.post('/upload', upload.single('file'), async (req, res) => {
  const { userId, shopId, ownerId } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  if (!userId || !shopId || !ownerId) {
    return res.status(400).json({ message: 'User ID, Shop ID, and Owner ID are required.' });
  }

  try {
    // Log the file and data for debugging
    console.log('Received file upload request...');
    console.log('File received:', req.file.originalname);
    console.log('User ID:', userId);
    console.log('Shop ID:', shopId);
    console.log('Owner ID:', ownerId);

    // Generate a unique filename based on current timestamp
    const fileName = Date.now() + '-' + req.file.originalname;

    // S3 upload parameters
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME, // Bucket name from environment variable
      Key: fileName, // Unique key for the file
      Body: req.file.buffer, // File data from the request
      ContentType: req.file.mimetype, // Content type (MIME type) of the file
    };

    // Log the S3 upload parameters
    console.log('Preparing to upload to S3...');
    console.log('S3 Upload Params:', uploadParams);

    // Upload the file to S3 using the AWS SDK
    s3.upload(uploadParams, async (err, data) => {
      if (err) {
        console.error('Error uploading file to S3:', err);
        return res.status(500).json({ message: 'Failed to upload file. Please try again.' });
      }

      // Log the successful upload
      console.log('File uploaded successfully to S3');
      const fileUrl = data.Location; // The URL of the uploaded file

      // Save the file URL, userId, and ownerId in the Message model
      const newMessage = new Message({
        sender: 'User',
        senderId: userId,
        receiver: 'Owner',
        receiverId: ownerId,
        message: `File uploaded: ${fileUrl}`,
        fileUrl: fileUrl, // Save the file URL
        timestamp: new Date(),
      });

      await newMessage.save();

      res.status(200).json({
        message: 'File uploaded successfully.',
        fileUrl: fileUrl,
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Failed to upload file. Please try again.' });
  }
});
router.delete('/delete-document/:documentId', async (req, res) => {
  const { documentId } = req.params;

  try {
    // Fetch the document by ID from the Message collection
    const document = await Message.findById(documentId);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const fileUrl = document.fileUrl; // Get the file URL from the document

    if (!fileUrl) {
      return res.status(400).json({ message: 'File URL not found in the document' });
    }

    // Extract the S3 key from the file URL
    const s3Key = new URL(fileUrl).pathname.substring(1); // Get the S3 object key (adjust if needed)

    // Set the parameters for the S3 deleteObject
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME, // Use the bucket name from environment variables
      Key: s3Key, // The key is the filename from the URL
    };

    // Delete the object from the S3 bucket
    await s3.deleteObject(params).promise();
    console.log(`Document with ID ${documentId} deleted from S3`);

    // Delete the document from the Message collection
    await Message.findByIdAndDelete(documentId);

    console.log(`Document with ID ${documentId} deleted from the database`);

    // Send success response
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error.message || error);
    res.status(500).json({ message: 'Error deleting document', error });
  }
});


module.exports = router;
