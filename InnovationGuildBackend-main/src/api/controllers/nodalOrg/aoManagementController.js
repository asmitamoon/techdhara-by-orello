const User = require('../../../models/User');
const AoProfile = require('../../../models/AoProfile');
const NodalOrgProfile = require('../../../models/NodalOrgProfile');
const VleProfile = require('../../../models/VleProfile');
const InnovationRequest = require('../../../models/InnovationRequest');
const ServiceRequest = require('../../../models/ServiceRequest');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { uploadFile, deleteFile } = require('../../../services/storage/minioService');

// Shared scope check (by User._id)
const checkAoInScope = async (aoId, noUserId) => {
  const profile = await AoProfile.findOne({ userId: aoId });
  if (!profile) return { error: 'AO not found', status: 404 };
  if (profile.nodalOrg.toString() !== noUserId.toString())
    return { error: 'You are not authorized to manage this AO', status: 403 };
  return { profile };
};

const getApprovedAos = catchAsync(async (req, res, next) => {
  const { status, search, state, district, page = 1, limit = 20 } = req.query;

  const profileFilter = { nodalOrg: req.user._id };
  if (state) profileFilter.state = { $regex: state, $options: 'i' };
  if (district) profileFilter.district = { $regex: district, $options: 'i' };
  if (search) profileFilter.orgName = { $regex: search, $options: 'i' };

  const profiles = await AoProfile.find(profileFilter)
    .select('userId orgName state district pocName')
    .lean();

  const userIdSet = profiles.map(p => p.userId);
  const userFilter = { _id: { $in: userIdSet }, role: 'AO', status: status ? status.toUpperCase() : 'APPROVED' };
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(userFilter).select('_id').sort({ signUpDate: -1 }).skip(skip).limit(parseInt(limit)).lean(),
    User.countDocuments(userFilter)
  ]);

  const aoUserIds = users.map(u => u._id);

  const vleProfiles = await VleProfile.find({ affiliatedOrg: { $in: aoUserIds } })
    .select('userId affiliatedOrg')
    .lean();

  const vleCountByAo = {};
  const vleUsersByAo = {};
  aoUserIds.forEach(id => { const k = id.toString(); vleCountByAo[k] = 0; vleUsersByAo[k] = []; });
  vleProfiles.forEach(vp => {
    const k = vp.affiliatedOrg.toString();
    vleCountByAo[k] = (vleCountByAo[k] || 0) + 1;
    if (!vleUsersByAo[k]) vleUsersByAo[k] = [];
    vleUsersByAo[k].push(vp.userId);
  });

  const allVleUserIds = vleProfiles.map(vp => vp.userId);

  const [aoProbAgg, vleProbAgg] = await Promise.all([
    InnovationRequest.aggregate([
      { $match: { postedBy: { $in: aoUserIds } } },
      { $group: { _id: '$postedBy', count: { $sum: 1 } } }
    ]),
    allVleUserIds.length > 0
      ? InnovationRequest.aggregate([
        { $match: { postedBy: { $in: allVleUserIds } } },
        { $group: { _id: '$postedBy', count: { $sum: 1 } } }
      ])
      : Promise.resolve([])
  ]);

  const probByAo = {};
  aoProbAgg.forEach(({ _id, count }) => { probByAo[_id.toString()] = count; });

  const vleToAoMap = {};
  vleProfiles.forEach(vp => { vleToAoMap[vp.userId.toString()] = vp.affiliatedOrg.toString(); });
  const probVleByAo = {};
  vleProbAgg.forEach(({ _id, count }) => {
    const aoId = vleToAoMap[_id.toString()];
    if (aoId) probVleByAo[aoId] = (probVleByAo[aoId] || 0) + count;
  });

  const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));
  const aos = users.map(u => {
    const k = u._id.toString();
    const vleProbCount = probVleByAo[k] || 0;
    return {
      _id: u._id,
      profile: profileMap.get(k) || null,
      vleCount: vleCountByAo[k] || 0,
      probCount: probByAo[k] || 0,
      probVleCount: vleProbCount,
    };
  });

  res.status(200).json({
    status: 'success',
    data: { aos, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } }
  });
});

const getAoById = catchAsync(async (req, res, next) => {
  const { aoId } = req.params;

  const user = await User.findById(aoId).select('profilePicture status role');
  if (!user || user.role !== 'AO') return next(new AppError('AO not found', 404));

  const { error, status, profile } = await checkAoInScope(aoId, req.user._id);
  if (error) return next(new AppError(error, status));

  let nodalOrgName = null;
  if (profile.nodalOrg) {
    const noProfile = await NodalOrgProfile.findOne({ userId: profile.nodalOrg }).select('orgName');
    nodalOrgName = noProfile?.orgName || null;
  }

  res.status(200).json({
    status: 'success',
    data: { user, profile: { ...profile.toObject(), nodalOrgName } },
  });
});

