const User = require('../../../models/User');
const NodalOrgProfile = require('../../../models/NodalOrgProfile');
const AoProfile = require('../../../models/AoProfile');
const VleProfile = require('../../../models/VleProfile');
const InnovationRequest = require('../../../models/InnovationRequest');
const ServiceRequest = require('../../../models/ServiceRequest');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { sendApprovalNotification, sendRejectionNotification } = require('../../../services/notification/admin/userApprovalNotification');
const { sendRequestEditNotification } = require('../../../services/notification/admin/requestEditNotification');
const { uploadFile, deleteFile } = require('../../../services/storage/minioService');

const getPendingNodalOrgs = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const pendingUserIds = await User.find({ role: 'NO', status: 'PENDING', editRequested: { $ne: true } }).distinct('_id');

  const profileFilter = { userId: { $in: pendingUserIds } };
  const [noProfiles, total] = await Promise.all([
    NodalOrgProfile.find(profileFilter)
      .select('userId orgName hqState')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    NodalOrgProfile.countDocuments(profileFilter),
  ]);

  const userIds = noProfiles.map(p => p.userId);
  const users = await User.find({ _id: { $in: userIds } }).select('_id fullName').lean();
  const userMap = new Map(users.map(u => [u._id.toString(), u]));

  const pendingNos = noProfiles
    .map(profile => {
      const user = userMap.get(profile.userId.toString());
      if (!user) return null;
      return {
        userId: user._id,
        fullName: user.fullName,
        orgName: profile.orgName,
        stateCode: profile.hqState,
      };
    })
    .filter(no => no !== null);

  res.status(200).json({
    status: 'success',
    data: {
      pendingNos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const getNodalOrgById = catchAsync(async (req, res, next) => {
  const { nodalOrgId } = req.params;

  const user = await User.findById(nodalOrgId).select('profilePicture status role editRequested editRequestReason');

  if (!user) {
    return next(new AppError('Nodal Organization not found', 404));
  }

  if (user.role !== 'NO') {
    return next(new AppError('User is not a Nodal Organization', 400));
  }

  const profile = await NodalOrgProfile.findOne({ userId: user._id });

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        profilePicture: user.profilePicture,
        status: user.status,
      },
      profile: profile || null,
    }
  });
});

const approveNodalOrg = catchAsync(async (req, res, next) => {
  const { nodalOrgId } = req.params;

  const user = await User.findById(nodalOrgId);

  if (!user) {
    return next(new AppError('Nodal Organization not found', 404));
  }

  if (user.role !== 'NO') {
    return next(new AppError('User is not a Nodal Organization', 400));
  }

  if (user.status === 'APPROVED') {
    return next(new AppError('Nodal Organization is already approved', 400));
  }

  if (user.status !== 'PENDING') {
    return next(new AppError('Only pending Nodal Organizations can be approved', 400));
  }

  user.status = 'APPROVED';
  user.approvedAt = new Date();
  await user.save();

  const profile = await NodalOrgProfile.findOne({ userId: user._id });

  try {
    await sendApprovalNotification(user);
  } catch (err) {
    console.error('Failed to send NO approval notification:', err.message);
  }

  res.status(200).json({
    status: 'success',
    message: 'Nodal Organization approved successfully',
    data: {
      userId: user._id,
      status: user.status,
      orgName: profile?.orgName || null
    }
  });
});

const rejectNodalOrg = catchAsync(async (req, res, next) => {
  const { nodalOrgId } = req.params;
  const { reason } = req.body;

  if (!reason) {
    return next(new AppError('Reason is required', 400));
  }

  const user = await User.findById(nodalOrgId);

  if (!user) {
    return next(new AppError('Nodal Organization not found', 404));
  }

  if (user.role !== 'NO') {
    return next(new AppError('User is not a Nodal Organization', 400));
  }

  if (user.status === 'REJECTED') {
    return next(new AppError('Nodal Organization is already rejected', 400));
  }

  if (user.status !== 'PENDING') {
    return next(new AppError('Only pending Nodal Organizations can be rejected', 400));
  }

  user.status = 'REJECTED';
  await user.save();

  const rejectionProfile = await NodalOrgProfile.findOne({ userId: user._id });

  try {
    await sendRejectionNotification(user, reason);
  } catch (err) {
    console.error('Failed to send NO rejection notification:', err.message);
  }

  res.status(200).json({
    status: 'success',
    message: 'Nodal Organization rejected successfully',
    data: {
      userId: user._id,
      status: user.status,
      orgName: rejectionProfile?.orgName || null,
      reason
    }
  });
});

