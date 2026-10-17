const { sendMobileOTP, verifyMobileOTP, normalizePhoneNumber } = require('../../../services/auth/mobileAuth');
const { createTokens, saveRefreshToken } = require('../../../utils/jwt');
const { sendWelcomeSMS } = require('../../../services/notification/channels/sms');
const User = require('../../../models/User');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');

// Mirrors emailController.register — collects credentials first, then sends OTP (no token returned)
const mobileLogin = catchAsync(async (req, res, next) => {
  const { phone, password, role } = req.body;

  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return next(new AppError('Cannot self-register as admin. Please contact system administrator.', 403));
  }

  try {
    const normalizedPhone = normalizePhoneNumber(phone);
    const existingUser = await User.findOne({ phone: normalizedPhone });

    if (existingUser && existingUser.isPhoneVerified) {
      return next(new AppError('User already exists. Please try logging in instead.', 400));
    }

    let user;

    if (existingUser && !existingUser.isPhoneVerified) {
      existingUser.passwordHash = password;
      existingUser.role = role;
      user = await existingUser.save();
    } else {
      user = new User({
        phone: normalizedPhone,
        passwordHash: password,
        isPhoneUser: true,
        role
      });
      await user.save();
    }

    await sendMobileOTP(normalizedPhone, 'registration');

    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please check your phone for verification OTP.',
      data: {
        userId: user._id,
        phone: user.phone,
        role: user.role,
        registrationComplete: false
      }
    });

  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Mirrors emailController.verifyEmail — just verifies OTP and issues token
const verifyMobile = catchAsync(async (req, res, next) => {
  const { phone, otp } = req.body;

  const normalizedPhone = normalizePhoneNumber(phone);
  const otpResult = await verifyMobileOTP(normalizedPhone, otp, 'registration');

  if (!otpResult.success) {
    return next(new AppError(otpResult.error, 400));
  }

  try {
    const user = await User.findOne({ phone: normalizedPhone });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.isPhoneVerified) {
      return next(new AppError('Phone is already verified', 400));
    }

    user.isPhoneVerified = true;
    user.lastLogin = new Date();
    await user.save();

    try {
      await sendWelcomeSMS(normalizedPhone, user.fullName || 'User');
    } catch (smsError) {
      console.error('Failed to send welcome SMS:', smsError.message);
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
      message: 'Phone verified successfully. You are now logged in.',
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

const resendMobileOTP = catchAsync(async (req, res, next) => {
  const { phone } = req.body;

  try {
    const normalizedPhone = normalizePhoneNumber(phone);
    const user = await User.findOne({ phone: normalizedPhone });

    if (user && !user.isPhoneVerified) {
      await sendMobileOTP(normalizedPhone, 'registration');
    }

    res.status(200).json({
      status: 'success',
      message: 'Check your phone for the verification code'
    });

  } catch (error) {
    return next(new AppError('Failed to process request', 500));
  }
});

module.exports = {
  mobileLogin,
  verifyMobile,
  resendMobileOTP
};
