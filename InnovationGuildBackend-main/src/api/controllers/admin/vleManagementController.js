const User = require('../../../models/User');
const VleProfile = require('../../../models/VleProfile');
const AoProfile = require('../../../models/AoProfile');
const InnovationRequest = require('../../../models/InnovationRequest');
const ServiceRequest = require('../../../models/ServiceRequest');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { sendApprovalNotification, sendRejectionNotification } = require('../../../services/notification/admin/userApprovalNotification');
const { sendRequestEditNotification } = require('../../../services/notification/admin/requestEditNotification');
const { uploadFile, deleteFile } = require('../../../services/storage/minioService');

const getApprovedVles = catchAsync(async (req, res, next) => {
  const {
    status, search, state, district, village,
    gender, persona, vleStatus, nodalOrg,
    page = 1, limit = 20
  } = req.query;

  // Step 1: filter on VleProfile fields (location, gender, persona)
  const profileFilter = {};
  if (state) profileFilter.state = state;
  if (district) profileFilter.district = district;
  if (village) profileFilter.village = { $regex: village, $options: 'i' };
  if (gender) profileFilter.gender = gender;
  if (persona) profileFilter.interestedPersonas = { $in: [persona] };
  if (vleStatus) profileFilter.vleStatus = vleStatus;
  if (nodalOrg) {
    const aoProfiles = await AoProfile.find({ nodalOrg }).select('userId').lean();
    const aoUserIds = aoProfiles.map(a => a.userId);
    profileFilter.affiliatedOrg = { $in: aoUserIds };
  }

  let userIdFilter = null;
  if (Object.keys(profileFilter).length > 0) {
    const profiles = await VleProfile.find(profileFilter).select('userId').lean();
    userIdFilter = profiles.map(p => p.userId);
  }

  // Step 2: filter Users by role + optional id constraint
  const userFilter = { role: 'VLE', status: status ? status.toUpperCase() : 'APPROVED' };
  if (search) {
    userFilter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  if (userIdFilter !== null) userFilter._id = { $in: userIdFilter };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(userFilter)
      .select('fullName email phone status signUpDate')
      .sort({ signUpDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments(userFilter)
  ]);

  // Step 3: attach profiles
  const vleProfiles = await VleProfile.find({ userId: { $in: users.map(u => u._id) } })
    .select('userId vleStatus gender state district village interestedPersonas trainings mobile')
    .lean();
  const profileMap = new Map(vleProfiles.map(p => [p.userId.toString(), p]));
  const result = users.map(u => ({ ...u, profile: profileMap.get(u._id.toString()) || null }));

  // Step 4: batch-compute problems count per VLE
  const resultUserIds = result.map(v => v._id);
  const [innovProbs, srProbs] = await Promise.all([
    resultUserIds.length
      ? InnovationRequest.aggregate([
          { $match: { postedBy: { $in: resultUserIds } } },
          { $group: { _id: '$postedBy', count: { $sum: 1 } } }
        ])
      : [],
    resultUserIds.length
      ? ServiceRequest.aggregate([
          { $match: { postedBy: { $in: resultUserIds } } },
          { $group: { _id: '$postedBy', count: { $sum: 1 } } }
        ])
      : []
  ]);
  const innovProbMap = new Map(innovProbs.map(v => [v._id.toString(), v.count]));
  const srProbMap = new Map(srProbs.map(v => [v._id.toString(), v.count]));
  const enrichedVles = result.map(vle => {
    const id = vle._id.toString();
    return { ...vle, problems: (innovProbMap.get(id) || 0) + (srProbMap.get(id) || 0) };
  });

  res.status(200).json({
    status: 'success',
    data: {
      vles: enrichedVles,
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

  const user = await User.findById(vleId).select('-passwordHash').lean();
  if (!user || user.role !== 'VLE') {
    return next(new AppError('VLE not found', 404));
  }

  const profile = await VleProfile.findOne({ userId: vleId }).lean();

  let affiliatedOrgName = null;
  if (profile?.affiliatedOrg) {
    const aoProfile = await AoProfile.findOne({ userId: profile.affiliatedOrg }).select('orgName').lean();
    affiliatedOrgName = aoProfile?.orgName || null;
  }

  res.status(200).json({
    status: 'success',
    data: { user, profile, affiliatedOrgName }
  });
});

const updateVle = catchAsync(async (req, res, next) => {
  const { vleId } = req.params;

  const user = await User.findById(vleId).select('_id role profilePicture').lean();
  if (!user || user.role !== 'VLE') {
    return next(new AppError('VLE not found', 404));
  }

  if (req.file) {
    if (user?.profilePicture) deleteFile(user.profilePicture).catch(() => {});
    const uploaded = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, `users/${vleId}/profile-picture`);
    await User.findByIdAndUpdate(vleId, { profilePicture: uploaded.url });
  }

  const allowedFields = [
    'mobile', 'age', 'gender', 'village', 'district', 'state',
    'mainLivelihood', 'livelihoodExperience', 'qualification',
    'affiliatedOrg', 'vleStatus',
    'otherLivelihoods', 'yearlyRevenue', 'languages',
    'trainingsTaken', 'machineExpYears',
    'machinesWorkedWith', 'vleCategory', 'vleCategoryOther',
    'supportAssessment', 'interestedPersonas',
    'trainings', 'basicTrainingCenter', 'innovationTrainingCenter',
    'advancedTrainingCenter', 'otherTrainingCenter'
  ];
  const updates = {};
  allowedFields.forEach(f => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  if (req.body.hasMachineExp !== undefined) {
    updates.hasMachineExp = req.body.hasMachineExp === 'yes';
  }

  if (req.body.fullName !== undefined) {
    await User.findByIdAndUpdate(vleId, { fullName: req.body.fullName });
  }

  if (updates.affiliatedOrg) {
    const aoUser = await User.findById(updates.affiliatedOrg).select('role').lean();
    if (!aoUser || aoUser.role !== 'AO') {
      return next(new AppError('Invalid affiliated organization', 400));
    }
  }

  const profile = await VleProfile.findOneAndUpdate(
    { userId: vleId },
    updates,
    { new: true, runValidators: true }
  );

  if (!profile) {
    return next(new AppError('VLE profile not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'VLE updated successfully',
    data: { profile }
  });
});

const getPendingVles = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, persona } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Only users who completed profile (profile-first — excludes incomplete registrations)
  const pendingUserIds = await User.find({ status: 'PENDING', role: 'VLE', editRequested: { $ne: true } }).distinct('_id');

  const profileFilter = { userId: { $in: pendingUserIds } };
  if (persona) profileFilter.interestedPersonas = { $in: [persona] };

  const [profiles, total] = await Promise.all([
    VleProfile.find(profileFilter)
      .select('userId gender state district village mobile interestedPersonas createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    VleProfile.countDocuments(profileFilter)
  ]);

  const userIds = profiles.map(p => p.userId);
  const users = await User.find({ _id: { $in: userIds } }).select('fullName email phone status').lean();
  const userMap = new Map(users.map(u => [u._id.toString(), u]));

  const vles = profiles.map(profile => {
    const user = userMap.get(profile.userId.toString()) || {};
    return {
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      status: user.status,
      profile
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

const approveVle = catchAsync(async (req, res, next) => {
  const { vleId } = req.params;

  const user = await User.findById(vleId)
    .select('_id fullName phone email role status isPhoneUser isPhoneVerified isEmailUser isEmailVerified isGoogleUser');
  if (!user || user.role !== 'VLE') return next(new AppError('VLE not found', 404));
  if (user.status === 'APPROVED') return next(new AppError('VLE is already approved', 400));

  user.status = 'APPROVED';
  user.approvedAt = new Date();
  await user.save();

  const notificationsSent = await sendApprovalNotification(user);

  res.status(200).json({
    status: 'success',
    message: 'VLE approved successfully',
    data: {
      user: { id: user._id, email: user.email, phone: user.phone, fullName: user.fullName, role: user.role, status: user.status },
      notificationsSent
    }
  });
});

const rejectVle = catchAsync(async (req, res, next) => {
  const { vleId } = req.params;
  const { reason } = req.body;

  const user = await User.findById(vleId)
    .select('_id fullName phone email role status isPhoneUser isPhoneVerified isEmailUser isEmailVerified isGoogleUser');
  if (!user || user.role !== 'VLE') return next(new AppError('VLE not found', 404));
  if (user.status === 'REJECTED') return next(new AppError('VLE is already rejected', 400));

  user.status = 'REJECTED';
  await user.save();

  const notificationsSent = await sendRejectionNotification(user, reason);

  res.status(200).json({
    status: 'success',
    message: 'VLE rejected successfully',
    data: {
      user: { id: user._id, email: user.email, phone: user.phone, fullName: user.fullName, role: user.role, status: user.status },
      rejectionReason: reason || null,
      notificationsSent
    }
  });
});

const requestEditVle = catchAsync(async (req, res, next) => {
  const { vleId } = req.params;
  const { reason } = req.body;

  const user = await User.findById(vleId)
    .select('_id fullName phone email role status isPhoneUser isPhoneVerified isEmailUser isEmailVerified isGoogleUser editRequested editRequestReason');
  if (!user || user.role !== 'VLE') return next(new AppError('VLE not found', 404));
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

module.exports = {
  getApprovedVles,
  getVleDetails,
  updateVle,
  getPendingVles,
  approveVle,
  rejectVle,
  requestEditVle
};
