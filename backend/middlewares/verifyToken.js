// middlewares/verifyToken.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies.session_token;
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No session token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store user info in request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Invalid token:", error);
    res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

module.exports = verifyToken;
