const Pilot = require('../../../models/Pilot');
const BusinessModel = require('../../../models/BusinessModel');
const Problem = require('../../../models/InnovationRequest');
const Innovation = require('../../../models/Innovation');
const VleProfile = require('../../../models/VleProfile');
const User = require('../../../models/User');
const SavedInnovation = require('../../../models/SavedInnovation');
const FacingSimilarProblem = require('../../../models/FacingSimilarProblem');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { sendPilotInterestNotification } = require('../../../services/notification/innovator/pilotInterestNotification');
const { sendPilotRequestToAdmin } = require('../../../services/notification/admin/pilotNotification');

const createPilotRequestForVle = catchAsync(async (req, res, next) => {
  const { vleId } = req.params;
  const { innovationId, problemId } = req.body;

  const vleProfile = await VleProfile.findOne({ userId: vleId }).select('userId affiliatedOrg').lean();
  if (!vleProfile) {
    return next(new AppError('VLE not found', 404));
  }
  if (!vleProfile.affiliatedOrg || !req.orgScope.isInScope(vleProfile.affiliatedOrg)) {
    return next(new AppError('You can only create pilot requests for VLEs within your organization', 403));
  }

  const innovation = await Innovation.findById(innovationId).lean();
  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }
  if (innovation.status !== 'PUBLISHED') {
    return next(new AppError('Can only request pilots for published innovations', 400));
  }

  if (problemId) {
    const problem = await Problem.findById(problemId).select('_id').lean();
    if (!problem) {
      return next(new AppError('Problem not found', 404));
    }
  }

  const existing = await Pilot.findOne({ vleId, innovationId });
  if (existing) {
    await existing.populate('innovationId', 'innovationName category innovationStage media.images');
    if (existing.problemId) {
      await existing.populate('problemId', 'problemTitle problemDescription category status');
    }
    return res.status(409).json({
      status: 'error',
      message: 'Pilot request already exists for this VLE and innovation',
      data: { pilot: existing }
    });
  }

  const pilot = await Pilot.create({
    vleId,
    innovationId,
    problemId: problemId || undefined,
    requestedBy: req.user._id,
    status: 'PENDING'
  });

  await VleProfile.updateOne(
    { userId: vleId, vleStatus: { $in: ['listed', 'interested'] } },
    { $set: { vleStatus: 'active' } }
  );

  await pilot.populate('innovationId', 'innovationName category innovationStage media.images');
  if (pilot.problemId) {
    await pilot.populate('problemId', 'problemTitle problemDescription category status');
  }
  await pilot.populate('vleId', 'fullName email phone role');
  await pilot.populate('requestedBy', 'fullName role');

  const [innovator, vleUser] = await Promise.all([
    User.findById(innovation.innovatorId).select('_id fullName phone email isPhoneUser isPhoneVerified isEmailUser isEmailVerified isGoogleUser'),
    User.findById(vleId).select('_id fullName phone email isPhoneUser isPhoneVerified isEmailUser isEmailVerified isGoogleUser')
  ]);
  if (innovator && vleUser && innovator._id.toString() !== vleId.toString()) {
    sendPilotInterestNotification(innovator, vleUser, innovation).catch(err =>
      console.error('Failed to send pilot interest notification:', err.message)
    );
  }

  sendPilotRequestToAdmin(vleUser, req.user, innovation, { raisedByOrg: true }).catch(err =>
    console.error('Failed to send pilot request notification to admin:', err.message)
  );

  res.status(201).json({
    status: 'success',
    message: 'Pilot request created on behalf of VLE successfully',
    data: { pilot }
  });
});

