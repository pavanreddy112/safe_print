const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Owner = require("../models/Owner"); // Assuming you have an Owner model
const router = express.Router();

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
