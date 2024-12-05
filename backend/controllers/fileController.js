const { uploadFileToS3, downloadFileFromS3 } = require('../utils/s3');
const crypto = require('crypto');
const path = require('path');

// Middleware to handle file uploads
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Encrypt file before uploading
    const encryptedFilePath = await encryptFile(req.file);

    // Upload the encrypted file to S3
    const fileUrl = await uploadFileToS3(
      { 
        path: encryptedFilePath, 
        originalname: req.file.originalname, 
        mimetype: req.file.mimetype 
      }, 
      'secure-uploads'
    );

    // Clean up the encrypted file locally
    cleanUpLocalFile(encryptedFilePath);

    return res.status(200).json({ message: 'File uploaded successfully', fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
};

// Download and decrypt file
exports.downloadFile = async (req, res) => {
  const { fileKey } = req.params;

  if (!fileKey) {
    return res.status(400).json({ message: 'File key is required' });
  }

  try {
    // Download file from S3
    const downloadPath = path.resolve('downloads');
    const downloadedFilePath = await downloadFileFromS3(fileKey, downloadPath);

    // Decrypt file
    const decryptedFilePath = await decryptFile(downloadedFilePath);

    // Clean up the downloaded file
    cleanUpLocalFile(downloadedFilePath);

    // Send the decrypted file to the user
    res.download(decryptedFilePath, err => {
      cleanUpLocalFile(decryptedFilePath); // Clean up the decrypted file after sending
      if (err) {
        console.error('Error sending file:', err);
      }
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: 'File download failed', error: error.message });
  }
};

// Utility to encrypt a file locally
const encryptFile = async (file) => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  const inputPath = file.path;
  const encryptedPath = `${file.path}.enc`;

  return new Promise((resolve, reject) => {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(encryptedPath);

    input.pipe(cipher).pipe(output);

    output.on('finish', () => {
      resolve(encryptedPath);
    });

    output.on('error', reject);
  });
};

// Utility to decrypt a file locally
const decryptFile = async (encryptedFilePath) => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.randomBytes(32); // Replace with the same key used for encryption
  const iv = crypto.randomBytes(16); // Replace with the same IV used for encryption

  const decryptedPath = encryptedFilePath.replace('.enc', '.dec');

  return new Promise((resolve, reject) => {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const input = fs.createReadStream(encryptedFilePath);
    const output = fs.createWriteStream(decryptedPath);

    input.pipe(decipher).pipe(output);

    output.on('finish', () => {
      resolve(decryptedPath);
    });

    output.on('error', reject);
  });
};

// Utility to clean up local files
const cleanUpLocalFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) console.error('Error deleting local file:', err);
  });
};
