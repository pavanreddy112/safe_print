const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Authentication middleware
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id); // Fetch user details

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        next(); // Pass control to the next middleware
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
};

// Authorization middleware for role-based access
const authorize = (roles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    // Check if the user has the required role
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    next(); // Pass control to the next middleware
};

module.exports = { authenticate, authorize };
