const express = require("express");
const multer = require("multer");
const aws = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const Document = require("../models/Document");
const verifyToken = require("../middlewares/verifyToken");
const router = express.Router();

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Multer setup for file upload
const upload = multer({ storage: multer.memoryStorage() });

// Upload a document
router.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  const { ownerId, shopId } = req.body;
  if (!req.file || !ownerId || !shopId) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const fileName = `${uuidv4()}-${req.file.originalname}`;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };

  try {
    const data = await s3.upload(params).promise();
    const document = await Document.create({
      userId: req.user.id,
      ownerId,
      shopId,
      fileName,
      fileUrl: data.Location,
    });

    res.status(201).json({ message: "File uploaded successfully.", document });
  } catch (error) {
    console.error("S3 upload error:", error);
    res.status(500).json({ message: "File upload failed." });
  }
});

// Fetch documents for an owner
router.get("/owner-documents", verifyToken, async (req, res) => {
  try {
    const documents = await Document.find({ ownerId: req.user.id });
    res.status(200).json({ documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ message: "Failed to fetch documents." });
  }
});

// Print and delete document
router.post("/print", verifyToken, async (req, res) => {
  const { documentId } = req.body;

  try {
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    // Simulate print action (frontend will handle print UI)
    setTimeout(async () => {
      const params = { Bucket: process.env.S3_BUCKET_NAME, Key: document.fileName };
      await s3.deleteObject(params).promise();
      await Document.deleteOne({ _id: documentId });

      // Emit socket event for deletion notification
      const io = req.app.get("io");
      io.to(document.ownerId).emit("documentDeleted", { documentId });

      console.log("Document deleted successfully after print.");
    }, 30000); // 30 seconds

    res.status(200).json({ message: "Document print started." });
  } catch (error) {
    console.error("Error during print:", error);
    res.status(500).json({ message: "Failed to process print." });
  }
});

module.exports = router;
