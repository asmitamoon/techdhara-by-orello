const User = require('../../../models/User');
const AoProfile = require('../../../models/AoProfile');
const NodalOrgProfile = require('../../../models/NodalOrgProfile');
const VleProfile = require('../../../models/VleProfile');
const InnovationRequest = require('../../../models/InnovationRequest');
const ServiceRequest = require('../../../models/ServiceRequest');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { sendApprovalNotification, sendRejectionNotification } = require('../../../services/notification/admin/userApprovalNotification');
const { broadcastNewAoApproved } = require('../../../services/notification/common/broadcastNotification');
const { sendRequestEditNotification } = require('../../../services/notification/admin/requestEditNotification');
const { uploadFile, deleteFile } = require('../../../services/storage/minioService');

const getApprovedAos = catchAsync(async (req, res, next) => {
  const { status, search, state, district, nodalOrg, page = 1, limit = 20 } = req.query;

  // Build profile-level filter first (location/org fields live in AoProfile)
  const profileFilter = {};
  if (state) profileFilter.state = { $regex: state, $options: 'i' };
  if (district) profileFilter.district = { $regex: district, $options: 'i' };
  if (nodalOrg) profileFilter.nodalOrg = nodalOrg;
  if (search) profileFilter.orgName = { $regex: search, $options: 'i' };

  const profiles = await AoProfile.find(profileFilter)
    .select('userId orgName state district nodalOrg orgType pocName')
    .lean();

  const userIdSet = profiles.map(p => p.userId);

  const resolvedStatus = status ? status.toUpperCase() : 'APPROVED';
  const userFilter = {
    _id: { $in: userIdSet },
    role: 'AO',
    status: resolvedStatus,
    ...(resolvedStatus === 'PENDING' && { editRequested: { $ne: true } }),
  };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(userFilter)
      .select('_id')
      .sort({ signUpDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments(userFilter)
  ]);

  const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));
  const result = users.map(u => ({ ...u, profile: profileMap.get(u._id.toString()) || null }));

  // Batch-fetch NO org names
  const nodalOrgIds = [...new Set(profiles.map(p => p.nodalOrg).filter(Boolean))];
  const nodalOrgProfilesData = nodalOrgIds.length
    ? await NodalOrgProfile.find({ userId: { $in: nodalOrgIds } }).select('userId orgName').lean()
    : [];
  const nodalOrgNameMap = new Map(nodalOrgProfilesData.map(p => [p.userId.toString(), p.orgName]));

  // Batch-compute counts — scope to current page only
  const aoUserIds = users.map(u => u._id);
  const vleQuery = { affiliatedOrg: { $in: aoUserIds } };

  const vleProfilesForCounts = await VleProfile.find(vleQuery).select('userId affiliatedOrg').lean();
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

  const enrichedResult = result.map(ao => {
    const aoId = ao._id?.toString();
    const nodalOrgName = nodalOrgNameMap.get(ao.profile?.nodalOrg?.toString()) || null;
    return {
      _id: ao._id,
      profile: ao.profile,
      vleCount: (vlesByAo[aoId] || []).length,
      probCount: probByAo[aoId] || 0,
      probVleCount: probVleByAo[aoId] || 0,
      nodalOrgName,
    };
  });

  res.status(200).json({
    status: 'success',
    data: {
      aos: enrichedResult,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const getAoById = catchAsync(async (req, res, next) => {
  const { aoId } = req.params;

  const user = await User.findById(aoId).select('profilePicture status role editRequested editRequestReason');
  if (!user || user.role !== 'AO') {
    return next(new AppError('AO not found', 404));
  }

  const profile = await AoProfile.findOne({ userId: aoId })
    .populate('nodalOrg', 'email')
    .lean();

  if (!profile) {
    return next(new AppError('AO profile not found', 404));
  }

  // Attach nodalOrg orgName from NodalOrgProfile (NO users don't have fullName on User)
  if (profile?.nodalOrg?._id) {
    const nodalOrgProfile = await NodalOrgProfile.findOne({ userId: profile.nodalOrg._id }).select('orgName').lean();
    profile.nodalOrg.orgName = nodalOrgProfile?.orgName || null;
  }

  res.status(200).json({
    status: 'success',
    data: { user, profile }
  });
});

const approveAo = catchAsync(async (req, res, next) => {
  const { aoId } = req.params;

  const user = await User.findById(aoId);
  if (!user || user.role !== 'AO') {
    return next(new AppError('AO not found', 404));
  }

  if (user.status === 'APPROVED') {
    return next(new AppError('AO is already approved', 400));
  }

  if (user.status !== 'PENDING') {
    return next(new AppError('Only pending AOs can be approved', 400));
  }

  user.status = 'APPROVED';
  user.approvedAt = new Date();
  await user.save();

  try {
    await sendApprovalNotification(user);
  } catch (err) {
    console.error('Failed to send AO approval notification:', err.message);
  }

  const aoProfile = await AoProfile.findOne({ userId: user._id });

  if (aoProfile?.nodalOrg) {
    await NodalOrgProfile.findOneAndUpdate(
      { userId: aoProfile.nodalOrg },
      { $inc: { numberOfAffiliatedOrgs: 1 } }
    ).catch(err => console.error('Failed to update NO affiliated org count:', err.message));
  }

  setImmediate(() =>
    broadcastNewAoApproved(user, aoProfile).catch(err =>
      console.error('Failed to broadcast new AO approved:', err.message)
    )
  );

  res.status(200).json({
    status: 'success',
    message: 'AO approved successfully',
    data: {
      userId: user._id,
      status: user.status,
      orgName: aoProfile?.orgName || null
    }
  });
});

const rejectAo = catchAsync(async (req, res, next) => {
  const { aoId } = req.params;
  const { reason } = req.body;

  if (!reason) {
    return next(new AppError('Reason is required', 400));
  }

  const user = await User.findById(aoId);
  if (!user || user.role !== 'AO') {
    return next(new AppError('AO not found', 404));
  }

  if (user.status === 'REJECTED') {
    return next(new AppError('AO is already rejected', 400));
  }

  if (user.status !== 'PENDING') {
    return next(new AppError('Only pending AOs can be rejected', 400));
  }

  user.status = 'REJECTED';
  await user.save();

  const aoProfile = await AoProfile.findOne({ userId: aoId }).select('orgName').lean();

  try {
    await sendRejectionNotification(user, reason);
  } catch (err) {
    console.error('Failed to send AO rejection notification:', err.message);
  }

  res.status(200).json({
    status: 'success',
    message: 'AO rejected successfully',
    data: {
      userId: user._id,
      status: user.status,
      orgName: aoProfile?.orgName || null,
      reason
    }
  });
});

const updateAo = catchAsync(async (req, res, next) => {
  const { aoId } = req.params;

  const user = await User.findById(aoId);
  if (!user || user.role !== 'AO') {
    return next(new AppError('AO not found', 404));
  }

  const allowedFields = [
    'orgName', 'orgType', 'orgTypeOther', 'streamOfWork', 'streamOfWorkOther',
    'pocName', 'village', 'district', 'state', 'website'
  ];
  const updates = {};
  allowedFields.forEach(f => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  if (req.body.nodalOrg) {
    const noUser = await User.findById(req.body.nodalOrg);
    if (!noUser || noUser.role !== 'NO') {
      return next(new AppError('Invalid Nodal Organization', 400));
    }
    updates.nodalOrg = req.body.nodalOrg;
  }

  if (req.file) {
    if (user.profilePicture) deleteFile(user.profilePicture).catch(() => {});
    const uploadResult = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, `users/${user._id}/profile-picture`);
    user.profilePicture = uploadResult.url;
    await user.save();
  }

  const profile = await AoProfile.findOneAndUpdate(
    { userId: aoId },
    updates,
    { new: true, runValidators: true }
  ).lean();

  if (!profile) {
    return next(new AppError('AO profile not found', 404));
  }

  const nodalOrgProfile = profile.nodalOrg
    ? await NodalOrgProfile.findOne({ userId: profile.nodalOrg }).select('orgName').lean()
    : null;

  res.status(200).json({
    status: 'success',
    message: 'AO updated successfully',
    data: { profile, nodalOrgName: nodalOrgProfile?.orgName || null }
  });
});


const getAoVles = catchAsync(async (req, res, next) => {
  const { aoId } = req.params;
  const { state, district, village, gender, vleStatus, search, persona, page = 1, limit = 20 } = req.query;

  const ao = await AoProfile.findOne({ userId: aoId }).select('_id').lean();
  if (!ao) {
    return next(new AppError('AO not found', 404));
  }

  const vleFilter = { affiliatedOrg: aoId };
  if (state) vleFilter.state = state;
  if (district) vleFilter.district = district;
  if (village) vleFilter.village = { $regex: village, $options: 'i' };
  if (gender) vleFilter.gender = gender;
  if (vleStatus) vleFilter.vleStatus = vleStatus;
  if (persona) vleFilter.interestedPersonas = { $in: [persona] };
  if (search) {
    const matchedUsers = await User.find({
      role: 'VLE',
      $or: [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }).select('_id').lean();
    vleFilter.userId = { $in: matchedUsers.map(u => u._id) };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [vleProfiles, total] = await Promise.all([
    VleProfile.find(vleFilter)
      .select('userId vleStatus gender state district village mobile interestedPersonas trainings')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    VleProfile.countDocuments(vleFilter)
  ]);

  const vleUserIds = vleProfiles.map(p => p.userId);

  const vleUsers = await User.find({ _id: { $in: vleUserIds } })
    .select('_id fullName email phone')
    .lean();

  const userMap = new Map(vleUsers.map(u => [u._id.toString(), u]));

  const innovProbs = vleUserIds.length
    ? await InnovationRequest.aggregate([
      { $match: { postedBy: { $in: vleUserIds }, status: 'PUBLISHED' } },
      { $group: { _id: '$postedBy', count: { $sum: 1 } } }
    ])
    : [];
  const innovProbMap = new Map(innovProbs.map(v => [v._id.toString(), v.count]));

  const vles = vleProfiles.map(p => {
    const user = userMap.get(p.userId.toString()) || {};
    const id = p.userId.toString();
    return {
      id: p.userId,
      name: user.fullName || null,
      email: user.email || null,
      mobile: p.mobile || user.phone || null,
      vleStatus: p.vleStatus,
      gender: p.gender,
      state: p.state,
      district: p.district,
      village: p.village,
      interestedPersonas: p.interestedPersonas || [],
      trainings: p.trainings || [],
      problems: innovProbMap.get(id) || 0,
    };
  });

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

const getAoProblems = catchAsync(async (req, res, next) => {
  const { aoId } = req.params;
  const { search, category, operation, state, district, status, page = 1, limit = 20 } = req.query;

  const ao = await AoProfile.findOne({ userId: aoId }).select('_id orgName nodalOrg').lean();
  if (!ao) {
    return next(new AppError('AO not found', 404));
  }

  const nodalProfile = await NodalOrgProfile.findOne({ userId: ao.nodalOrg }).select('orgName').lean();

  const filter = { postedBy: aoId };
  if (status) filter.status = status.toUpperCase();
  if (category) filter.category = category;
  if (operation) filter.operationsUndertaken = { $in: [operation] };
  if (state) filter.regionState = state;
  if (district) filter.regionDistrict = district;
  if (search) filter.problemTitle = { $regex: search, $options: 'i' };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [docs, total] = await Promise.all([
    InnovationRequest.find(filter)
      .select('_id problemTitle postedBy category categoryOther valueChainStages operationsUndertaken regionState regionDistrict status')
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
    status: p.status,
  }));

  res.status(200).json({
    status: 'success',
    data: {
      affiliatedOrgName: ao.orgName || null,
      nodalOrgName: nodalProfile?.orgName || null,
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

const getAoServiceRequests = catchAsync(async (req, res, next) => {
  const { aoId } = req.params;
  const { search, unitType, ownership, status, page = 1, limit = 20 } = req.query;

  const ao = await AoProfile.findOne({ userId: aoId }).select('_id orgName nodalOrg').lean();
  if (!ao) {
    return next(new AppError('AO not found', 404));
  }

  const nodalProfile = await NodalOrgProfile.findOne({ userId: ao.nodalOrg }).select('orgName').lean();

  const filter = { postedBy: aoId };
  if (status) filter.status = status.toUpperCase();
  if (unitType) filter.unitType = unitType;
  if (ownership) filter.ownership = ownership;
  if (search) filter.techName = { $regex: search, $options: 'i' };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [docs, total] = await Promise.all([
    ServiceRequest.find(filter)
      .select('_id techName postedBy registeredBy techCompany unitType ownership status')
      .populate('postedBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    ServiceRequest.countDocuments(filter)
  ]);

  const serviceRequests = docs.map(sr => ({
    id: sr._id,
    techName: sr.techName || null,
    vle: sr.postedBy?.fullName || null,
    techCompany: sr.techCompany || null,
    unitType: sr.unitType || null,
    ownership: sr.ownership || null,
    status: sr.status,
  }));

  res.status(200).json({
    status: 'success',
    data: {
      affiliatedOrgName: ao.orgName || null,
      nodalOrgName: nodalProfile?.orgName || null,
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

const requestEditAo = catchAsync(async (req, res, next) => {
  const { aoId } = req.params;
  const { reason } = req.body;

  const user = await User.findById(aoId)
    .select('_id fullName phone email role status isPhoneUser isPhoneVerified isEmailUser isEmailVerified isGoogleUser editRequested editRequestReason');
  if (!user || user.role !== 'AO') return next(new AppError('AO not found', 404));
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
  getApprovedAos,
  getAoById,
  approveAo,
  rejectAo,
  updateAo,
  getAoVles,
  getAoProblems,
  getAoServiceRequests,
  requestEditAo
};
