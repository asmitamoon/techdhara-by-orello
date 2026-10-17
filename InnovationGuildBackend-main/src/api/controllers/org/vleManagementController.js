const User = require('../../../models/User');
const VleProfile = require('../../../models/VleProfile');
const AoProfile = require('../../../models/AoProfile');
const InnovationRequest = require('../../../models/InnovationRequest');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { sendApprovalNotification, sendRejectionNotification } = require('../../../services/notification/admin/userApprovalNotification');
const { sendRequestEditNotification } = require('../../../services/notification/admin/requestEditNotification');
const { uploadFile, deleteFile } = require('../../../services/storage/minioService');

const getOrgApprovedVles = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, search, gender, state, district, vleStatus, persona } = req.query;

  // Step 1: get VLE profiles in scope, apply profile-level filters
  const profileFilter = { ...req.orgScope.vleFilter };
  if (gender) profileFilter.gender = gender;
  if (state) profileFilter.state = state;
  if (district) profileFilter.district = district;
  if (vleStatus) profileFilter.vleStatus = vleStatus;
  if (persona) profileFilter.interestedPersonas = { $in: [persona] };

  const vleProfiles = await VleProfile.find(profileFilter)
    .select('userId village district state vleCategory vleStatus gender interestedPersonas trainings mobile createdAt')
    .lean();
  const vleUserIds = vleProfiles.map(p => p.userId);

  // Step 2: paginate Users (always APPROVED), apply optional search
  const userFilter = { _id: { $in: vleUserIds }, status: 'APPROVED' };
  if (search) userFilter.fullName = { $regex: search, $options: 'i' };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(userFilter)
      .select('fullName email phone status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments(userFilter)
  ]);

  // Step 3: get problem counts per VLE user
  const userIds = users.map(u => u._id);
  const problemCounts = await InnovationRequest.aggregate([
    { $match: { postedBy: { $in: userIds } } },
    { $group: { _id: '$postedBy', count: { $sum: 1 } } }
  ]);
  const problemCountMap = new Map(problemCounts.map(p => [p._id.toString(), p.count]));

  // Step 4: map back
  const profileMap = new Map(vleProfiles.map(p => [p.userId.toString(), p]));
  const vles = users.map(user => {
    const profile = profileMap.get(user._id.toString());
    return {
      vleId: user._id,
      user: { fullName: user.fullName, email: user.email, phone: user.phone, status: user.status },
      profile: {
        village: profile?.village,
        district: profile?.district,
        state: profile?.state,
        vleCategory: profile?.vleCategory,
        vleStatus: profile?.vleStatus,
        gender: profile?.gender,
        interestedPersonas: profile?.interestedPersonas || [],
        trainings: profile?.trainings || [],
        mobile: profile?.mobile,
        registeredAt: profile?.createdAt
      },
      problems: problemCountMap.get(user._id.toString()) || 0
    };
  });

  res.status(200).json({
    status: 'success',
    data: {
      vles,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    }
  });
});

const getOrgVleDetails = catchAsync(async (req, res, next) => {
  const { vleId } = req.params;

  const vleProfile = await VleProfile.findOne({ userId: vleId })
    .populate('userId', 'fullName email phone status profilePicture role editRequested editRequestReason')
    .lean();

  if (!vleProfile) {
    return next(new AppError('VLE not found', 404));
  }

  if (!vleProfile.affiliatedOrg || !req.orgScope.isInScope(vleProfile.affiliatedOrg)) {
    return next(new AppError('You can only view VLEs within your organization', 403));
  }

  let affiliatedOrgName = null;
  if (vleProfile.affiliatedOrg) {
    const aoProfile = await AoProfile.findOne({ userId: vleProfile.affiliatedOrg }).select('orgName').lean();
    affiliatedOrgName = aoProfile?.orgName || null;
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: vleProfile.userId,
      profile: vleProfile,
      affiliatedOrgName,
    }
  });
});

