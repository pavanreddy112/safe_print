const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport"); // For Google OAuth
require("../config/passport"); // Configure Passport.js
const User = require("../models/User"); // Assuming a User model exists
const router = express.Router();
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// User login route (POST)
// In userRoutes.js file

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate credentials
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate a JWT
       // Ensure correct role in the JWT for regular login
const token = jwt.sign(
  { id: user._id, role: user.role || "user" },  // Default to "user" if no role is set
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);


        // Send the token to the client
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Error during user login:", error);
        res.status(500).json({ message: "Server error" });
    }
});



// Google OAuth login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// router.get(
//     "/google/callback",
//     passport.authenticate("google", { failureRedirect: "/login" }),
//     (req, res) => {
//         // Generate JWT from user info
//         const token = jwt.sign(
//             { id: req.user.id, email: req.user.email },
//             process.env.JWT_SECRET,
//             { expiresIn: "1h" }
//         );

//         "session_token", token, {
//           httpOnly: true,     // Prevent client-side JavaScript access
//           secure: false,      // Set to true if using HTTPS
//           sameSite: "Strict", // Adjust based on your use case
//         });
        
//         res.redirect("/user-dashboard"); // Redirect to user dashboard
//     }
// );

// User dashboard route (protected)
// User dashboard route (protected)
// userRoutes.js

 // Google OAuth Signup Route (POST)
 passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract email and name from Google profile
          const { email, name } = profile._json;
  
          // Check if user already exists
          let user = await User.findOne({ email });
          if (!user) {
            // Create new user from Google profile
            user = new User({
              email,
              name, // Store the name from Google profile
              googleId: profile.id, // Store Google ID
            });
            await user.save();
          }
  
          return done(null, user); // Continue with authentication
        } catch (error) {
          console.error("Error during Google OAuth signup:", error);
          done(error, null);
        }
      }
    )
  );
  router.get(
    "/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],  // Define the Google data you want to access
    })
  );
  
  // Google OAuth callback route
  router.get(
    "/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/login",  // Redirect here if authentication fails
    }),
    async (req, res) => {
      // If authentication is successful, you can process the user info
      const { email, displayName } = req.user;
  
      try {
        // Check if the user already exists in the database
        let user = await User.findOne({ email });
        
        if (!user) {
          // Create a new user if they don't exist in the database
          user = new User({
            email,
            name: displayName,
          });
          await user.save();
        }
  
        // Here, you can either store the user session or send a response with the user data
        res.redirect("http://localhost:5173/api/user/login");  // Redirect to the login page on successful login
      } catch (error) {
        console.error("Error during Google authentication", error);
        res.status(500).send("Internal Server Error");
      }
    }
  );
const verifyToken = require("../middlewares/verifyToken");



const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.error("No Authorization header provided.");
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract the token
  if (!token) {
    console.error("No token found in Authorization header.");
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Debugging log
    req.user = decoded; // Attach decoded payload to req.user
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};


module.exports = isAuthenticated;



router.get("/user-dashboard", isAuthenticated, async (req, res) => {
  try {
    console.log("Decoded user info from token:", req.user); // Debugging log

    // Check if the role is "user"
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    // Fetch the user's data from the database
    const user = await User.findById(req.user.id, "email name");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Welcome to your dashboard!",
      user: {
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error fetching user dashboard data:", error);
    res.status(500).json({ message: "Server error" });
  }
});



  

  
  
module.exports = router;
