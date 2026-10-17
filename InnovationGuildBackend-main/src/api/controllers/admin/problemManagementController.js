const InnovationRequest = require('../../../models/InnovationRequest');
const ServiceRequest = require('../../../models/ServiceRequest');
const User = require('../../../models/User');
const VleProfile = require('../../../models/VleProfile');
const AoProfile = require('../../../models/AoProfile');
const NodalOrgProfile = require('../../../models/NodalOrgProfile');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { uploadFile, deleteFile } = require('../../../services/storage/minioService');
const { findMatchingInnovations } = require('../../../services/matching/matchingService');
const { updateProblemKeywords } = require('../../../services/matching/keywordExtractor');
const { sendProblemApprovalNotification, sendProblemRejectionNotification } = require('../../../services/notification/admin/contentApprovalNotification');
const { sendRequestEditNotification } = require('../../../services/notification/admin/requestEditNotification');
const { invalidateProblemOnApproval } = require('../../../services/cache/cacheInvalidation');
const { broadcastNewProblemPublished } = require('../../../services/notification/common/broadcastNotification');
const FacingSimilarProblem = require('../../../models/FacingSimilarProblem');
const { upsertOperations } = require('../../../utils/dbHelpers');

const getProblemDetails = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;

  const problem = await InnovationRequest.findById(problemId)
    .select('problemTitle problemDescription regionState regionDistrict regionVillage category categoryOther valueChainStages crops operationsUndertaken machineOperations currentMethodology knowMachinery machineChallenge energySource pullCapacity pullCapacityNotKnown engineCapacity motorCapacity renewableType specificInfo problemSize endProducts salesChannels newChannels currentRevenue expectedRevenue machineBudget coverImage createdAt status')
    .lean();

  if (!problem) {
    return next(new AppError('Problem not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      problem
    }
  });
});

const approveProblem = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;

  const problem = await InnovationRequest.findById(problemId);

  if (!problem) {
    return next(new AppError('Problem not found', 404));
  }

  if (problem.status !== 'PENDING_APPROVAL') {
    return next(new AppError('Only problems with PENDING_APPROVAL status can be approved', 400));
  }

  problem.status = 'PUBLISHED';
  problem.approvedAt = new Date();
  await problem.save();

  await VleProfile.updateOne(
    { userId: problem.postedBy, vleStatus: 'listed' },
    { $set: { vleStatus: 'interested' } }
  );

  const poster = await User.findById(problem.postedBy).select('_id fullName phone email isPhoneUser isPhoneVerified isEmailUser isEmailVerified isGoogleUser');
  if (poster) {
    try {
      await sendProblemApprovalNotification(problem, poster);
    } catch (error) {
      console.error('Failed to send problem approval notification:', error);
    }
    setImmediate(() =>
      broadcastNewProblemPublished(problem).catch(err =>
        console.error('Failed to broadcast new problem published:', err.message)
      )
    );
  }

  try {
    await updateProblemKeywords(problemId);
    await findMatchingInnovations(problemId);
  } catch (error) {
    console.error('Error in matching after problem approval:', error);
  }

  await invalidateProblemOnApproval(problemId);

  res.status(200).json({
    status: 'success',
    message: 'Problem approved and published successfully',
    data: {
      problem
    }
  });
});

const rejectProblem = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;
  const { rejectionReason } = req.body;

  if (!rejectionReason) {
    return next(new AppError('Rejection reason is required', 400));
  }

  const problem = await InnovationRequest.findById(problemId);

  if (!problem) {
    return next(new AppError('Problem not found', 404));
  }

  if (problem.status !== 'PENDING_APPROVAL') {
    return next(new AppError('Only problems with PENDING_APPROVAL status can be rejected', 400));
  }

  problem.status = 'REJECTED';
  problem.rejectionReason = rejectionReason;
  await problem.save();

  const poster = await User.findById(problem.postedBy).select('_id fullName phone email isPhoneUser isPhoneVerified isEmailUser isEmailVerified isGoogleUser');
  if (poster) {
    try {
      await sendProblemRejectionNotification(problem, poster, rejectionReason);
    } catch (error) {
      console.error('Failed to send problem rejection notification:', error);
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Problem rejected',
    data: {
      problem
    }
  });
});

