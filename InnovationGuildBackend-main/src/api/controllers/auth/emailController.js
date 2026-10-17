const bcrypt = require('bcryptjs');
const RefreshToken = require('../../../models/RefreshToken');
const { sendOTP, verifyOTP } = require('../../../services/auth/emailAuth');
const { sendMobileOTP, verifyMobileOTP, normalizePhoneNumber } = require('../../../services/auth/mobileAuth');
const { createTokens, saveRefreshToken, generateAccessToken, verifyAccessToken } = require('../../../utils/jwt');
const { sendWelcomeEmail } = require('../../../services/notification/channels/email');
const User = require('../../../models/User');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');

const register = catchAsync(async (req, res, next) => {
  const { email, password, role } = req.body;

  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return next(new AppError('Cannot self-register as admin. Please contact system administrator.', 403));
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser && existingUser.isEmailVerified) {
      return next(new AppError('User already exists. Please try logging in instead.', 400));
    }

    if (existingUser && existingUser.isGoogleUser) {
      return next(new AppError('This email is registered with Google. Please sign in with Google instead.', 400));
    }

    let user;
    
    if (existingUser && !existingUser.isEmailVerified) {
      existingUser.passwordHash = password;
      existingUser.role = role;
      user = await existingUser.save();

    } else {
      user = new User({
        email: email.toLowerCase(),
        passwordHash: password,
        isEmailUser: true,
        role: role
      });
      await user.save();
    }

    await sendOTP(email.toLowerCase(), 'registration');

    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please check your email for verification OTP.',
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
        registrationComplete: false
      }
    });

  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

const verifyEmail = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  const otpResult = await verifyOTP(email.toLowerCase(), otp, 'registration');

  if (!otpResult.success) {
    return next(new AppError(otpResult.error, 400));
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.isEmailVerified) {
      return next(new AppError('Email is already verified', 400));
    }

    user.isEmailVerified = true;
    user.lastLogin = new Date();
    await user.save();


    // Don't fail registration if welcome email fails
    try {
      await sendWelcomeEmail(user.email, 'User');
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError.message);
    }

    const { accessToken, refreshToken } = createTokens(user);

    await saveRefreshToken(user._id, refreshToken, req);

    // res.cookie('refreshToken', refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    //   maxAge: 7 * 24 * 60 * 60 * 1000
    // });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully. You are now logged in.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          fullName: user.fullName,
          role: user.role,
          status: user.status,
          profilePicture: user.profilePicture,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          hasPassword: !!user.passwordHash,
          registrationComplete: false
        },
        accessToken
      }
    });

  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

const login = catchAsync(async (req, res, next) => {
  const { email, phone, password } = req.body;

  try {
    let user;

    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (!user || user.isGoogleUser || !user.isEmailVerified) {
        return next(new AppError('Invalid email or password', 401));
      }
    } else {
      const normalizedPhone = normalizePhoneNumber(phone);
      user = await User.findOne({ phone: normalizedPhone });
      if (!user || !user.isPhoneVerified) {
        return next(new AppError('Invalid phone or password', 401));
      }
      if (!user.passwordHash) {
        return next(new AppError('No password set for this account. Please use OTP to login.', 401));
      }
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      return next(new AppError(email ? 'Invalid email or password' : 'Invalid phone or password', 401));
    }

    user.lastLogin = new Date();
    await user.save();

    const registrationComplete = user.registrationComplete;

    const { accessToken, refreshToken } = createTokens(user);

    await saveRefreshToken(user._id, refreshToken, req);

    // res.cookie('refreshToken', refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    //   maxAge: 7 * 24 * 60 * 60 * 1000
    // });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          fullName: user.fullName,
          role: user.role,
          status: user.status,
          profilePicture: user.profilePicture,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          hasPassword: !!user.passwordHash,
          registrationComplete
        },
        accessToken
      }
    });

  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

const forgotPassword = catchAsync(async (req, res, next) => {
  const { email, phone } = req.body;

  try {
    if (email) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user && !user.isGoogleUser && user.isEmailVerified) {
        await sendOTP(email.toLowerCase(), 'password_reset');
      }
      return res.status(200).json({
        status: 'success',
        message: 'Check your email for password reset instructions.'
      });
    }

    if (phone) {
      const normalizedPhone = normalizePhoneNumber(phone);
      const user = await User.findOne({ phone: normalizedPhone });
      // Only send OTP if user exists, is verified, and has a password to reset
      if (user && user.isPhoneVerified && user.passwordHash) {
        await sendMobileOTP(normalizedPhone, 'password_reset');
      }
      return res.status(200).json({
        status: 'success',
        message: 'Check your phone for password reset instructions.'
      });
    }

  } catch (error) {
    return next(new AppError('Failed to process request', 500));
  }
});

const verifyResetOTP = catchAsync(async (req, res, next) => {
  const { email, phone, otp } = req.body;

  if (email) {
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || user.isGoogleUser || !user.isEmailVerified)
      return next(new AppError('Invalid request', 400));
    const otpResult = await verifyOTP(normalizedEmail, otp, 'password_reset');
    if (!otpResult.success) return next(new AppError(otpResult.error, 400));
    const resetToken = generateAccessToken({ userId: user._id, purpose: 'password_reset' });
    return res.status(200).json({ status: 'success', data: { resetToken } });
  }

  if (phone) {
    const normalizedPhone = normalizePhoneNumber(phone);
    const user = await User.findOne({ phone: normalizedPhone });
    if (!user || !user.isPhoneVerified)
      return next(new AppError('Invalid request', 400));
    const otpResult = await verifyMobileOTP(normalizedPhone, otp, 'password_reset');
    if (!otpResult.success) return next(new AppError(otpResult.error, 400));
    const resetToken = generateAccessToken({ userId: user._id, purpose: 'password_reset' });
    return res.status(200).json({ status: 'success', data: { resetToken } });
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  const { resetToken, newPassword } = req.body;

  let payload;
  try {
    payload = verifyAccessToken(resetToken);
  } catch {
    return next(new AppError('Reset link has expired or is invalid', 400));
  }

  if (payload.purpose !== 'password_reset')
    return next(new AppError('Invalid reset token', 400));

  const user = await User.findById(payload.userId);
  if (!user) return next(new AppError('User not found', 404));

  if (user.passwordHash) {
    const isSame = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSame) return next(new AppError('New password must be different from your current password', 400));
  }

  user.passwordHash = newPassword;
  await user.save();

  await RefreshToken.updateMany({ userId: user._id, isRevoked: false }, { isRevoked: true });

  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully. You can now log in with your new password.'
  });
});

const resendOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && !user.isEmailVerified) {
      await sendOTP(email.toLowerCase(), 'registration');
    }

    res.status(200).json({
      status: 'success',
      message: 'Check your email for the verification code'
    });

  } catch (error) {
    return next(new AppError('Failed to process request', 500));
  }
});

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  resendOTP
};