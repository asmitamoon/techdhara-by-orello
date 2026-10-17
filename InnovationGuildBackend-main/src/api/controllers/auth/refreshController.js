const { verifyRefreshToken, createTokens, hashToken } = require('../../../utils/jwt');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const User = require('../../../models/User');
const RefreshToken = require('../../../models/RefreshToken');
const VleProfile = require('../../../models/VleProfile');
const AoProfile = require('../../../models/AoProfile');
const InnovatorProfile = require('../../../models/InnovatorProfile');
const NodalOrgProfile = require('../../../models/NodalOrgProfile');
const GeneralUserProfile = require('../../../models/GeneralUserProfile');

const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken: token } = req.cookies;

  if (!token) {
    return next(new AppError('Refresh token not provided', 401));
  }

  try {
    const decoded = verifyRefreshToken(token);

    const storedToken = await RefreshToken.findOne({
      token: hashToken(token),
      userId: decoded.id
    });

    // Revoked token reuse indicates possible token theft
    if (storedToken && storedToken.isRevoked) {
      await RefreshToken.updateMany(
        { userId: decoded.id },
        { isRevoked: true }
      );

      console.error(`🚨 SECURITY: Token reuse detected - user ${decoded.id}, IP ${req.ip || req.connection.remoteAddress}`);

      return next(new AppError('Token reuse detected. All sessions have been terminated for security.', 401));
    }

    if (!storedToken || !storedToken.isValid()) {
      return next(new AppError('Invalid or expired refresh token', 401));
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('User not found', 401));
    }

    let registrationComplete = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (user.role === 'VLE') registrationComplete = !!(await VleProfile.findOne({ userId: user._id }));
    else if (user.role === 'AO') registrationComplete = !!(await AoProfile.findOne({ userId: user._id }));
    else if (user.role === 'INNOVATOR') registrationComplete = !!(await InnovatorProfile.findOne({ userId: user._id }));
    else if (user.role === 'NO') registrationComplete = !!(await NodalOrgProfile.findOne({ userId: user._id }));
    else if (user.role === 'GENERAL_USER') registrationComplete = !!(await GeneralUserProfile.findOne({ userId: user._id }));

    const { accessToken, refreshToken: newRefreshToken } = createTokens(user);

    const newStoredToken = new RefreshToken({
      userId: user._id,
      token: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deviceInfo: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress
      }
    });
    await newStoredToken.save();

    await storedToken.revoke();

    // res.cookie('refreshToken', newRefreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    //   maxAge: 7 * 24 * 60 * 60 * 1000
    // });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true, 
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          fullName: user.fullName,
          role: user.role,
          status: user.status,
          profilePicture: user.profilePicture,
          registrationComplete,
        },
        accessToken
      }
    });

  } catch (error) {
    return next(new AppError('Invalid refresh token', 401));
  }
});

const logout = catchAsync(async (req, res, next) => {
  const { refreshToken: token } = req.cookies;

  if (token) {
    try {
      await RefreshToken.findOneAndUpdate(
        { token: hashToken(token) },
        { isRevoked: true }
      );
    } catch (error) {
      console.error('Failed to revoke refresh token:', error.message);
    }
  }

  res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'none' });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

const logoutAll = catchAsync(async (req, res, next) => {
  const { refreshToken: token } = req.cookies;

  if (!token) {
    return next(new AppError('Not authenticated', 401));
  }

  try {
    const decoded = verifyRefreshToken(token);

    await RefreshToken.updateMany(
      { userId: decoded.id, isRevoked: false },
      { isRevoked: true }
    );

    res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'none' });

    res.status(200).json({
      status: 'success',
      message: 'Logged out from all devices successfully'
    });

  } catch (error) {
    return next(new AppError('Invalid token', 401));
  }
});

module.exports = {
  refreshToken,
  logout,
  logoutAll
};