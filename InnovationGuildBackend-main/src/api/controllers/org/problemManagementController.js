const InnovationRequest = require('../../../models/InnovationRequest');
const ServiceRequest = require('../../../models/ServiceRequest');
const FacingSimilarProblem = require('../../../models/FacingSimilarProblem');
const VleProfile = require('../../../models/VleProfile');
const AoProfile = require('../../../models/AoProfile');
const NodalOrgProfile = require('../../../models/NodalOrgProfile');
const User = require('../../../models/User');
const catchAsync = require('../../../utils/catchAsync');
const { AppError } = require('../../../utils/errorHandler');
const { uploadFile, uploadMultipleFiles, deleteFile } = require('../../../services/storage/minioService');
const { findMatchingInnovations } = require('../../../services/matching/matchingService');
const { updateProblemKeywords } = require('../../../services/matching/keywordExtractor');
const { sendProblemApprovalNotification, sendProblemRejectionNotification } = require('../../../services/notification/admin/contentApprovalNotification');
const { sendRequestEditNotification } = require('../../../services/notification/admin/requestEditNotification');
const { invalidateProblemOnApproval } = require('../../../services/cache/cacheInvalidation');
const { sendProblemCreatedForVle } = require('../../../services/notification/vle/vleNotification');
const { broadcastNewProblemPublished } = require('../../../services/notification/common/broadcastNotification');
const { upsertOperations } = require('../../../utils/dbHelpers');

// Shared helper: build scope data (allPosters, aoOrgMap, nodalOrgName) from orgScope
const buildOrgScope = async (req) => {
  const vleProfiles = await VleProfile.find(req.orgScope.vleFilter).select('userId affiliatedOrg').lean();
  const vleUserIds = vleProfiles.map(v => v.userId);
  const vleToAoMap = {};
  const vleIdMap = {};
  vleProfiles.forEach(v => {
    vleToAoMap[v.userId.toString()] = v.affiliatedOrg.toString();
    vleIdMap[v.userId.toString()] = v._id.toString();
  });

  let allPosters = vleUserIds;
  let aoOrgMap = {};
  let aoProfileIdMap = {};
  let nodalOrgName = null;

  if (req.orgScope.role === 'NO') {
    const aoUserIds = req.orgScope.aoUserIds;
    allPosters = [...aoUserIds, ...vleUserIds];
    const [aoProfiles, nodalProfile] = await Promise.all([
      AoProfile.find({ userId: { $in: aoUserIds } }).select('userId orgName').lean(),
      NodalOrgProfile.findOne({ userId: req.user._id }).select('orgName').lean(),
    ]);
    aoProfiles.forEach(p => {
      aoOrgMap[p.userId.toString()] = p.orgName;
      aoProfileIdMap[p.userId.toString()] = p._id.toString();
    });
    nodalOrgName = nodalProfile?.orgName || null;
  } else {
    const aoProfile = await AoProfile.findOne({ userId: req.user._id }).select('orgName nodalOrg').lean();
    aoOrgMap[req.user._id.toString()] = aoProfile?.orgName || null;
    if (aoProfile?.nodalOrg) {
      const nodalProfile = await NodalOrgProfile.findOne({ userId: aoProfile.nodalOrg }).select('orgName').lean();
      nodalOrgName = nodalProfile?.orgName || null;
    }
  }

  return { allPosters, vleToAoMap, aoOrgMap, nodalOrgName, vleIdMap, aoProfileIdMap };
};