const getOrgPendingVles = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, search, gender, state, district, persona } = req.query;

  // Step 1: get VLE profiles in scope, apply profile-level filters
  const profileFilter = { ...req.orgScope.vleFilter };
  if (gender) profileFilter.gender = gender;
  if (state) profileFilter.state = state;
  if (district) profileFilter.district = district;
  if (persona) profileFilter.interestedPersonas = { $in: [persona] };

  const vleProfiles = await VleProfile.find(profileFilter)
    .select('userId village district state vleCategory gender mobile interestedPersonas createdAt')
    .lean();
  const vleUserIds = vleProfiles.map(p => p.userId);

  // Step 2: paginate PENDING Users, apply optional search
  const userFilter = { _id: { $in: vleUserIds }, status: 'PENDING', editRequested: { $ne: true } };
  if (search) userFilter.fullName = { $regex: search, $options: 'i' };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(userFilter)
      .select('fullName email phone status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments(userFilter)
  ]);

  const profileMap = new Map(vleProfiles.map(p => [p.userId.toString(), p]));
  const vles = users.map(user => {
    const profile = profileMap.get(user._id.toString());
    return {
      vleId: user._id,
      user: { fullName: user.fullName, email: user.email, phone: user.phone, status: user.status },
      profile: { village: profile?.village, district: profile?.district, state: profile?.state, vleCategory: profile?.vleCategory, gender: profile?.gender, mobile: profile?.mobile, interestedPersonas: profile?.interestedPersonas || [], registeredAt: profile?.createdAt }
    };
  });

  res.status(200).json({
    status: 'success',
    data: { vles, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } }
  });
});

const approveOrgVle = catchAsync(async (req, res, next) => {
  const { vleId } = req.params;

  const vleProfile = await VleProfile.findOne({ userId: vleId }).select('userId affiliatedOrg').lean();
  if (!vleProfile) return next(new AppError('VLE not found', 404));
  if (!req.orgScope.isInScope(vleProfile.affiliatedOrg)) {
    return next(new AppError('You can only approve VLEs within your organization', 403));
  }

  const user = await User.findById(vleProfile.userId)
    .select('_id fullName phone email status isPhoneUser isPhoneVerified isEmailUser isEmailVerified isGoogleUser');
  if (!user) return next(new AppError('VLE user not found', 404));
  if (user.status === 'APPROVED') return next(new AppError('VLE is already approved', 400));

  user.status = 'APPROVED';
  user.approvedAt = new Date();
  await user.save();

  try {
    await sendApprovalNotification(user);
  } catch (err) {
    console.error('VLE approval notification failed:', err);
  }

  res.status(200).json({
    status: 'success',
    message: 'VLE approved successfully',
    data: { user: { id: user._id, email: user.email, phone: user.phone, fullName: user.fullName, status: user.status } }
  });
});

const rejectOrgVle = catchAsync(async (req, res, next) => {
  const { vleId } = req.params;
  const { rejectionReason } = req.body;

  const vleProfile = await VleProfile.findOne({ userId: vleId }).select('userId affiliatedOrg').lean();
  if (!vleProfile) return next(new AppError('VLE not found', 404));
  if (!req.orgScope.isInScope(vleProfile.affiliatedOrg)) {
    return next(new AppError('You can only reject VLEs within your organization', 403));
  }

  const user = await User.findById(vleProfile.userId)
    .select('_id fullName phone email status isPhoneUser isPhoneVerified isEmailUser isEmailVerified isGoogleUser');
  if (!user) return next(new AppError('VLE user not found', 404));
  if (user.status === 'REJECTED') return next(new AppError('VLE is already rejected', 400));

  user.status = 'REJECTED';
  await user.save();

  try {
    await sendRejectionNotification(user, rejectionReason);
  } catch (err) {
    console.error('VLE rejection notification failed:', err);
  }

  res.status(200).json({
    status: 'success',
    message: 'VLE rejected successfully',
    data: { user: { id: user._id, email: user.email, phone: user.phone, fullName: user.fullName, status: user.status }, rejectionReason }
  });
});

