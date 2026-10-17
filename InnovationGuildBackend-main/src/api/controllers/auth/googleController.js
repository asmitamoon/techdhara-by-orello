const passport = require('passport');
const { createTokens, saveRefreshToken } = require('../../../utils/jwt');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const googleLogin = (req, res, next) => {
  const { role, source } = req.query;

  if (!role || !['VLE', 'INNOVATOR', 'AO', 'NO', 'GENERAL_USER'].includes(role)) {
    return next(new AppError('Valid role parameter is required', 400));
  }

  // Encode source into state so passport strategy can read it after OAuth redirect
  const state = source === 'login' ? `${role}|login` : role;

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state
  })(req, res, next);
};

const googleCallback = catchAsync(async (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user, info) => {
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (err) {
      return res.redirect(`${frontendURL}/login?googleError=${encodeURIComponent(err.message || 'Google authentication failed')}`);
    }

    if (!user) {
      const message = info?.message === 'no_account'
        ? 'No account found. Please register first.'
        : 'Google authentication failed';
      return res.redirect(`${frontendURL}/login?googleError=${encodeURIComponent(message)}`);
    }

    try {
      const registrationComplete = user.registrationComplete;

      user.lastLogin = new Date();
      await user.save();

      const { accessToken, refreshToken } = createTokens(user);

      await saveRefreshToken(user._id, refreshToken, req);

      // res.cookie('refreshToken', refreshToken, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === 'production',
      //   sameSite: 'strict',
      //   maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      // });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
      const params = new URLSearchParams({
        accessToken,
        registrationComplete: String(registrationComplete),
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        status: user.status,
        fullName: user.fullName || '',
        profilePicture: user.profilePicture || ''
      });
      res.redirect(`${frontendURL}/auth/google/callback?${params}`);
    } catch (error) {
      return res.redirect(`${frontendURL}/login?googleError=${encodeURIComponent('Failed to process Google authentication')}`);
    }
  })(req, res, next);
});


module.exports = {
  googleLogin,
  googleCallback
};