const getVlePilotRequests = catchAsync(async (req, res, next) => {
  const { vleId } = req.params;
  const { status, excludeStatus, page = 1, limit = 20 } = req.query;

  const vleProfile = await VleProfile.findOne({ userId: vleId }).select('affiliatedOrg').lean();
  if (!vleProfile) {
    return next(new AppError('VLE not found', 404));
  }
  if (!vleProfile.affiliatedOrg || !req.orgScope.isInScope(vleProfile.affiliatedOrg)) {
    return next(new AppError('You can only view pilot requests for VLEs within your organization', 403));
  }

  const filter = { vleId };
  if (status) {
    const statuses = status.split(',').map(s => s.trim().toUpperCase());
    filter.status = statuses.length > 1 ? { $in: statuses } : statuses[0];
  } else if (excludeStatus) {
    filter.status = { $ne: excludeStatus.toUpperCase() };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [pilots, total] = await Promise.all([
    Pilot.find(filter)
      .populate('innovationId', 'innovationName category innovationStage media.images')
      .populate('problemId', 'problemTitle problemDescription category status')
      .populate('requestedBy', 'fullName role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Pilot.countDocuments(filter)
  ]);

  const pilotIds = pilots.map(p => p._id);
  const bms = await BusinessModel.find({ pilotId: { $in: pilotIds } }).select('pilotId').lean();
  const bmSet = new Set(bms.map(b => b.pilotId.toString()));

  const pilotsWithBm = pilots.map(p => ({
    ...p,
    hasBusinessModel: bmSet.has(p._id.toString()),
  }));

  res.status(200).json({
    status: 'success',
    data: {
      pilots: pilotsWithBm,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const getVlePilotRequestContext = catchAsync(async (req, res, next) => {
  const { vleId } = req.params;

  const vleProfile = await VleProfile.findOne({ userId: vleId }).select('affiliatedOrg').lean();
  if (!vleProfile) {
    return next(new AppError('VLE not found', 404));
  }
  if (!vleProfile.affiliatedOrg || !req.orgScope.isInScope(vleProfile.affiliatedOrg)) {
    return next(new AppError('You can only access data for VLEs within your organization', 403));
  }

  const orgUserId = req.user._id;

  const [orgSavedInnovations, vleSavedInnovations, myProblems, vleProblems, myInterestedProblems, vleInterestedProblems] = await Promise.all([
    SavedInnovation.find({ userId: orgUserId })
      .populate({
        path: 'innovationId',
        select: 'innovationName category innovationStage media.images status innovatorId',
        populate: { path: 'innovatorId', select: 'fullName' }
      })
      .lean(),
    SavedInnovation.find({ userId: vleId })
      .populate({
        path: 'innovationId',
        select: 'innovationName category innovationStage media.images status innovatorId',
        populate: { path: 'innovatorId', select: 'fullName' }
      })
      .lean(),
    Problem.find({ postedBy: orgUserId, status: 'PUBLISHED' })
      .select('problemTitle problemDescription category status createdAt')
      .lean(),
    Problem.find({ postedBy: vleId, status: 'PUBLISHED' })
      .select('problemTitle problemDescription category status createdAt')
      .lean(),
    FacingSimilarProblem.find({ userId: orgUserId })
      .populate('problemId', 'problemTitle problemDescription category status createdAt')
      .lean(),
    FacingSimilarProblem.find({ userId: vleId })
      .populate('problemId', 'problemTitle problemDescription category status createdAt')
      .lean()
  ]);

  const filterPublished = (savedList) =>
    savedList
      .filter(s => s.innovationId && s.innovationId.status === 'PUBLISHED')
      .map(s => s.innovationId);

  const extractProblems = (facingList) =>
    facingList.filter(s => s.problemId).map(s => s.problemId);

  const orgSaved = filterPublished(orgSavedInnovations);
  const vleSaved = filterPublished(vleSavedInnovations);

  const savedIds = [
    ...orgSaved.map(i => i._id.toString()),
    ...vleSaved.map(i => i._id.toString()),
  ];

  const otherInnovations = await Innovation.find({
    status: 'PUBLISHED',
    _id: { $nin: savedIds },
  })
    .populate({ path: 'innovatorId', select: 'fullName' })
    .select('innovationName media.images innovatorId')
    .lean();

  res.status(200).json({
    status: 'success',
    data: {
      innovations: {
        orgSaved,
        vleSaved,
        other: otherInnovations,
      },
      problems: {
        myProblems,
        vleProblems,
        myInterested: extractProblems(myInterestedProblems),
        vleInterested: extractProblems(vleInterestedProblems)
      }
    }
  });
});

module.exports = {
  createPilotRequestForVle,
  getVlePilotRequests,
  getVlePilotRequestContext,
};