const updateOrgVle = catchAsync(async (req, res, next) => {
  const { vleId } = req.params;

  const vleProfile = await VleProfile.findOne({ userId: vleId });
  if (!vleProfile) return next(new AppError('VLE not found', 404));
  if (!vleProfile.affiliatedOrg || !req.orgScope.isInScope(vleProfile.affiliatedOrg)) {
    return next(new AppError('You can only edit VLEs within your organization', 403));
  }

  // Profile picture upload
  if (req.file) {
    const vleUser = await User.findById(vleProfile.userId).select('profilePicture').lean();
    if (vleUser?.profilePicture) deleteFile(vleUser.profilePicture).catch(() => {});
    const uploaded = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, `users/${vleProfile.userId}/profile-picture`);
    await User.findByIdAndUpdate(vleProfile.userId, { profilePicture: uploaded.url });
  }

  // Update User.fullName if provided
  if (req.body.fullName !== undefined) {
    await User.findByIdAndUpdate(vleProfile.userId, { fullName: req.body.fullName });
  }

  // Update VleProfile string / array fields
  const directFields = ['mobile', 'gender', 'state', 'district', 'village', 'affiliatedOrg',
    'mainLivelihood', 'otherLivelihoods', 'qualification', 'languages',
    'machinesWorkedWith', 'vleCategory', 'vleCategoryOther', 'supportAssessment', 'trainingsTaken'];
  directFields.forEach(f => { if (req.body[f] !== undefined) vleProfile[f] = req.body[f]; });

  if (req.body.age !== undefined) vleProfile.age = Number(req.body.age) || undefined;
  if (req.body.livelihoodExperience !== undefined) vleProfile.livelihoodExperience = Number(req.body.livelihoodExperience) || 0;
  if (req.body.yearlyRevenue !== undefined) vleProfile.yearlyRevenue = Number(req.body.yearlyRevenue) || undefined;
  if (req.body.machineExpYears !== undefined) vleProfile.machineExpYears = Number(req.body.machineExpYears) || undefined;
  if (req.body.hasMachineExp !== undefined) vleProfile.hasMachineExp = req.body.hasMachineExp === 'yes';

  await vleProfile.save();
  res.status(200).json({ status: 'success', message: 'VLE updated successfully', data: { profile: vleProfile } });
});

const requestEditOrgVle = catchAsync(async (req, res, next) => {
  const { vleId } = req.params;
  const { reason } = req.body;

  const vleProfile = await VleProfile.findOne({ userId: vleId }).select('userId affiliatedOrg').lean();
  if (!vleProfile) return next(new AppError('VLE not found', 404));
  if (!req.orgScope.isInScope(vleProfile.affiliatedOrg)) {
    return next(new AppError('You can only request edit for VLEs within your organization', 403));
  }

  const user = await User.findById(vleId)
    .select('_id fullName phone email role status isPhoneUser isPhoneVerified isEmailUser isEmailVerified isGoogleUser editRequested editRequestReason');
  if (!user || user.role !== 'VLE') return next(new AppError('VLE user not found', 404));
  if (user.status !== 'PENDING') return next(new AppError('Edit can only be requested for pending users', 400));

  user.editRequested = true;
  user.editRequestReason = reason || '';
  await user.save();

  try {
    await sendRequestEditNotification(user, reason, 'Profile', user.fullName);
  } catch (e) {
    console.error('Failed to send request-edit notification:', e);
  }

  res.status(200).json({
    status: 'success',
    message: 'Edit requested successfully',
    data: { user: { id: user._id, fullName: user.fullName, editRequested: user.editRequested } }
  });
});

module.exports = { getOrgApprovedVles, getOrgVleDetails, getOrgPendingVles, approveOrgVle, rejectOrgVle, updateOrgVle, requestEditOrgVle };
