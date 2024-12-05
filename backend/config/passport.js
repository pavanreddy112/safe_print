const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");  // Adjust path based on your structure

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback", // Adjust URL based on your server
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in the database
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          // If user does not exist, create a new user
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
          });
        }
        return done(null, user);  // Return the user object
      } catch (err) {
        return done(err, null);  // Handle errors
      }
    }
  )
);

// Serialize user to save user ID in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user to retrieve user info from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);  // Handle errors
  }
});

module.exports = passport;
