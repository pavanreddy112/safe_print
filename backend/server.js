// server.js
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");  // Import CORS
require("dotenv").config();
const cookieParser = require("cookie-parser");


const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Passport Google OAuth setup
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // Ensure this URL matches the one you configured in Google Developer Console
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user exists in the database
        let user = await User.findOne({ email: profile._json.email });
        if (!user) {
          user = new User({
            email: profile._json.email,
            name: profile.displayName,
          });
          await user.save();
        }

        return done(null, user); // Proceed with the user authentication
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// Serialize and deserialize user to store in session
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Initialize Express app
const app = express();

// Enable CORS for all origins

app.use(
    cors({
        origin: "http://localhost:5173", // Allow only this origin
        credentials: true, // Allow cookies and credentials
    })
);
app.use(cookieParser()); app.use(cookieParser()); 
// Middleware
app.use(express.json());  // Add middleware to parse JSON
app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-session-secret", // Use a strong secret in production
      resave: false,
      saveUninitialized: true,
      cookie: {
        httpOnly: true, // Helps prevent XSS attacks
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        maxAge: 24 * 60 * 60 * 1000, // 1 day expiration
      },
    })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// Import routes
const authRoutes = require("./routes/authRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const userRoutes = require("./routes/userRoutes");

// Use routes
app.use("/api", authRoutes); 
app.use("/auth", userRoutes);// Auth routes for Google login and other auth-related actions
app.use("/api/owner", ownerRoutes); // Owner-specific routes
app.use("/api/user", userRoutes); // User-specific routes
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