const getOrgProblemsList = catchAsync(async (req, res, next) => {
  const { search, category, operation, state, district, status, vleId, page = 1, limit = 20 } = req.query;

  const { allPosters, vleToAoMap, aoOrgMap, nodalOrgName, vleIdMap, aoProfileIdMap } = await buildOrgScope(req);

  let posters = allPosters;
  if (vleId) {
    const vleProfile = await VleProfile.findOne({ userId: vleId }).select('userId affiliatedOrg');
    if (!vleProfile) return next(new AppError('VLE not found', 404));
    if (!req.orgScope.isInScope(vleProfile.affiliatedOrg)) {
      return next(new AppError('You can only view problems for VLEs within your organization', 403));
    }
    posters = [vleProfile.userId];
  }

  const filter = { postedBy: { $in: posters } };
  filter.status = status ? status.toUpperCase() : 'PUBLISHED';
  if (category) filter.category = category;
  if (operation) filter.operationsUndertaken = { $in: [operation] };
  if (state) filter.regionState = state;
  if (district) filter.regionDistrict = district;

  if (search) {
    const matchingUsers = await User.find({
      _id: { $in: posters },
      $or: [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ]
    }).select('_id').lean();
    filter.$or = [
      { problemTitle: { $regex: search, $options: 'i' } },
      { postedBy: { $in: matchingUsers.map(u => u._id) } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [docs, total] = await Promise.all([
    InnovationRequest.find(filter)
      .select('_id problemTitle postedBy category categoryOther valueChainStages operationsUndertaken regionState regionDistrict')
      .populate('postedBy', 'fullName')
      .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
      .lean(),
    InnovationRequest.countDocuments(filter)
  ]);

  const problems = docs.map(p => {
    const posterId = p.postedBy?._id?.toString();
    const isVle = !!vleIdMap[posterId];
    return {
      id: p._id,
      posterType: isVle ? 'VLE' : 'AO',
      profileId: (vleIdMap[posterId] || aoProfileIdMap[posterId]) ? posterId : null,
      title: p.problemTitle,
      vle: isVle
        ? p.postedBy?.fullName || null
        : aoOrgMap[posterId] || null,
      category: p.category || p.categoryOther || null,
      subCategory: p.valueChainStages || [],
      operations: p.operationsUndertaken || [],
      state: p.regionState || null,
      district: p.regionDistrict || null,
      affiliatedOrg: isVle ? aoOrgMap[vleToAoMap[posterId]] || null : null,
      nodalOrg: nodalOrgName,
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

const getOrgServiceRequestsList = catchAsync(async (req, res, next) => {
  const { search, unitType, ownership, vleId, page = 1, limit = 20 } = req.query;

  const { allPosters, vleToAoMap, aoOrgMap, nodalOrgName, vleIdMap, aoProfileIdMap } = await buildOrgScope(req);

  let posters = allPosters;
  if (vleId) {
    const vleProfile = await VleProfile.findOne({ userId: vleId }).select('userId affiliatedOrg');
    if (!vleProfile) return next(new AppError('VLE not found', 404));
    if (!req.orgScope.isInScope(vleProfile.affiliatedOrg)) {
      return next(new AppError('You can only view service requests for VLEs within your organization', 403));
    }
    posters = [vleProfile.userId];
  }

  const filter = { postedBy: { $in: posters } };
  if (search) filter.techName = { $regex: search, $options: 'i' };
  if (unitType) filter.unitType = unitType;
  if (ownership) filter.ownership = ownership;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [docs, total] = await Promise.all([
    ServiceRequest.find(filter)
      .select('_id techName postedBy techCompany unitType ownership')
      .populate('postedBy', 'fullName')
      .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
      .lean(),
    ServiceRequest.countDocuments(filter)
  ]);

  const serviceRequests = docs.map(sr => {
    const posterId = sr.postedBy?._id?.toString();
    const isVle = !!vleIdMap[posterId];
    return {
      id: sr._id,
      posterType: isVle ? 'VLE' : 'AO',
      profileId: (vleIdMap[posterId] || aoProfileIdMap[posterId]) ? posterId : null,
      techName: sr.techName || null,
      vle: isVle
        ? sr.postedBy?.fullName || null
        : aoOrgMap[posterId] || null,
      techCompany: sr.techCompany || null,
      unitType: sr.unitType || null,
      ownership: sr.ownership || null,
      affiliatedOrg: isVle ? aoOrgMap[vleToAoMap[posterId]] || null : null,
      nodalOrg: nodalOrgName,
    };
  });

  res.status(200).json({
    status: 'success',
    data: {
      serviceRequests,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    }
  });
});

const getOrgServiceRequestDetails = catchAsync(async (req, res, next) => {
  const { serviceRequestId } = req.params;

  const sr = await ServiceRequest.findById(serviceRequestId)
    .select('unitType techName techSpecs techCompany cost ownership individualBusinessPlan challenges photosLink createdAt postedBy')
    .lean();

  if (!sr) return next(new AppError('Service request not found', 404));

  const vleOwner = await VleProfile.findOne({ userId: sr.postedBy }).select('userId affiliatedOrg').lean();
  if (!vleOwner) {
    if (req.orgScope.role === 'NO') {
      const posterId = (sr.postedBy?._id || sr.postedBy).toString();
      const isAoInScope = req.orgScope.aoUserIds.some(id => id.toString() === posterId);
      if (!isAoInScope) return next(new AppError('You can only view service requests within your organization', 403));
    } else {
      return next(new AppError('You can only view service requests within your organization', 403));
    }
  } else if (!req.orgScope.isInScope(vleOwner.affiliatedOrg)) {
    return next(new AppError('You can only view service requests within your organization', 403));
  }

  res.status(200).json({ status: 'success', data: { serviceRequest: sr } });
});

const updateOrgServiceRequest = catchAsync(async (req, res, next) => {
  const { serviceRequestId } = req.params;

  const sr = await ServiceRequest.findById(serviceRequestId);
  if (!sr) return next(new AppError('Service request not found', 404));

  const vleOwner = await VleProfile.findOne({ userId: sr.postedBy }).select('userId affiliatedOrg').lean();
  if (!vleOwner) {
    if (req.orgScope.role === 'NO') {
      const posterId = (sr.postedBy?._id || sr.postedBy).toString();
      const isAoInScope = req.orgScope.aoUserIds.some(id => id.toString() === posterId);
      if (!isAoInScope) return next(new AppError('You can only edit service requests within your organization', 403));
    } else {
      return next(new AppError('You can only edit service requests within your organization', 403));
    }
  } else if (!req.orgScope.isInScope(vleOwner.affiliatedOrg)) {
    return next(new AppError('You can only edit service requests within your organization', 403));
  }

  const allowedUpdates = [
    'unitType', 'techName', 'techSpecs', 'techCompany',
    'ownership', 'individualBusinessPlan', 'challenges', 'photosLink'
  ];

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) sr[field] = req.body[field];
  });

  await sr.save();

  res.status(200).json({
    status: 'success',
    message: 'Service request updated successfully',
    data: { serviceRequest: sr }
  });
});

const createServiceRequestForOrgVle = catchAsync(async (req, res, next) => {
  const { vleId, ...serviceRequestData } = req.body;

  const vleProfile = await VleProfile.findOne({ userId: vleId }).select('userId affiliatedOrg').lean();
  if (!vleProfile) return next(new AppError('VLE not found', 404));
  if (!vleProfile.affiliatedOrg || !req.orgScope.isInScope(vleProfile.affiliatedOrg)) {
    return next(new AppError('You can only create service requests for VLEs within your organization', 403));
  }

  const registrationType = req.user.role === 'NO' ? 'NO_CREATED' : 'AO_CREATED';

  const serviceRequest = new ServiceRequest({
    ...serviceRequestData,
    postedBy: vleProfile.userId,
    registeredBy: req.user._id,
    registrationType,
    status: 'PUBLISHED',
  });

  await serviceRequest.save();

  res.status(201).json({
    status: 'success',
    message: 'Service request created successfully for VLE',
    data: { serviceRequest },
  });
});

const createProblemForOrgVle = catchAsync(async (req, res, next) => {
  const {
    vleId,
    problemTitle, problemDescription, regionState, regionDistrict, regionVillage,
    category, categoryOther, valueChainStages, crops,
    operationsUndertaken, machineOperations, currentMethodology,
    knowMachinery, machineChallenge, energySource,
    pullCapacity, engineCapacity, motorCapacity, renewableType,
    specificInfo, problemSize, endProducts, salesChannels, newChannels,
    currentRevenue, expectedRevenue, machineBudget
  } = req.body;

  const vleProfile = await VleProfile.findOne({ userId: vleId }).select('userId affiliatedOrg').lean();

  if (!vleProfile) {
    return next(new AppError('VLE not found', 404));
  }

  if (!req.orgScope.isInScope(vleProfile.affiliatedOrg)) {
    return next(new AppError('You can only create problems for VLEs within your organization', 403));
  }

  const registrationType = req.user.role === 'NO' ? 'NO_CREATED' : 'AO_CREATED';

  const problemData = {
    problemTitle,
    problemDescription,
    regionState,
    regionDistrict,
    regionVillage,
    category,
    categoryOther,
    valueChainStages,
    crops,
    operationsUndertaken,
    machineOperations,
    currentMethodology,
    knowMachinery,
    machineChallenge,
    energySource,
    pullCapacity,
    engineCapacity,
    motorCapacity,
    renewableType,
    specificInfo,
    problemSize,
    endProducts,
    salesChannels,
    newChannels,
    currentRevenue,
    expectedRevenue,
    machineBudget,
    postedBy: vleProfile.userId,
    registeredBy: req.user._id,
    registrationType,
    status: 'PUBLISHED',
    approvedAt: new Date()
  };

  if (!problemData.categoryOther) delete problemData.categoryOther;

  const problem = new InnovationRequest(problemData);
  await problem.save();

  const problemId = problem._id;

  if (req.files) {
    if (req.files.cover && req.files.cover.length > 0) {
      const coverFile = req.files.cover[0];
      const uploadedCover = await uploadFile(
        coverFile.buffer,
        coverFile.originalname,
        coverFile.mimetype,
        `problems/${problemId}/cover`
      );
      problem.coverImage = uploadedCover.url;
    }

    if (req.files.files && req.files.files.length > 0) {
      const uploadedFiles = await uploadMultipleFiles(
        req.files.files,
        `problems/${problemId}`
      );

      problem.mediaFiles = uploadedFiles.map(file => {
        let fileType = 'IMAGE';
        if (file.mimetype.startsWith('video/')) fileType = 'VIDEO';
        else if (file.mimetype === 'application/pdf') fileType = 'PDF';
        return {
          type: fileType,
          url: file.url,
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype,
          objectName: file.objectName
        };
      });
    }

    await problem.save();
  }

  await upsertOperations(operationsUndertaken);
  await upsertOperations(machineOperations);

  await VleProfile.updateOne(
    { userId: vleProfile.userId, vleStatus: 'listed' },
    { $set: { vleStatus: 'interested' } }
  );

  await problem.populate('postedBy', 'firstName lastName email phone role');
  await problem.populate('registeredBy', 'firstName lastName email role');

  const vleUser = await User.findById(vleProfile.userId);
  if (vleUser) {
    sendProblemCreatedForVle(vleUser, problem, req.user).catch(err =>
      console.error('Failed to send problem created for VLE notification:', err.message)
    );
  }

  try {
    await updateProblemKeywords(problem._id);
    await findMatchingInnovations(problem._id);
    await invalidateProblemOnApproval(problem._id);
  } catch (err) {
    console.error('Post-creation matching failed:', err);
  }
  if (vleUser) {
    setImmediate(() =>
      broadcastNewProblemPublished(problem, vleUser).catch(err =>
        console.error('Failed to broadcast new problem published:', err.message)
      )
    );
  }

  res.status(201).json({
    status: 'success',
    message: 'Problem created successfully for VLE',
    data: { problem }
  });
});


const getOrgProblemDetails = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;

  const problem = await InnovationRequest.findById(problemId)
    .select('problemTitle problemDescription regionState regionDistrict regionVillage category categoryOther valueChainStages crops operationsUndertaken machineOperations currentMethodology knowMachinery machineChallenge energySource pullCapacity pullCapacityNotKnown engineCapacity motorCapacity renewableType specificInfo problemSize endProducts salesChannels newChannels currentRevenue expectedRevenue machineBudget coverImage createdAt status postedBy')
    .lean();

  if (!problem) return next(new AppError('Problem not found', 404));

  const vleOwner = await VleProfile.findOne({ userId: problem.postedBy }).select('userId affiliatedOrg').lean();
  if (!vleOwner) {
    // Poster is not a VLE — allow if it's an AO within the NO's scope
    if (req.orgScope.role === 'NO') {
      const posterId = (problem.postedBy?._id || problem.postedBy).toString();
      const isAoInScope = req.orgScope.aoUserIds.some(id => id.toString() === posterId);
      if (!isAoInScope) return next(new AppError('You can only view problems within your organization', 403));
    } else {
      return next(new AppError('You can only view problems within your organization', 403));
    }
  } else if (!req.orgScope.isInScope(vleOwner.affiliatedOrg)) {
    return next(new AppError('You can only view problems within your organization', 403));
  }

  res.status(200).json({
    status: 'success',
    data: { problem }
  });
});


const approveOrgProblem = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;

  const problem = await InnovationRequest.findById(problemId);
  if (!problem) return next(new AppError('Problem not found', 404));

  if (problem.status !== 'PENDING_APPROVAL') {
    return next(new AppError('Problem is not pending approval', 400));
  }

  const vleProfile = await VleProfile.findOne({ userId: problem.postedBy }).select('userId affiliatedOrg').lean();
  if (!vleProfile || !req.orgScope.isInScope(vleProfile.affiliatedOrg)) {
    return next(new AppError('You can only approve problems from your managed VLEs', 403));
  }

  problem.status = 'PUBLISHED';
  problem.approvedAt = new Date();
  await problem.save();

  await VleProfile.updateOne(
    { userId: problem.postedBy, vleStatus: 'listed' },
    { $set: { vleStatus: 'interested' } }
  );

  const poster = await User.findById(problem.postedBy);
  try {
    if (poster) await sendProblemApprovalNotification(problem, poster);
    await updateProblemKeywords(problemId);
    await findMatchingInnovations(problemId);
    await invalidateProblemOnApproval(problemId);
  } catch (err) {
    console.error('Post-approval side effects failed:', err);
  }

  if (poster) {
    setImmediate(() =>
      broadcastNewProblemPublished(problem, poster).catch(err =>
        console.error('Failed to broadcast new problem published:', err.message)
      )
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Problem approved and published',
    data: { problem }
  });
});

const rejectOrgProblem = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;
  const { rejectionReason } = req.body;

  const problem = await InnovationRequest.findById(problemId);
  if (!problem) return next(new AppError('Problem not found', 404));

  if (problem.status !== 'PENDING_APPROVAL') {
    return next(new AppError('Problem is not pending approval', 400));
  }

  const vleProfile = await VleProfile.findOne({ userId: problem.postedBy }).select('userId affiliatedOrg').lean();
  if (!vleProfile || !req.orgScope.isInScope(vleProfile.affiliatedOrg)) {
    return next(new AppError('You can only reject problems from your managed VLEs', 403));
  }

  problem.status = 'REJECTED';
  problem.rejectionReason = rejectionReason;
  await problem.save();

  const poster = await User.findById(problem.postedBy);
  try {
    if (poster) await sendProblemRejectionNotification(problem, poster, rejectionReason);
  } catch (err) {
    console.error('Rejection notification failed:', err);
  }

  res.status(200).json({
    status: 'success',
    message: 'Problem rejected',
    data: { problem }
  });
});