const getApprovedNodalOrgs = catchAsync(async (req, res, next) => {
  const {
    status,
    search,
    state,
    type,
    page = 1,
    limit = 20,
    sortBy = 'signUpDate',
    order = 'desc'
  } = req.query;

  const filter = { role: 'NO', status: status ? status.toUpperCase() : 'APPROVED' };

  // Profile-level filters: hqState and orgType live on NodalOrgProfile
  if (state || type) {
    const profileFilter = {};
    if (state) profileFilter.hqState = state;
    if (type) profileFilter.orgType = type;
    const profiles = await NodalOrgProfile.find(profileFilter).select('userId').lean();
    filter._id = { $in: profiles.map(p => p.userId) };
  }

  // Extend search to cover orgName (from profile) as well as User fields
  if (search) {
    const profileMatches = await NodalOrgProfile.find(
      { orgName: { $regex: search, $options: 'i' } }
    ).select('userId').lean();
    const profileUserIds = profileMatches.map(p => p.userId);
    filter.$or = [
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { _id: { $in: profileUserIds } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('_id')
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    User.countDocuments(filter)
  ]);

  const userIds = users.map(u => u._id);

  const [noProfiles, aoCountAgg] = await Promise.all([
    NodalOrgProfile.find({ userId: { $in: userIds } }).select('userId orgName orgType hqState operationalStates website').lean(),
    AoProfile.aggregate([
      { $match: { nodalOrg: { $in: userIds } } },
      { $group: { _id: '$nodalOrg', count: { $sum: 1 } } }
    ])
  ]);

  const profileMap = new Map(noProfiles.map(p => [p.userId.toString(), p]));
  const aoCountMap = new Map(aoCountAgg.map(a => [a._id.toString(), a.count]));

  const nodalOrgsWithProfiles = users.map(u => {
    const k = u._id.toString();
    const profile = profileMap.get(k);
    return {
      userId: u._id,
      orgName: profile?.orgName || null,
      numberOfRegisteredAOs: aoCountMap.get(k) || 0,
      orgType: profile?.orgType || null,
      hqState: profile?.hqState || null,
      operationalStates: profile?.operationalStates || [],
      website: profile?.website || null
    };
  });

  res.status(200).json({
    status: 'success',
    data: {
      nodalOrgs: nodalOrgsWithProfiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const updateNodalOrg = catchAsync(async (req, res, next) => {
  const { nodalOrgId } = req.params;
  const {
    email,
    phone,
    orgName,
    orgType,
    hqState,
    operationalStates,
    website,
    description,
    hasRuralPrograms,
    hasTechIntegration,
    channels,
    potentialAoCount
  } = req.body;

  const user = await User.findById(nodalOrgId);

  if (!user) {
    return next(new AppError('Nodal Organization not found', 404));
  }

  if (user.role !== 'NO') {
    return next(new AppError('User is not a Nodal Organization', 400));
  }

  if (email) user.email = email.toLowerCase();
  if (phone) user.phone = phone;

  if (req.file) {
    if (user.profilePicture) deleteFile(user.profilePicture).catch(() => {});
    const uploadResult = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      `users/${user._id}/profile-picture`
    );
    user.profilePicture = uploadResult.url;
  }

  await user.save();

  const profile = await NodalOrgProfile.findOne({ userId: user._id });

  if (!profile) {
    return next(new AppError('Nodal Organization profile not found', 404));
  }

  if (orgName) profile.orgName = orgName;
  if (orgType) profile.orgType = orgType;
  if (hqState) profile.hqState = hqState;
  if (operationalStates) profile.operationalStates = operationalStates;
  if (website !== undefined) profile.website = website;
  if (description !== undefined) profile.description = description;
  if (hasRuralPrograms) profile.hasRuralPrograms = hasRuralPrograms;
  if (hasTechIntegration) profile.hasTechIntegration = hasTechIntegration;
  if (channels) profile.channels = channels;
  if (potentialAoCount !== undefined) profile.potentialAoCount = potentialAoCount;

  await profile.save();

  res.status(200).json({
    status: 'success',
    message: 'Nodal Organization updated successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        orgName: profile.orgName,
        role: user.role,
        status: user.status
      },
      profile
    }
  });
});

const getNodalOrgAos = catchAsync(async (req, res, next) => {
  const { nodalOrgId } = req.params;
  const { state, district, search, status, page = 1, limit = 20 } = req.query;

  const profileFilter = { nodalOrg: nodalOrgId };
  if (state) profileFilter.state = state;
  if (district) profileFilter.district = district;
  if (search) profileFilter.orgName = { $regex: search, $options: 'i' };

  const aoProfiles = await AoProfile.find(profileFilter).select('userId orgName state district pocName nodalOrg').lean();
  const allAoUserIds = aoProfiles.map(p => p.userId);

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const userFilter = { _id: { $in: allAoUserIds }, role: 'AO', status: status ? status.toUpperCase() : 'APPROVED' };

  const [users, total] = await Promise.all([
    User.find(userFilter)
      .select('_id')
      .sort({ signUpDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments(userFilter)
  ]);

  const aoUserIds = users.map(u => u._id);

  const vleProfilesForCounts = await VleProfile.find({ affiliatedOrg: { $in: aoUserIds } })
    .select('userId affiliatedOrg').lean();
  const vlesByAo = {};
  vleProfilesForCounts.forEach(v => {
    const k = v.affiliatedOrg?.toString();
    if (k) (vlesByAo[k] = vlesByAo[k] || []).push(v.userId);
  });
  const allVleIds = vleProfilesForCounts.map(v => v.userId);

  const [aoProbAgg, vleProbAgg] = await Promise.all([
    InnovationRequest.aggregate([
      { $match: { postedBy: { $in: aoUserIds } } },
      { $group: { _id: '$postedBy', count: { $sum: 1 } } }
    ]),
    allVleIds.length > 0
      ? InnovationRequest.aggregate([
        { $match: { postedBy: { $in: allVleIds } } },
        { $group: { _id: '$postedBy', count: { $sum: 1 } } }
      ])
      : Promise.resolve([])
  ]);

  const probByAo = {};
  aoProbAgg.forEach(({ _id, count }) => { probByAo[_id.toString()] = count; });

  const vleToAoMap = {};
  vleProfilesForCounts.forEach(vp => { vleToAoMap[vp.userId.toString()] = vp.affiliatedOrg.toString(); });
  const probVleByAo = {};
  vleProbAgg.forEach(({ _id, count }) => {
    const k = vleToAoMap[_id.toString()];
    if (k) probVleByAo[k] = (probVleByAo[k] || 0) + count;
  });

  const profileMap = new Map(aoProfiles.map(p => [p.userId.toString(), p]));

  const affiliatedOrgs = users.map(u => {
    const k = u._id.toString();
    return {
      _id: u._id,
      profile: profileMap.get(k) || null,
      vleCount: (vlesByAo[k] || []).length,
      probCount: probByAo[k] || 0,
      probVleCount: probVleByAo[k] || 0,
    };
  });

  res.status(200).json({
    status: 'success',
    data: {
      affiliatedOrgs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const getNodalOrgProblems = catchAsync(async (req, res, next) => {
  const { nodalOrgId } = req.params;
  const { search, category, operation, state, district, status, page = 1, limit = 20 } = req.query;

  const nodalOrgProfile = await NodalOrgProfile.findOne({ userId: nodalOrgId }).select('orgName').lean();

  const filter = { postedBy: nodalOrgId };
  if (status) filter.status = status.toUpperCase();
  if (category) filter.category = category;
  if (operation) filter.operationsUndertaken = { $in: [operation] };
  if (state) filter.regionState = state;
  if (district) filter.regionDistrict = district;
  if (search) filter.problemTitle = { $regex: search, $options: 'i' };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [docs, total] = await Promise.all([
    InnovationRequest.find(filter)
      .select('_id problemTitle postedBy category categoryOther valueChainStages operationsUndertaken regionState regionDistrict')
      .populate('postedBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    InnovationRequest.countDocuments(filter)
  ]);

  const problems = docs.map(p => ({
    id: p._id,
    title: p.problemTitle,
    vle: p.postedBy?.fullName || null,
    category: p.category || p.categoryOther || null,
    subCategory: p.valueChainStages || [],
    operations: p.operationsUndertaken || [],
    state: p.regionState || null,
    district: p.regionDistrict || null,
  }));

  res.status(200).json({
    status: 'success',
    data: {
      nodalOrgName: nodalOrgProfile?.orgName || null,
      problems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const getNodalOrgServiceRequests = catchAsync(async (req, res, next) => {
  const { nodalOrgId } = req.params;
  const { search, unitType, ownership, status, page = 1, limit = 20 } = req.query;

  const nodalOrgProfile = await NodalOrgProfile.findOne({ userId: nodalOrgId }).select('orgName').lean();

  const filter = { postedBy: nodalOrgId };
  if (status) filter.status = status.toUpperCase();
  if (unitType) filter.unitType = unitType;
  if (ownership) filter.ownership = ownership;
  if (search) filter.techName = { $regex: search, $options: 'i' };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [docs, total] = await Promise.all([
    ServiceRequest.find(filter)
      .select('_id techName postedBy registeredBy techCompany unitType ownership')
      .populate('postedBy', 'fullName')
      .populate('registeredBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    ServiceRequest.countDocuments(filter)
  ]);

  const serviceRequests = docs.map(sr => ({
    id: sr._id,
    techName: sr.techName || null,
    vle: sr.postedBy?.fullName || sr.registeredBy?.fullName || null,
    techCompany: sr.techCompany || null,
    unitType: sr.unitType || null,
    ownership: sr.ownership || null,
  }));

  res.status(200).json({
    status: 'success',
    data: {
      nodalOrgName: nodalOrgProfile?.orgName || null,
      serviceRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const requestEditNodalOrg = catchAsync(async (req, res, next) => {
  const { nodalOrgId } = req.params;
  const { reason } = req.body;

  const user = await User.findById(nodalOrgId)
    .select('_id fullName phone email role status isPhoneUser isPhoneVerified isEmailUser isEmailVerified isGoogleUser editRequested editRequestReason');
  if (!user || user.role !== 'NO') return next(new AppError('Nodal Organization not found', 404));
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
  getPendingNodalOrgs,
  getNodalOrgById,
  approveNodalOrg,
  rejectNodalOrg,
  getApprovedNodalOrgs,
  updateNodalOrg,
  getNodalOrgAos,
  getNodalOrgProblems,
  getNodalOrgServiceRequests,
  requestEditNodalOrg
};
