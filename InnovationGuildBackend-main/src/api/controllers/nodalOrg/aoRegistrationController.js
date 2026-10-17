const User = require('../../../models/User');
const AoProfile = require('../../../models/AoProfile');
const NodalOrgProfile = require('../../../models/NodalOrgProfile');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { sendWelcomeEmail } = require('../../../services/notification/channels/email');
const { sendWelcomeSMS } = require('../../../services/notification/channels/sms');
const { sendOTP, verifyOTP } = require('../../../services/auth/emailAuth');
const { sendMobileOTP, verifyMobileOTP, normalizePhoneNumber } = require('../../../services/auth/mobileAuth');
const { uploadFile } = require('../../../services/storage/minioService');

const initiateAoRegistration = catchAsync(async (req, res, next) => {
  const { email, phone } = req.body;

  const nodalOrgProfile = await NodalOrgProfile.findOne({ userId: req.user._id });
  if (!nodalOrgProfile) {
    return next(new AppError('Nodal Organization profile not found', 404));
  }

  if (req.user.status !== 'APPROVED') {
    return next(new AppError('Your Nodal Organization must be approved before registering AOs', 403));
  }

  if (email) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }
    await sendOTP(email.toLowerCase(), 'registration');
    return res.status(200).json({
      status: 'success',
      message: 'OTP sent to email. Please verify to complete registration.',
      data: { verificationType: 'email', identifier: email.toLowerCase() }
    });
  }

  if (phone) {
    const normalizedPhone = normalizePhoneNumber(phone);
    const existingUser = await User.findOne({ phone: normalizedPhone });
    if (existingUser) {
      return next(new AppError('Phone number already registered', 400));
    }
    await sendMobileOTP(normalizedPhone, 'registration');
    return res.status(200).json({
      status: 'success',
      message: 'OTP sent to phone. Please verify to complete registration.',
      data: { verificationType: 'phone', identifier: normalizedPhone }
    });
  }
});

const resendAoOTP = catchAsync(async (req, res, next) => {
  const { email, phone } = req.body;

  if (email) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser && existingUser.isEmailVerified) {
      return next(new AppError('Email is already verified', 400));
    }
    await sendOTP(email.toLowerCase(), 'registration');
    return res.status(200).json({
      status: 'success',
      message: 'OTP resent to email successfully'
    });
  }

  if (phone) {
    const normalizedPhone = normalizePhoneNumber(phone);
    const existingUser = await User.findOne({ phone: normalizedPhone });
    if (existingUser && existingUser.isPhoneVerified) {
      return next(new AppError('Phone number is already verified', 400));
    }
    await sendMobileOTP(normalizedPhone, 'registration');
    return res.status(200).json({
      status: 'success',
      message: 'OTP resent to phone successfully'
    });
  }
});

