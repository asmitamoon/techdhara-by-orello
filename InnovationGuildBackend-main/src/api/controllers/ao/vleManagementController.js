const User = require('../../../models/User');
const VleProfile = require('../../../models/VleProfile');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { sendVleRegisteredByAo } = require('../../../services/notification/vle/vleNotification');
const { sendVleRegisteredConfirmation } = require('../../../services/notification/ao/vleActivityNotification');
const { sendOTP, verifyOTP } = require('../../../services/auth/emailAuth');
const { sendMobileOTP, verifyMobileOTP, normalizePhoneNumber } = require('../../../services/auth/mobileAuth');
const { uploadFile } = require('../../../services/storage/minioService');

const initiateVleRegistration = catchAsync(async (req, res, next) => {
  const { email, phone } = req.body;

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

const resendVleOTP = catchAsync(async (req, res, next) => {
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

const registerVle = catchAsync(async (req, res, next) => {
  const {
    email,
    phone,
    password,
    fullName,
    mobile,
    age,
    gender,
    village,
    district,
    state,
    affiliatedOrg,
    mainLivelihood,
    livelihoodExperience,
    otherLivelihoods,
    yearlyRevenue,
    qualification,
    languages,
    hasMachineExp,
    trainingsTaken,
    machineExpYears,
    machinesWorkedWith,
    vleCategory,
    vleCategoryOther,
    supportAssessment,
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
      role: 'VLE',
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
      role: 'VLE',
      status: 'APPROVED',
      approvedAt: new Date(),
      isPhoneVerified: true
    });
    await user.save();
  }

  const existingProfile = await VleProfile.findOne({ userId: user._id });
  if (existingProfile) {
    return next(new AppError('VLE profile already exists for this user', 400));
  }

  let profilePictureUrl;
  if (req.file) {
    const uploadResult = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, `users/${user._id}/profile-picture`);
    profilePictureUrl = uploadResult.url;
  }

  const vleProfileData = {
    userId: user._id,
    registrationType: 'AO_REGISTERED',
    mobile,
    age,
    gender,
    village,
    district,
    state,
    mainLivelihood,
    livelihoodExperience,
    languages,
    hasMachineExp: hasMachineExp || false,
    machineExpYears: machineExpYears || 0,
    vleCategory
  };

  vleProfileData.affiliatedOrg = req.user._id;
  if (otherLivelihoods) vleProfileData.otherLivelihoods = otherLivelihoods;
  if (yearlyRevenue !== undefined) vleProfileData.yearlyRevenue = yearlyRevenue;
  if (qualification) vleProfileData.qualification = qualification;
  if (trainingsTaken) vleProfileData.trainingsTaken = trainingsTaken;
  if (machinesWorkedWith) vleProfileData.machinesWorkedWith = machinesWorkedWith;
  if (vleCategoryOther) vleProfileData.vleCategoryOther = vleCategoryOther;
  if (supportAssessment && supportAssessment.length > 0) vleProfileData.supportAssessment = supportAssessment;

  const vleProfile = new VleProfile(vleProfileData);
  await vleProfile.save();

  user.fullName = fullName;
  user.registrationComplete = true;
  if (profilePictureUrl) user.profilePicture = profilePictureUrl;
  await user.save();

  sendVleRegisteredByAo(user, req.user).catch(err =>
    console.error('Failed to send VLE registered by AO notification:', err.message)
  );
  sendVleRegisteredConfirmation(req.user, user).catch(err =>
    console.error('Failed to send VLE registered confirmation to AO:', err.message)
  );

  res.status(201).json({
    status: 'success',
    message: 'VLE profile created successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        role: user.role,
        status: user.status
      },
      vleProfile: {
        id: vleProfile._id,
        village: vleProfile.village,
        district: vleProfile.district,
        state: vleProfile.state,
        vleCategory: vleProfile.vleCategory,
        registrationType: vleProfile.registrationType
      }
    }
  });
});

const getRegisteredVles = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, status } = req.query;

  const filter = { affiliatedOrg: req.user._id, registrationType: 'AO_REGISTERED' };
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const vleProfiles = await VleProfile.find(filter)
    .populate('userId', 'fullName email phone status')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  let vles = vleProfiles.map(profile => ({
    vleId: profile._id,
    user: {
      fullName: profile.userId.fullName,
      email: profile.userId.email,
      phone: profile.userId.phone,
      status: profile.userId.status
    },
    profile: {
      village: profile.village,
      district: profile.district,
      state: profile.state,
      vleCategory: profile.vleCategory,
      registeredAt: profile.createdAt
    }
  }));

  if (status) {
    vles = vles.filter(vle => vle.user.status === status.toUpperCase());
  }

  const total = await VleProfile.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      vles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const getVleDetails = catchAsync(async (req, res, next) => {
  const { vleId } = req.params;

  const vleProfile = await VleProfile.findById(vleId)
    .populate('userId', 'fullName email phone status profilePicture role');

  if (!vleProfile) {
    return next(new AppError('VLE not found', 404));
  }

  if (!vleProfile.affiliatedOrg || vleProfile.affiliatedOrg.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only view VLEs you registered', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: vleProfile.userId,
      profile: vleProfile
    }
  });
});

module.exports = {
  initiateVleRegistration,
  resendVleOTP,
  registerVle,
  getRegisteredVles,
  getVleDetails
};
