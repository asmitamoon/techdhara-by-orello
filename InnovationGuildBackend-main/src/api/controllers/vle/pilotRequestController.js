const Pilot = require('../../../models/Pilot');
const Problem = require('../../../models/InnovationRequest');
const Innovation = require('../../../models/Innovation');
const User = require('../../../models/User');
const VleProfile = require('../../../models/VleProfile');
const SavedInnovation = require('../../../models/SavedInnovation');
const FacingSimilarProblem = require('../../../models/FacingSimilarProblem');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const AoProfile = require('../../../models/AoProfile');
const InnovatorProfile = require('../../../models/InnovatorProfile');
const { sendPilotInterestNotification } = require('../../../services/notification/innovator/pilotInterestNotification');
const { sendVlePilotRequest } = require('../../../services/notification/ao/vleActivityNotification');
const { sendPilotRequestToNo } = require('../../../services/notification/no/pilotNotification');
const { sendPilotRequestToAdmin } = require('../../../services/notification/admin/pilotNotification');

const createPilotRequest = catchAsync(async (req, res, next) => {
  const { innovationId } = req.params;
  const { problemId } = req.body;
  const vleId = req.user._id;

  const innovation = await Innovation.findById(innovationId);
  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }
  if (innovation.status !== 'PUBLISHED') {
    return next(new AppError('Can only request pilots for published innovations', 400));
  }

  const vleProfile = await VleProfile.findOne({ userId: vleId }).select('affiliatedOrg').lean();
  if (!vleProfile?.affiliatedOrg) {
    return next(new AppError('You must be affiliated with an organization to request a pilot', 403));
  }

  if (problemId) {
    const problem = await Problem.findById(problemId);
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
      message: 'Pilot request already submitted for this innovation',
      data: { pilot: existing }
    });
  }

  const pilot = await Pilot.create({
    vleId,
    innovationId,
    problemId: problemId || undefined,
    requestedBy: vleId,
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

  const [innovator, aoUser] = await Promise.all([
    User.findById(innovation.innovatorId).lean(),
    User.findById(vleProfile.affiliatedOrg).lean()
  ]);

  let noUser = null;
  if (aoUser) {
    const aoProfile = await AoProfile.findOne({ userId: aoUser._id }).select('nodalOrg').lean();
    if (aoProfile?.nodalOrg) {
      noUser = await User.findById(aoProfile.nodalOrg).lean();
    }
  }

  if (innovator && innovator._id.toString() !== req.user._id.toString()) {
    sendPilotInterestNotification(innovator, req.user, innovation).catch(err =>
      console.error('Failed to send pilot interest notification to innovator:', err.message)
    );
  }
  if (aoUser) {
    sendVlePilotRequest(aoUser, req.user, innovation).catch(err =>
      console.error('Failed to send pilot interest notification to AO:', err.message)
    );
  }
  if (noUser) {
    sendPilotRequestToNo(noUser, req.user, aoUser, innovation).catch(err =>
      console.error('Failed to send pilot interest notification to NO:', err.message)
    );
  }
  sendPilotRequestToAdmin(req.user, aoUser, innovation).catch(err =>
    console.error('Failed to send pilot interest notification to admins:', err.message)
  );

  res.status(201).json({
    status: 'success',
    message: 'Pilot request submitted successfully',
    data: { pilot }
  });
});

const getMyPilotRequests = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 20 } = req.query;
  const vleId = req.user._id;

  const filter = { vleId };
  if (status) filter.status = status.toUpperCase();

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [pilots, total] = await Promise.all([
    Pilot.find(filter)
      .populate({
        path: 'innovationId',
        select: 'innovationName description media.images innovatorId',
        populate: { path: 'innovatorId', select: 'fullName' }
      })
      .populate('problemId', 'problemTitle problemDescription category status')
      .populate('requestedBy', 'fullName role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Pilot.countDocuments(filter)
  ]);

  const innovatorIds = [...new Set(
    pilots.map(p => p.innovationId?.innovatorId?._id?.toString()).filter(Boolean)
  )];
  const innovatorProfiles = await InnovatorProfile.find({ userId: { $in: innovatorIds } })
    .select('userId enterpriseName').lean();
  const profileMap = Object.fromEntries(
    innovatorProfiles.map(p => [p.userId.toString(), p.enterpriseName])
  );
  const pilotsData = pilots.map(p => {
    const obj = p.toObject();
    if (obj.innovationId?.innovatorId) {
      const uid = obj.innovationId.innovatorId._id?.toString();
      if (uid) obj.innovationId.innovatorId.enterpriseName = profileMap[uid] || null;
    }
    return obj;
  });

  res.status(200).json({
    status: 'success',
    data: {
      pilots: pilotsData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

// VLE can only cancel their own PENDING pilots (deletes record to allow future re-requests)
const cancelPilotRequest = catchAsync(async (req, res, next) => {
  const { requestId } = req.params;
  const vleId = req.user._id;

  const pilot = await Pilot.findOne({ _id: requestId, vleId });
  if (!pilot) {
    return next(new AppError('Pilot request not found', 404));
  }
  if (pilot.status !== 'PENDING') {
    return next(new AppError('Only PENDING requests can be cancelled', 400));
  }

  await pilot.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Pilot request cancelled successfully'
  });
});

const getMyPilotRequestContext = catchAsync(async (req, res, next) => {
  const vleId = req.user._id;

  const [vleSavedInnovations, myProblems, myInterestedProblems] = await Promise.all([
    SavedInnovation.find({ userId: vleId })
      .populate('innovationId', 'innovationName category innovationStage media.images status')
      .lean(),
    Problem.find({ postedBy: vleId, status: 'PUBLISHED' })
      .select('problemTitle problemDescription category status createdAt')
      .lean(),
    FacingSimilarProblem.find({ userId: vleId })
      .populate('problemId', 'problemTitle problemDescription category status createdAt')
      .lean()
  ]);

  const filterPublished = (savedList) =>
    savedList.filter(s => s.innovationId && s.innovationId.status === 'PUBLISHED').map(s => s.innovationId);

  const extractProblems = (facingList) =>
    facingList.filter(s => s.problemId).map(s => s.problemId);

  res.status(200).json({
    status: 'success',
    data: {
      innovations: { vleSaved: filterPublished(vleSavedInnovations) },
      problems: {
        myProblems,
        myInterested: extractProblems(myInterestedProblems)
      }
    }
  });
});

const getPilotRequestProblems = catchAsync(async (req, res, next) => {
  const { search, category, page = 1, limit = 20 } = req.query;

  const filter = { status: 'PUBLISHED' };
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { problemTitle: { $regex: search, $options: 'i' } },
      { problemDescription: { $regex: search, $options: 'i' } },
      { keywords: { $elemMatch: { $regex: search, $options: 'i' } } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [problems, total] = await Promise.all([
    Problem.find(filter)
      .select('problemTitle problemDescription category status coverImage postedBy createdAt upvotes')
      .populate('postedBy', 'fullName role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Problem.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      problems,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

module.exports = {
  createPilotRequest,
  getMyPilotRequests,
  cancelPilotRequest,
  getMyPilotRequestContext,
  getPilotRequestProblems
};
