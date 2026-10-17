const User = require('../../../models/User');
const VleProfile = require('../../../models/VleProfile');
const InnovatorProfile = require('../../../models/InnovatorProfile');
const AoProfile = require('../../../models/AoProfile');
const NodalOrgProfile = require('../../../models/NodalOrgProfile');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { uploadFile, deleteFile } = require('../../../services/storage/minioService');

const PROFILE_MODEL_MAP = {
  VLE: { Model: VleProfile, folder: 'vle-profiles', picField: 'profilePic' },
  INNOVATOR: { Model: InnovatorProfile, folder: 'innovator-profile-pics', picField: 'profilePic' },
  AO: { Model: AoProfile, folder: 'ao-logos', picField: 'logo' },
  NO: { Model: NodalOrgProfile, folder: 'no-logos', picField: 'logo' },
};

const getMyProfile = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) return next(new AppError('User not found', 404));

  const config = PROFILE_MODEL_MAP[user.role];
  let profile = null;
  if (config) {
    profile = await config.Model.findOne({ userId }).lean();
  }

  if (user.role === 'AO' && profile?.nodalOrg) {
    const nodalOrgProfile = await NodalOrgProfile.findOne({ userId: profile.nodalOrg })
      .select('orgName').lean();
    if (nodalOrgProfile) profile.nodalOrgName = nodalOrgProfile.orgName;
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
      profile,
      editRequested: user.editRequested || false,
      editRequestReason: user.editRequestReason || '',
    },
  });
});

const updateMyProfile = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  // Reload user to get latest editRequested value
  const user = await User.findById(userId);
  if (!user) return next(new AppError('User not found', 404));

  if (!user.editRequested) {
    return next(new AppError('Edit has not been requested for your profile', 403));
  }

  const config = PROFILE_MODEL_MAP[user.role];
  if (!config) return next(new AppError('Profile update not supported for your role', 400));

  // Handle profile picture upload
  if (req.file) {
    if (user.profilePicture) deleteFile(user.profilePicture).catch(() => {});
    const uploaded = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      `users/${userId}/profile-picture`
    );
    await User.findByIdAndUpdate(userId, { profilePicture: uploaded.url });
  }

  // Update fullName on User if provided
  if (req.body.fullName !== undefined) {
    await User.findByIdAndUpdate(userId, { fullName: req.body.fullName });
  }

  // Role-specific field updates
  const profile = await config.Model.findOne({ userId });
  if (!profile) return next(new AppError('Profile not found', 404));

  if (user.role === 'VLE') {
    const directFields = [
      'mobile', 'gender', 'state', 'district', 'village',
      'mainLivelihood', 'otherLivelihoods', 'qualification', 'languages',
      'machinesWorkedWith', 'vleCategory', 'vleCategoryOther', 'supportAssessment', 'trainingsTaken',
    ];
    directFields.forEach(f => { if (req.body[f] !== undefined) profile[f] = req.body[f]; });
    if (req.body.age !== undefined) profile.age = Number(req.body.age) || undefined;
    if (req.body.livelihoodExperience !== undefined) profile.livelihoodExperience = Number(req.body.livelihoodExperience) || 0;
    if (req.body.yearlyRevenue !== undefined) profile.yearlyRevenue = Number(req.body.yearlyRevenue) || undefined;
    if (req.body.machineExpYears !== undefined) profile.machineExpYears = Number(req.body.machineExpYears) || undefined;
    if (req.body.hasMachineExp !== undefined) profile.hasMachineExp = req.body.hasMachineExp === 'yes';
  } else if (user.role === 'INNOVATOR') {
    const allowedFields = ['enterpriseName', 'startDate', 'links', 'addressLine1', 'addressLine2', 'district', 'state', 'description'];
    allowedFields.forEach(f => { if (req.body[f] !== undefined) profile[f] = req.body[f]; });
  } else if (user.role === 'AO') {
    const allowedFields = ['orgName', 'orgType', 'orgTypeOther', 'pocName', 'state', 'district', 'village', 'website', 'streamOfWork', 'streamOfWorkOther'];
    allowedFields.forEach(f => { if (req.body[f] !== undefined) profile[f] = req.body[f]; });
  } else if (user.role === 'NO') {
    const allowedFields = ['orgName', 'orgType', 'hqState', 'website', 'description', 'hasRuralPrograms', 'hasTechIntegration', 'channels', 'potentialAoCount', 'operationalStates'];
    allowedFields.forEach(f => { if (req.body[f] !== undefined) profile[f] = req.body[f]; });
  }

  await profile.save();

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: { profile },
  });
});

const submitProfileForApproval = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) return next(new AppError('User not found', 404));

  if (!user.editRequested) {
    return next(new AppError('No edit request pending for your profile', 403));
  }

  user.editRequested = false;
  user.editRequestReason = '';
  user.status = 'PENDING';
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Profile submitted for re-approval',
    data: { status: user.status },
  });
});

module.exports = { getMyProfile, updateMyProfile, submitProfileForApproval };