const updateOrgProblem = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;

  const problem = await InnovationRequest.findById(problemId);
  if (!problem) return next(new AppError('Problem not found', 404));

  const vleProfile = await VleProfile.findOne({ userId: problem.postedBy }).select('userId affiliatedOrg').lean();
  if (!vleProfile) {
    if (req.orgScope.role === 'NO') {
      const posterId = (problem.postedBy?._id || problem.postedBy).toString();
      const isAoInScope = req.orgScope.aoUserIds.some(id => id.toString() === posterId);
      if (!isAoInScope) return next(new AppError('You can only edit problems within your organization', 403));
    } else {
      return next(new AppError('You can only edit problems within your organization', 403));
    }
  } else if (!req.orgScope.isInScope(vleProfile.affiliatedOrg)) {
    return next(new AppError('You can only edit problems within your organization', 403));
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

const requestEditOrgProblem = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;
  const { reason } = req.body;

  if (!reason) return next(new AppError('A reason is required when requesting an edit', 400));

  const problem = await InnovationRequest.findById(problemId);
  if (!problem) return next(new AppError('Problem not found', 404));

  if (problem.status !== 'PENDING_APPROVAL') {
    return next(new AppError('Only problems pending approval can be sent back for editing', 400));
  }

  const vleProfile = await VleProfile.findOne({ userId: problem.postedBy }).select('userId affiliatedOrg').lean();
  if (!vleProfile || !req.orgScope.isInScope(vleProfile.affiliatedOrg)) {
    return next(new AppError('You can only request edits for problems within your organization', 403));
  }

  problem.status = 'DRAFT';
  problem.rejectionReason = reason;
  await problem.save();

  const poster = await User.findById(problem.postedBy);
  if (poster) {
    try {
      await sendRequestEditNotification(poster, reason, 'Problem', problem.problemTitle);
    } catch (err) {
      console.error('Failed to send request-edit notification:', err);
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Edit requested. Problem returned to draft.',
    data: { problem }
  });
});