const updateAo = catchAsync(async (req, res, next) => {
  const { aoId } = req.params;

  const { error, status, profile } = await checkAoInScope(aoId, req.user._id);
  if (error) return next(new AppError(error, status));

  const allowedFields = ['orgName', 'orgType', 'orgTypeOther', 'streamOfWork', 'streamOfWorkOther', 'pocName', 'village', 'district', 'state', 'website'];
  allowedFields.forEach(f => { if (req.body[f] !== undefined) profile[f] = req.body[f]; });

  if (req.file) {
    const aoUser = await User.findById(aoId).select('profilePicture').lean();
    if (aoUser?.profilePicture) deleteFile(aoUser.profilePicture).catch(() => {});
    const uploadResult = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, `users/${aoId}/profile-picture`);
    await User.findByIdAndUpdate(aoId, { profilePicture: uploadResult.url });
  }

  await profile.save();
  res.status(200).json({ status: 'success', message: 'AO updated successfully', data: { profile } });
});


const getAoVles = catchAsync(async (req, res, next) => {
  const { aoId } = req.params;
  const { state, district, vleStatus, search, page = 1, limit = 20 } = req.query;

  const { error, status } = await checkAoInScope(aoId, req.user._id);
  if (error) return next(new AppError(error, status));

  const vleFilter = { affiliatedOrg: aoId };
  if (state) vleFilter.state = state;
  if (district) vleFilter.district = district;
  if (vleStatus) vleFilter.vleStatus = vleStatus;

  if (search) {
    const matched = await User.find({
      role: 'VLE', $or: [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }).select('_id').lean();
    vleFilter.userId = { $in: matched.map(u => u._id) };
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

  const problemCounts = await InnovationRequest.aggregate([
    { $match: { postedBy: { $in: vleUserIds }, status: 'PUBLISHED' } },
    { $group: { _id: '$postedBy', count: { $sum: 1 } } }
  ]);
  const problemCountMap = new Map(problemCounts.map(p => [p._id.toString(), p.count]));

  const vles = vleProfiles.map(p => {
    const user = userMap.get(p.userId.toString()) || {};
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
      problems: problemCountMap.get(p.userId.toString()) || 0,
    };
  });

  res.status(200).json({
    status: 'success',
    data: { vles, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } }
  });
});

const getAoProblems = catchAsync(async (req, res, next) => {
  const { aoId } = req.params;
  const { search, category, status, page = 1, limit = 20 } = req.query;

  const { error, status: errStatus, profile } = await checkAoInScope(aoId, req.user._id);
  if (error) return next(new AppError(error, errStatus));

  const nodalProfile = await NodalOrgProfile.findOne({ userId: profile.nodalOrg }).select('orgName').lean();

  const filter = { postedBy: aoId };
  filter.status = status ? status.toUpperCase() : 'PUBLISHED';
  if (category) filter.category = category;
  if (search) filter.problemTitle = { $regex: search, $options: 'i' };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [docs, total] = await Promise.all([
    InnovationRequest.find(filter)
      .select('_id problemTitle postedBy category categoryOther valueChainStages operationsUndertaken regionState regionDistrict')
      .populate('postedBy', 'fullName')
      .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
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
      affiliatedOrgName: profile.orgName || null,
      nodalOrgName: nodalProfile?.orgName || null,
      problems,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    }
  });
});

const getAoServiceRequests = catchAsync(async (req, res, next) => {
  const { aoId } = req.params;
  const { search, status, page = 1, limit = 20 } = req.query;

  const { error, status: errStatus, profile } = await checkAoInScope(aoId, req.user._id);
  if (error) return next(new AppError(error, errStatus));

  const nodalProfile = await NodalOrgProfile.findOne({ userId: profile.nodalOrg }).select('orgName').lean();

  const filter = { postedBy: aoId };
  if (status) filter.status = status.toUpperCase();
  if (search) filter.techName = { $regex: search, $options: 'i' };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [docs, total] = await Promise.all([
    ServiceRequest.find(filter)
      .select('_id techName postedBy registeredBy techCompany unitType ownership')
      .populate('postedBy', 'fullName')
      .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
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
  }));

  res.status(200).json({
    status: 'success',
    data: {
      affiliatedOrgName: profile.orgName || null,
      nodalOrgName: nodalProfile?.orgName || null,
      serviceRequests,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    }
  });
});

module.exports = { getApprovedAos, getAoById, updateAo, getAoVles, getAoProblems, getAoServiceRequests };
