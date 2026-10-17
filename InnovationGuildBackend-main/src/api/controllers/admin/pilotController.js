const Pilot = require('../../../models/Pilot');
const FieldReport = require('../../../models/FieldReport');
const BusinessModel = require('../../../models/BusinessModel');
const Innovation = require('../../../models/Innovation');
const VleProfile = require('../../../models/VleProfile');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { sendPilotStatusChanged } = require('../../../services/notification/pilot/pilotNotification');

// Admin starts a PENDING pilot (PENDING → PILOT_STARTED)
const startPilot = catchAsync(async (req, res, next) => {
  const { pilotId } = req.params;

  const pilot = await Pilot.findById(pilotId);
  if (!pilot) {
    return next(new AppError('Pilot not found', 404));
  }

  if (pilot.status !== 'PENDING') {
    return next(new AppError('Can only start a PENDING pilot', 400));
  }

  const bm = await BusinessModel.findOne({ pilotId: pilot._id }).select('_id').lean();
  if (!bm) {
    return next(new AppError('A business model must be created before starting the pilot', 400));
  }

  pilot.status = 'PILOT_STARTED';
  pilot.startedAt = new Date();
  await pilot.save();

  sendPilotStatusChanged(pilot, 'PILOT_STARTED').catch(() => {});

  res.status(200).json({
    status: 'success',
    message: 'Pilot started successfully',
    data: { pilot }
  });
});

const getPilotById = catchAsync(async (req, res, next) => {
  const { pilotId } = req.params;

  const pilot = await Pilot.findById(pilotId)
    .populate('innovationId', 'innovationName')
    .populate('vleId', 'fullName')
    .populate('problemId', 'problemTitle')
    .lean();

  if (!pilot) {
    return next(new AppError('Pilot not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { pilot }
  });
});

const getPilotsByInnovation = catchAsync(async (req, res, next) => {
  const { innovationId } = req.params;
  const { status, page = 1, limit = 50 } = req.query;

  const innovation = await Innovation.findById(innovationId)
    .select('innovationName category innovationStage')
    .lean();
  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }

  const filter = { innovationId };
  if (status) filter.status = status.toUpperCase();

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [pilots, total] = await Promise.all([
    Pilot.find(filter)
      .populate('vleId', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Pilot.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      innovation,
      pilots,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const getAllPilots = catchAsync(async (req, res, next) => {
  const { status, excludeStatus, search, state, vleStatus, page = 1, limit = 20 } = req.query;

  const filter = {};

  if (status) filter.status = status.toUpperCase();
  else if (excludeStatus) filter.status = { $ne: excludeStatus.toUpperCase() };

  if (search) {
    const matchingInnovations = await Innovation.find({
      innovationName: { $regex: search, $options: 'i' }
    }).select('_id').lean();
    filter.innovationId = { $in: matchingInnovations.map(i => i._id) };
  }

  if (state || vleStatus) {
    const profileFilter = {};
    if (state) profileFilter.state = state;
    if (vleStatus) profileFilter.vleStatus = vleStatus;
    const profiles = await VleProfile.find(profileFilter).select('userId').lean();
    const userIds = profiles.map(p => p.userId);
    filter.vleId = { $in: userIds };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [pilotsRaw, total] = await Promise.all([
    Pilot.find(filter)
      .populate('innovationId', 'innovationName')
      .populate('vleId', 'fullName')
      .populate('problemId', 'problemTitle')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Pilot.countDocuments(filter)
  ]);

  const pilotIds = pilotsRaw.map(p => p._id);
  const bms = await BusinessModel.find({ pilotId: { $in: pilotIds } }).select('pilotId').lean();
  const bmSet = new Set(bms.map(b => b.pilotId.toString()));
  const pilots = pilotsRaw.map(p => ({ ...p, hasBusinessModel: bmSet.has(p._id.toString()) }));

  res.status(200).json({
    status: 'success',
    data: {
      pilots,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    }
  });
});

const startPilotTrial = catchAsync(async (req, res, next) => {
  const { pilotId } = req.params;

  const pilot = await Pilot.findById(pilotId);
  if (!pilot) {
    return next(new AppError('Pilot not found', 404));
  }

  if (pilot.status !== 'PILOT_STARTED') {
    return next(new AppError('Can only start trial from PILOT_STARTED status', 400));
  }

  pilot.status = 'TRIAL_STARTED';
  pilot.trialStartedAt = new Date();
  await pilot.save();

  sendPilotStatusChanged(pilot, 'TRIAL_STARTED').catch(() => {});

  res.status(200).json({
    status: 'success',
    message: 'Trial started successfully',
    data: { pilot }
  });
});

const markPilotAsImplemented = catchAsync(async (req, res, next) => {
  const { pilotId } = req.params;

  const pilot = await Pilot.findById(pilotId);
  if (!pilot) {
    return next(new AppError('Pilot not found', 404));
  }

  if (pilot.status !== 'TRIAL_STARTED') {
    return next(new AppError('Can only mark as implemented from TRIAL_STARTED status', 400));
  }

  const reportCount = await FieldReport.countDocuments({ pilotId });
  if (reportCount === 0) {
    return next(new AppError('At least one field report is required before marking a pilot as implemented', 400));
  }

  pilot.status = 'IMPLEMENTED';
  pilot.implementedAt = new Date();
  await pilot.save();

  await VleProfile.updateOne(
    { userId: pilot.vleId, vleStatus: { $ne: 'commercial' } },
    { $set: { vleStatus: 'commercial' } }
  );

  sendPilotStatusChanged(pilot, 'IMPLEMENTED').catch(() => {});

  res.status(200).json({
    status: 'success',
    message: 'Pilot marked as implemented successfully',
    data: { pilot }
  });
});

const getAdminVlePilotRequests = catchAsync(async (req, res, next) => {
  const { vleId } = req.params;
  const { status, excludeStatus, page = 1, limit = 20 } = req.query;

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
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    }
  });
});

const cancelPilot = catchAsync(async (req, res, next) => {
  const { pilotId } = req.params;

  const pilot = await Pilot.findById(pilotId);
  if (!pilot) {
    return next(new AppError('Pilot not found', 404));
  }

  if (pilot.status === 'CANCELLED' || pilot.status === 'IMPLEMENTED') {
    return next(new AppError('Cannot cancel a pilot that is already cancelled or implemented', 400));
  }

  pilot.status = 'CANCELLED';
  await pilot.save();

  sendPilotStatusChanged(pilot, 'CANCELLED').catch(() => {});

  res.status(200).json({
    status: 'success',
    message: 'Pilot cancelled successfully',
    data: { pilot }
  });
});

const getPilotStats = catchAsync(async (req, res, next) => {
  const totalPilots = await Pilot.countDocuments();

  const statusCounts = await Pilot.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const statusBreakdown = {};
  statusCounts.forEach(item => {
    statusBreakdown[item._id] = item.count;
  });

  const implementedPilots = statusBreakdown['IMPLEMENTED'] || 0;
  const successRate = totalPilots > 0
    ? (implementedPilots / totalPilots * 100).toFixed(2)
    : 0;

  res.status(200).json({
    status: 'success',
    data: {
      totalPilots,
      statusBreakdown,
      successRate: parseFloat(successRate)
    }
  });
});

module.exports = {
  startPilot,
  getPilotById,
  getPilotsByInnovation,
  getAllPilots,
  startPilotTrial,
  markPilotAsImplemented,
  cancelPilot,
  getPilotStats,
  getAdminVlePilotRequests
};
