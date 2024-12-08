const express = require("express");
const { uploadFile, upload } = require("../controllers/fileController");

const router = express.Router();

// Route to upload files
router.post("/upload", upload.single("file"), uploadFile);

module.exports = router;
