const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken'); // Middleware for authentication
const Shop = require('../models/Shop');

// Search for shops by owner
router.get('/search', verifyToken, async (req, res) => {
    const { query } = req.query;
  
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required." });
    }
  
    try {
      
  
      // Search for shops where owner's name matches the query
      const shops = await Shop.find()
        .populate({
          path: 'owner',
          match: { name: { $regex: new RegExp(query, 'i') } }, // Match owner by name (case-insensitive)
          select: 'name email', // Only return specific fields from Owner
        })
        .limit(10);
  
      // Filter out shops where the owner does not match
      const filteredShops = shops.filter((shop) => shop.owner);
  
      
      res.json({ shops: filteredShops });
    } catch (error) {
      console.error("Error searching shops:", error);
      res.status(500).json({ message: "Error searching for shops.", error });
    }
  });
  
  

module.exports = router;