const registerAo = catchAsync(async (req, res, next) => {
  const {
    email,
    phone,
    password,
    orgName,
    orgType,
    orgTypeOther,
    streamOfWork,
    streamOfWorkOther,
    pocName,
    village,
    district,
    state,
    website,
    otp
  } = req.body;

  let user;

  if (email) {
    const otpResult = await verifyOTP(email.toLowerCase(), otp, 'registration');
    if (!otpResult.success) {
      return next(new AppError(otpResult.error, 400));
    }
    user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return next(new AppError('Email already registered', 400));
    }
    user = new User({
      email: email.toLowerCase(),
      passwordHash: password,
      isEmailUser: true,
      role: 'AO',
      status: 'APPROVED',
      approvedAt: new Date(),
      isEmailVerified: true
    });
    await user.save();
  }

  if (phone) {
    const normalizedPhone = normalizePhoneNumber(phone);
    const otpResult = await verifyMobileOTP(normalizedPhone, otp, 'registration');
    if (!otpResult.success) {
      return next(new AppError(otpResult.error, 400));
    }
    user = await User.findOne({ phone: normalizedPhone });
    if (user) {
      return next(new AppError('Phone number already registered', 400));
    }
    user = new User({
      phone: normalizedPhone,
      passwordHash: password,
      isPhoneUser: true,
      role: 'AO',
      status: 'APPROVED',
      approvedAt: new Date(),
      isPhoneVerified: true
    });
    await user.save();
  }

  const existingProfile = await AoProfile.findOne({ userId: user._id });
  if (existingProfile) {
    return next(new AppError('AO profile already exists for this user', 400));
  }

  const nodalOrgProfile = await NodalOrgProfile.findOne({ userId: req.user._id });
  if (!nodalOrgProfile) {
    return next(new AppError('Nodal Organization profile not found', 404));
  }

  const aoProfileData = {
    userId: user._id,
    registrationType: 'NODAL_ORG_REGISTERED',
    nodalOrg: req.user._id,
    orgName,
    orgType,
    streamOfWork,
    pocName,
    village,
    district,
    state
  };

  if (website) aoProfileData.website = website;
  if (orgTypeOther) aoProfileData.orgTypeOther = orgTypeOther;
  if (streamOfWorkOther) aoProfileData.streamOfWorkOther = streamOfWorkOther;

  let logoUrl;
  if (req.file) {
    const uploadResult = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      `users/${user._id}/profile-picture`
    );
    logoUrl = uploadResult.url;
  }

  const aoProfile = new AoProfile(aoProfileData);
  await aoProfile.save();
  await User.findByIdAndUpdate(user._id, { registrationComplete: true });

  await NodalOrgProfile.findByIdAndUpdate(nodalOrgProfile._id, { $inc: { numberOfAffiliatedOrgs: 1 } });

  if (logoUrl) {
    user.profilePicture = logoUrl;
    await user.save();
  }

  const notificationsSent = [];
  const userName = pocName;

  if (user.isEmailUser && user.isEmailVerified) {
    try {
      await sendWelcomeEmail(user.email, userName);
      notificationsSent.push('email');
    } catch (error) {
      console.error('Failed to send welcome email:', error.message);
    }
  }

  if (user.isPhoneUser && user.isPhoneVerified) {
    try {
      await sendWelcomeSMS(user.phone, userName);
      notificationsSent.push('sms');
    } catch (error) {
      console.error('Failed to send welcome SMS:', error.message);
    }
  }

  res.status(201).json({
    status: 'success',
    message: 'AO profile created successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      },
      aoProfile: {
        id: aoProfile._id,
        orgName: aoProfile.orgName,
        orgType: aoProfile.orgType,
        streamOfWork: aoProfile.streamOfWork,
        pocName: aoProfile.pocName,
        village: aoProfile.village,
        district: aoProfile.district,
        state: aoProfile.state,
        website: aoProfile.website,
        logo: user.profilePicture,
        registrationType: aoProfile.registrationType,
        nodalOrg: aoProfile.nodalOrg,
        nodalOrgName: nodalOrgProfile.orgName
      },
      notificationsSent
    }
  });
});

const getRegisteredAos = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, status } = req.query;

  const filter = { nodalOrg: req.user._id, registrationType: 'NODAL_ORG_REGISTERED' };
  const skip = (parseInt(page) - 1) * parseInt(limit);

  if (status) {
    const matchingUsers = await User.find({ status: status.toUpperCase() }).select('_id').lean();
    filter.userId = { $in: matchingUsers.map(u => u._id) };
  }

  const [aoProfiles, total] = await Promise.all([
    AoProfile.find(filter)
      .populate('userId', 'fullName email phone status')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip),
    AoProfile.countDocuments(filter)
  ]);

  const aos = aoProfiles.map(profile => ({
    aoId: profile._id,
    user: {
      pocName: profile.pocName,
      email: profile.userId.email,
      phone: profile.userId.phone,
      status: profile.userId.status
    },
    profile: {
      orgName: profile.orgName,
      orgType: profile.orgType,
      streamOfWork: profile.streamOfWork,
      pocName: profile.pocName,
      village: profile.village,
      district: profile.district,
      state: profile.state,
      website: profile.website,
      registrationType: profile.registrationType,
      registeredAt: profile.createdAt
    }
  }));

  res.status(200).json({
    status: 'success',
    data: {
      aos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const getAoDetails = catchAsync(async (req, res, next) => {
  const { aoId } = req.params;

  const aoProfile = await AoProfile.findById(aoId)
    .populate('userId', '-passwordHash');

  if (!aoProfile) {
    return next(new AppError('AO not found', 404));
  }

  if (!aoProfile.nodalOrg || aoProfile.nodalOrg.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only view AOs you registered', 403));
  }

  const nodalOrgProfile = aoProfile.nodalOrg
    ? await NodalOrgProfile.findOne({ userId: aoProfile.nodalOrg }).select('orgName').lean()
    : null;

  res.status(200).json({
    status: 'success',
    data: {
      user: aoProfile.userId,
      profile: aoProfile,
      nodalOrgName: nodalOrgProfile?.orgName || null
    }
  });
});

module.exports = {
  initiateAoRegistration,
  resendAoOTP,
  registerAo,
  getRegisteredAos,
  getAoDetails
};
