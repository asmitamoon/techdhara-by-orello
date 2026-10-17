const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REDIRECT_URI,
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value.toLowerCase();
    const [role, source] = (req.query.state || '').split('|');

    if (!role || !['VLE', 'INNOVATOR', 'AO', 'NO', 'GENERAL_USER'].includes(role)) {
      return done(new Error('Valid role parameter is required'), null);
    }

    // Step 1 — primary lookup by googleId (immutable, set for all post-migration Google users)
    let user = await User.findOne({ googleId: profile.id });

    // Step 2 — email fallback for migrated users who have no googleId yet
    if (!user) {
      user = await User.findOne({ email });
    }

    if (user) {
      if (user.isEmailUser && !user.isGoogleUser) {
        if (!user.isEmailVerified) {
          // Abandoned email registration (OTP never verified) — convert to Google account
          user.googleId = profile.id;
          user.isGoogleUser = true;
          user.isEmailUser = false;
          user.isEmailVerified = true;
          user.role = role;
          if (!user.fullName) {
            user.fullName = [profile.name?.givenName, profile.name?.familyName].filter(Boolean).join(' ') || null;
          }
          if (!user.profilePicture && profile.photos?.[0]?.value) {
            user.profilePicture = profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        }
        return done(new Error('This email is registered with password. Please login using email and password instead.'), null);
      }

      // Set googleId for migrated users on their first Google login
      if (!user.googleId) {
        user.googleId = profile.id;
      }

      if (!user.profilePicture && profile.photos?.[0]?.value) {
        user.profilePicture = profile.photos[0].value;
      }

      await user.save();
      return done(null, user);
    }

    // No account found — reject if coming from login page
    if (source === 'login') {
      return done(null, false, { message: 'no_account' });
    }

    user = await User.create({
      googleId: profile.id,
      email,
      isGoogleUser: true,
      isEmailVerified: true,
      role: role,
      fullName: [profile.name?.givenName, profile.name?.familyName].filter(Boolean).join(' ') || null,
      profilePicture: profile.photos?.[0]?.value || null
    });

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;