const getOrgVleSimilarProblems = catchAsync(async (req, res, next) => {
  const { vleId } = req.params;
  const { page = 1, limit = 20, search, category, operation } = req.query;

  const vleProfile = await VleProfile.findOne({ userId: vleId }).select('userId affiliatedOrg').lean();
  if (!vleProfile) return next(new AppError('VLE not found', 404));
  if (!req.orgScope.isInScope(vleProfile.affiliatedOrg)) {
    return next(new AppError('You can only view data for VLEs within your organization', 403));
  }

  const vleUserId = vleId;

  const facingRecords = await FacingSimilarProblem.find({ userId: vleUserId }).select('problemId').lean();
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

  const { vleIdMap, aoProfileIdMap, vleToAoMap, aoOrgMap, nodalOrgName } = await buildOrgScope(req);

  const problems = docs.map(p => {
    const posterId = p.postedBy?._id?.toString();
    const affiliatedOrgName = aoOrgMap[posterId] || aoOrgMap[vleToAoMap[posterId]] || null;
    return {
      id: p._id,
      posterType: vleIdMap[posterId] ? 'VLE' : 'AO',
      profileId: (vleIdMap[posterId] || aoProfileIdMap[posterId]) ? posterId : null,
      title: p.problemTitle,
      vle: p.postedBy?.fullName || null,
      category: p.category || p.categoryOther || null,
      subCategory: p.valueChainStages || [],
      operations: p.operationsUndertaken || [],
      state: p.regionState || null,
      district: p.regionDistrict || null,
      affiliatedOrg: affiliatedOrgName,
      nodalOrg: nodalOrgName,
    };
  });

  res.status(200).json({
    status: 'success',
    data: { problems, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } }
  });
});

const getOrgProblemView = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;

  const problem = await InnovationRequest.findById(problemId)
    .select('problemTitle problemDescription createdAt machineOperations crops specificInfo problemSize pullCapacity engineCapacity motorCapacity energySource currentMethodology machineChallenge regionVillage regionDistrict regionState coverImage')
    .lean();

  if (!problem) return next(new AppError('Problem not found', 404));

  res.status(200).json({ status: 'success', data: { problem } });
});

module.exports = {
  buildOrgScope,
  getOrgProblemsList,
  getOrgServiceRequestsList,
  getOrgServiceRequestDetails,
  updateOrgServiceRequest,
  createServiceRequestForOrgVle,
  createProblemForOrgVle,
  getOrgProblemDetails,
  approveOrgProblem,
  rejectOrgProblem,
  updateOrgProblem,
  requestEditOrgProblem,
  getOrgVleSimilarProblems,
  getOrgProblemView,
};
