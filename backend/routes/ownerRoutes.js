const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Owner = require("../models/Owner"); // Assuming you have an Owner model
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const QRCode = require('qrcode');
// Middleware: Check if the owner is authenticated using JWT
const isAuthenticated = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.owner = decoded; // Store decoded info (like owner id) in the request object
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
};
router.get("/qr-code/shop-id", verifyToken, async (req, res) => {
  try {
    const { shopName, _id } = req.owner; // Assuming req.owner has owner details
    const qrData = { shopId: _id, shopName };

    // Generate QR code as a data URL
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

    res.status(200).json({ qrCode });
  } catch (error) {
    console.error("Error generating QR code with Shop ID:", error);
    res.status(500).json({ error: "Failed to generate QR code with Shop ID." });
  }
});

// Generate QR Code with Shop Name
router.get('/generate-qr-code/shop-name', verifyToken, async (req, res) => {
  try {
    const { shopName } = req.owner;
    if (!shopName) {
      return res.status(400).json({ message: "Shop name not found" });
    }

    // Generate the QR code logic here.
    res.status(200).json({ message: `QR Code generated for ${shopName}` });
  } catch (error) {
    console.error("Error generating QR code with Shop Name:", error);
    res.status(500).json({ message: "Error generating QR code", error });
  }
});
// Owner Login Route (POST)
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Validate credentials
        const owner = await Owner.findOne({ username });
        if (!owner) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, owner.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // Generate a JWT
        const token = jwt.sign(
            { id: owner._id, role: "owner" },
            process.env.JWT_SECRET,
            { expiresIn: "1h" } // You can adjust the expiration time as needed
        );

        // Send the token to the client
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Error during owner login:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Protected route for owner dashboard
router.get("/owner-dashboard", isAuthenticated, async (req, res) => {
    try {
      // Log the ownerId from the session/token to confirm it is being passed correctly
      console.log('Owner ID from session:', req.owner.id);
  
      // Fetch the owner's data using the ID from the JWT
      const owner = await Owner.findById(req.owner.id, "name shopName username");
  
      if (!owner) {
        return res.status(404).json({ message: "Owner not found" });
      }
  
      // Return the owner data
      res.json({
        message: "Welcome to the owner dashboard!",
        owner: {
            _id: owner._id,
          username: owner.username,
          name: owner.name,
          shopName: owner.shopName,
        },
      });
    } catch (error) {
      console.error("Error fetching owner dashboard data:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
// Logout Route (Client-side should delete the token)
router.post("/logout", (req, res) => {
    res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