const getAdminProblemsList = catchAsync(async (req, res, next) => {
  const {
    status, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc',
    postedBy, registeredBy, registrationType,
    search, category, operation, state, district
  } = req.query;

  const filter = {};
  filter.status = status ? status.toUpperCase() : 'PUBLISHED';
  if (postedBy) filter.postedBy = postedBy;
  if (registeredBy) filter.registeredBy = registeredBy;
  if (registrationType) filter.registrationType = registrationType.toUpperCase();
  if (state) filter.regionState = state;
  if (district) filter.regionDistrict = district;
  if (category) filter.category = category;
  if (operation) filter.operationsUndertaken = { $in: [operation] };

  if (search) {
    const matchingUsers = await User.find(
      { fullName: { $regex: search, $options: 'i' } }
    ).select('_id').lean();
    const matchingUserIds = matchingUsers.map(u => u._id);
    filter.$or = [
      { problemTitle: { $regex: search, $options: 'i' } },
      { postedBy: { $in: matchingUserIds } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const [problems, total] = await Promise.all([
    InnovationRequest.find(filter)
      .select('_id problemTitle postedBy category categoryOther valueChainStages operationsUndertaken regionState regionDistrict')
      .populate('postedBy', 'fullName')
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    InnovationRequest.countDocuments(filter)
  ]);

  const posterIds = problems.map(p => p.postedBy?._id).filter(Boolean);
  const vleProfiles = await VleProfile.find({ userId: { $in: posterIds } }).select('userId affiliatedOrg').lean();
  const vleIdSet = new Set(vleProfiles.map(v => v.userId.toString()));
  const vleAffMap = new Map(vleProfiles.map(v => [v.userId.toString(), v.affiliatedOrg?.toString()]));
  const vleAffOrgIds = vleProfiles.map(v => v.affiliatedOrg).filter(Boolean);
  const nonVleIds = posterIds.filter(id => !vleIdSet.has(id.toString()));
  const noDirectProfiles = nonVleIds.length
    ? await NodalOrgProfile.find({ userId: { $in: nonVleIds } }).select('userId orgName').lean()
    : [];
  const noIdSet = new Set(noDirectProfiles.map(n => n.userId.toString()));
  const noOrgNameMap = new Map(noDirectProfiles.map(n => [n.userId.toString(), n.orgName]));
  const aoDirectIds = nonVleIds.filter(id => !noIdSet.has(id.toString()));
  const allAoIds = [...new Set([...vleAffOrgIds, ...aoDirectIds].map(id => id.toString()))];
  const aoProfiles = allAoIds.length
    ? await AoProfile.find({ userId: { $in: allAoIds } }).select('userId orgName nodalOrg').lean()
    : [];
  const aoOrgNameMap = new Map(aoProfiles.map(a => [a.userId.toString(), a.orgName]));
  const aoNodalMap = new Map(aoProfiles.map(a => [a.userId.toString(), a.nodalOrg?.toString()]));
  const nodalOrgIds = [...new Set(aoProfiles.map(a => a.nodalOrg).filter(Boolean).map(id => id.toString()))];
  const nodalOrgProfiles = nodalOrgIds.length
    ? await NodalOrgProfile.find({ userId: { $in: nodalOrgIds } }).select('userId orgName').lean()
    : [];
  const nodalOrgNameMap = new Map(nodalOrgProfiles.map(p => [p.userId.toString(), p.orgName]));

  const mappedProblems = problems.map(p => {
    const posterId = p.postedBy?._id?.toString();
    const isVle = vleIdSet.has(posterId);
    const isNo  = noIdSet.has(posterId);
    const vleAoId = isVle ? vleAffMap.get(posterId) : null;
    return {
      id: p._id,
      posterType: isVle ? 'VLE' : isNo ? 'NO' : 'AO',
      profileId: posterId || null,
      title: p.problemTitle,
      vle: isVle
        ? p.postedBy?.fullName || null
        : isNo
          ? noOrgNameMap.get(posterId) || null
          : aoOrgNameMap.get(posterId) || null,
      category: p.category || p.categoryOther || null,
      subCategory: p.valueChainStages || [],
      operations: p.operationsUndertaken || [],
      state: p.regionState || null,
      district: p.regionDistrict || null,
      affiliatedOrg: isVle ? aoOrgNameMap.get(vleAoId) || null : null,
      nodalOrg: isVle
        ? nodalOrgNameMap.get(aoNodalMap.get(vleAoId)) || null
        : isNo
          ? null
          : nodalOrgNameMap.get(aoNodalMap.get(posterId)) || null,
    };
  });

  res.status(200).json({
    status: 'success',
    data: {
      problems: mappedProblems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const getSimilarProblems = catchAsync(async (req, res, next) => {
  const { vleId } = req.params;
  const { page = 1, limit = 20, search, category, operation } = req.query;

  const facingRecords = await FacingSimilarProblem.find({ userId: vleId }).select('problemId').lean();
  const problemIds = facingRecords.map(r => r.problemId);

  if (problemIds.length === 0) {
    return res.status(200).json({
      status: 'success',
      data: { problems: [], pagination: { page: parseInt(page), limit: parseInt(limit), total: 0, totalPages: 0 } }
    });
  }

  const filter = { _id: { $in: problemIds }, status: 'PUBLISHED' };
  if (search) filter.problemTitle = { $regex: search, $options: 'i' };
  if (category) filter.category = category;
  if (operation) filter.operationsUndertaken = { $in: [operation] };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [docs, total] = await Promise.all([
    InnovationRequest.find(filter)
      .select('_id problemTitle postedBy category categoryOther valueChainStages operationsUndertaken regionState regionDistrict')
      .populate('postedBy', 'fullName')
      .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
    InnovationRequest.countDocuments(filter)
  ]);

  const posterIds = docs.map(p => p.postedBy?._id || p.postedBy).filter(Boolean);
  const vleProfiles = await VleProfile.find({ userId: { $in: posterIds } })
    .select('userId affiliatedOrg').lean();
  const vleAffMap = new Map(vleProfiles.map(v => [v.userId.toString(), v.affiliatedOrg]));

  const affiliatedOrgIds = [...new Set(vleProfiles.map(v => v.affiliatedOrg).filter(Boolean).map(id => id.toString()))];
  const aoProfiles = affiliatedOrgIds.length
    ? await AoProfile.find({ userId: { $in: affiliatedOrgIds } }).select('userId orgName nodalOrg').lean()
    : [];
  const nodalOrgIds = [...new Set(aoProfiles.map(a => a.nodalOrg).filter(Boolean))];
  const nodalOrgProfiles = nodalOrgIds.length
    ? await NodalOrgProfile.find({ userId: { $in: nodalOrgIds } }).select('userId orgName').lean()
    : [];
  const nodalOrgNameMap = new Map(nodalOrgProfiles.map(p => [p.userId.toString(), p.orgName]));
  const aoNodalMap = new Map(aoProfiles.map(a => [a.userId.toString(), nodalOrgNameMap.get(a.nodalOrg?.toString()) || null]));
  const aoNameMap = new Map(aoProfiles.map(a => [a.userId.toString(), a.orgName || null]));

  const problems = docs.map(p => {
    const posterId = p.postedBy?._id?.toString();
    const affOrg = vleAffMap.get(posterId) || null;
    return {
      id: p._id,
      posterType: 'VLE',
      profileId: p.postedBy?._id || null,
      title: p.problemTitle,
      vle: p.postedBy?.fullName || null,
      category: p.category || p.categoryOther || null,
      subCategory: p.valueChainStages || [],
      operations: p.operationsUndertaken || [],
      state: p.regionState || null,
      district: p.regionDistrict || null,
      affiliatedOrg: aoNameMap.get(affOrg?.toString()) || null,
      nodalOrg: aoNodalMap.get(affOrg?.toString()) || null,
    };
  });

  res.status(200).json({
    status: 'success',
    data: {
      problems,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    }
  });
});

const updateProblem = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;

  const problem = await InnovationRequest.findById(problemId);
  if (!problem) {
    return next(new AppError('Problem not found', 404));
  }

  if (req.files?.cover?.[0]) {
    if (problem.coverImage) {
      try { await deleteFile(problem.coverImage); } catch (e) { /* ignore */ }
    }
    const coverFile = req.files.cover[0];
    const uploadedCover = await uploadFile(
      coverFile.buffer,
      coverFile.originalname,
      coverFile.mimetype,
      `problems/${problemId}/cover`
    );
    problem.coverImage = uploadedCover.url;
  } else if (req.body.uploadedImage === null) {
    if (problem.coverImage) {
      try { await deleteFile(problem.coverImage); } catch (e) { /* ignore */ }
    }
    problem.coverImage = null;
  }

  const allowedUpdates = [
    'problemTitle', 'problemDescription',
    'regionState', 'regionDistrict', 'regionVillage',
    'category', 'categoryOther', 'valueChainStages', 'crops',
    'operationsUndertaken', 'machineOperations', 'currentMethodology',
    'knowMachinery', 'machineChallenge',
    'energySource', 'pullCapacity', 'pullCapacityNotKnown',
    'engineCapacity', 'motorCapacity', 'renewableType',
    'specificInfo', 'problemSize', 'endProducts', 'salesChannels', 'newChannels',
    'currentRevenue', 'expectedRevenue', 'machineBudget'
  ];

  const ARRAY_FIELDS = new Set(['valueChainStages', 'operationsUndertaken', 'machineOperations', 'energySource']);

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      let val = req.body[field];
      if (ARRAY_FIELDS.has(field) && typeof val === 'string') {
        try { val = JSON.parse(val); } catch (e) { /* leave as-is */ }
      }
      problem[field] = val;
    }
  });

  if (!problem.categoryOther) problem.categoryOther = undefined;

  await problem.save();
  await upsertOperations(req.body.operationsUndertaken);
  await upsertOperations(req.body.machineOperations);

  res.status(200).json({
    status: 'success',
    message: 'Problem updated successfully',
    data: { problem }
  });
});

const requestEditProblem = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;
  const { reason } = req.body;

  if (!reason) {
    return next(new AppError('A reason is required when requesting an edit', 400));
  }

  const problem = await InnovationRequest.findById(problemId);
  if (!problem) {
    return next(new AppError('Problem not found', 404));
  }

  problem.status = 'DRAFT';
  problem.rejectionReason = reason;
  await problem.save();

  const poster = await User.findById(problem.postedBy).select('_id fullName phone email isPhoneUser isPhoneVerified isEmailUser isEmailVerified isGoogleUser');
  if (poster) {
    try {
      await sendRequestEditNotification(poster, reason, 'Problem', problem.problemTitle);
    } catch (error) {
      console.error('Failed to send request-edit notification:', error);
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Edit requested successfully. Problem returned to draft.',
    data: { problem }
  });
});

const getServiceRequestDetails = catchAsync(async (req, res, next) => {
  const { serviceRequestId } = req.params;

  const serviceRequest = await ServiceRequest.findById(serviceRequestId)
    .select('unitType techName techSpecs techCompany cost ownership individualBusinessPlan challenges photosLink createdAt status')
    .lean();

  if (!serviceRequest) {
    return next(new AppError('Service request not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      serviceRequest
    }
  });
});

const getAdminServiceRequestsList = catchAsync(async (req, res, next) => {
  const {
    status, postedBy, registeredBy, registrationType, unitType,
    search, ownership,
    page = 1, limit = 20, sortBy = 'createdAt', order = 'desc'
  } = req.query;

  const filter = {};
  filter.status = status ? status.toUpperCase() : 'PUBLISHED';
  if (postedBy) filter.postedBy = postedBy;
  if (registeredBy) filter.registeredBy = registeredBy;
  if (registrationType) filter.registrationType = registrationType.toUpperCase();
  if (unitType) filter.unitType = unitType;
  if (ownership) filter.ownership = ownership;

  if (search) {
    const matchingUsers = await User.find(
      { fullName: { $regex: search, $options: 'i' } }
    ).select('_id').lean();
    const matchingUserIds = matchingUsers.map(u => u._id);
    filter.$or = [
      { techName: { $regex: search, $options: 'i' } },
      { postedBy: { $in: matchingUserIds } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const [serviceRequests, total] = await Promise.all([
    ServiceRequest.find(filter)
      .select('_id techName postedBy techCompany unitType ownership')
      .populate('postedBy', 'fullName')
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    ServiceRequest.countDocuments(filter)
  ]);

  const posterIds = serviceRequests.map(s => s.postedBy?._id).filter(Boolean);
  const vleProfiles = await VleProfile.find({ userId: { $in: posterIds } }).select('userId affiliatedOrg').lean();
  const vleIdSet = new Set(vleProfiles.map(v => v.userId.toString()));
  const vleAffMap = new Map(vleProfiles.map(v => [v.userId.toString(), v.affiliatedOrg?.toString()]));
  const vleAffOrgIds = vleProfiles.map(v => v.affiliatedOrg).filter(Boolean);
  const nonVleIds = posterIds.filter(id => !vleIdSet.has(id.toString()));
  const noDirectProfiles = nonVleIds.length
    ? await NodalOrgProfile.find({ userId: { $in: nonVleIds } }).select('userId orgName').lean()
    : [];
  const noIdSet = new Set(noDirectProfiles.map(n => n.userId.toString()));
  const noOrgNameMap = new Map(noDirectProfiles.map(n => [n.userId.toString(), n.orgName]));
  const aoDirectIds = nonVleIds.filter(id => !noIdSet.has(id.toString()));
  const allAoIds = [...new Set([...vleAffOrgIds, ...aoDirectIds].map(id => id.toString()))];
  const aoProfiles = allAoIds.length
    ? await AoProfile.find({ userId: { $in: allAoIds } }).select('userId orgName nodalOrg').lean()
    : [];
  const aoOrgNameMap = new Map(aoProfiles.map(a => [a.userId.toString(), a.orgName]));
  const aoNodalMap = new Map(aoProfiles.map(a => [a.userId.toString(), a.nodalOrg?.toString()]));
  const nodalOrgIds = [...new Set(aoProfiles.map(a => a.nodalOrg).filter(Boolean).map(id => id.toString()))];
  const nodalOrgProfiles = nodalOrgIds.length
    ? await NodalOrgProfile.find({ userId: { $in: nodalOrgIds } }).select('userId orgName').lean()
    : [];
  const nodalOrgNameMap = new Map(nodalOrgProfiles.map(p => [p.userId.toString(), p.orgName]));

  const mappedRequests = serviceRequests.map(sr => {
    const posterId = sr.postedBy?._id?.toString();
    const isVle = vleIdSet.has(posterId);
    const isNo  = noIdSet.has(posterId);
    const vleAoId = isVle ? vleAffMap.get(posterId) : null;
    return {
      id: sr._id,
      posterType: isVle ? 'VLE' : isNo ? 'NO' : 'AO',
      profileId: posterId || null,
      techName: sr.techName || null,
      vle: isVle
        ? sr.postedBy?.fullName || null
        : isNo
          ? noOrgNameMap.get(posterId) || null
          : aoOrgNameMap.get(posterId) || null,
      techCompany: sr.techCompany || null,
      unitType: sr.unitType || null,
      ownership: sr.ownership || null,
      affiliatedOrg: isVle ? aoOrgNameMap.get(vleAoId) || null : null,
      nodalOrg: isVle
        ? nodalOrgNameMap.get(aoNodalMap.get(vleAoId)) || null
        : isNo
          ? null
          : nodalOrgNameMap.get(aoNodalMap.get(posterId)) || null,
    };
  });

  res.status(200).json({
    status: 'success',
    data: {
      serviceRequests: mappedRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const updateServiceRequest = catchAsync(async (req, res, next) => {
  const { serviceRequestId } = req.params;

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    return next(new AppError('Service request not found', 404));
  }

  const allowedUpdates = [
    'unitType', 'techName', 'techSpecs',
    'techCompany', 'techCompanyNotAvailable',
    'cost', 'ownership', 'individualBusinessPlan',
    'challenges', 'photosLink'
  ];

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      serviceRequest[field] = req.body[field];
    }
  });

  await serviceRequest.save();

  res.status(200).json({
    status: 'success',
    message: 'Service request updated successfully',
    data: { serviceRequest }
  });
});

const requestEditServiceRequest = catchAsync(async (req, res, next) => {
  const { serviceRequestId } = req.params;
  const { reason } = req.body;

  if (!reason) {
    return next(new AppError('A reason is required when requesting an edit', 400));
  }

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    return next(new AppError('Service request not found', 404));
  }

  serviceRequest.status = 'DRAFT';
  await serviceRequest.save();

  const poster = await User.findById(serviceRequest.postedBy).select('_id fullName phone email isPhoneUser isPhoneVerified isEmailUser isEmailVerified isGoogleUser');
  if (poster) {
    try {
      await sendRequestEditNotification(poster, reason, 'Service Request', serviceRequest.techName);
    } catch (error) {
      console.error('Failed to send request-edit notification:', error);
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Edit requested successfully. Service request returned to draft.',
    data: { serviceRequest }
  });
});

module.exports = {
  getProblemDetails,
  approveProblem,
  rejectProblem,
  getAdminProblemsList,
  getSimilarProblems,
  updateProblem,
  requestEditProblem,
  getServiceRequestDetails,
  getAdminServiceRequestsList,
  updateServiceRequest,
  requestEditServiceRequest,
};
