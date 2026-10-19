const Pilot = require('../../../models/Pilot');
const FieldReport = require('../../../models/FieldReport');
const BusinessModel = require('../../../models/BusinessModel');
const VleProfile = require('../../../models/VleProfile');
const Innovation = require('../../../models/Innovation');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { sendPilotStatusChanged } = require('../../../services/notification/pilot/pilotNotification');
const { sendPilotStatusChangedToAdmin } = require('../../../services/notification/admin/pilotNotification');

// Shared scope helper — resolves pilot and verifies it belongs to an org-managed VLE
const checkPilotInScope = async (pilotId, orgScope) => {
  const pilot = await Pilot.findById(pilotId);
  if (!pilot) return { error: 'Pilot not found', status: 404 };
  const vleProfile = await VleProfile.findOne({ userId: pilot.vleId }).select('affiliatedOrg').lean();
  if (!vleProfile || !orgScope.isInScope(vleProfile.affiliatedOrg)) {
    return { error: 'You can only manage pilots for VLEs within your organization', status: 403 };
  }
  return { pilot };
};

const getOrgPilots = catchAsync(async (req, res, next) => {
  const { status, excludeStatus, search, page = 1, limit = 20 } = req.query;

  const vleProfiles = await VleProfile.find(req.orgScope.vleFilter).select('userId').lean();
  const vleUserIds = vleProfiles.map(p => p.userId);

  const filter = { vleId: { $in: vleUserIds } };

  if (status) filter.status = status.toUpperCase();
  else if (excludeStatus) filter.status = { $ne: excludeStatus.toUpperCase() };

  if (search) {
    const matchingInnovations = await Innovation.find({
      innovationName: { $regex: search, $options: 'i' }
    }).select('_id').lean();
    filter.innovationId = { $in: matchingInnovations.map(i => i._id) };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [pilots, total] = await Promise.all([
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

  const pilotIds = pilots.map(p => p._id);
  const bms = await BusinessModel.find({ pilotId: { $in: pilotIds } }).select('pilotId').lean();
  const bmSet = new Set(bms.map(b => b.pilotId.toString()));
  const pilotsWithBm = pilots.map(p => ({ ...p, hasBusinessModel: bmSet.has(p._id.toString()) }));

  res.status(200).json({
    status: 'success',
    data: {
      pilots: pilotsWithBm,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    }
  });
});

const getOrgPilotById = catchAsync(async (req, res, next) => {
  const { pilotId } = req.params;

  const { error, status, pilot } = await checkPilotInScope(pilotId, req.orgScope);
  if (error) return next(new AppError(error, status));

  await pilot.populate('innovationId', 'innovationName');
  await pilot.populate('vleId', 'fullName');

  res.status(200).json({ status: 'success', data: { pilot } });
});

const startOrgTrial = catchAsync(async (req, res, next) => {
  const { pilotId } = req.params;

  const { error, status, pilot } = await checkPilotInScope(pilotId, req.orgScope);
  if (error) return next(new AppError(error, status));

  if (pilot.status !== 'PILOT_STARTED') {
    return next(new AppError('Can only start trial from PILOT_STARTED status', 400));
  }

  pilot.status = 'TRIAL_STARTED';
  pilot.trialStartedAt = new Date();
  await pilot.save();

  sendPilotStatusChanged(pilot, 'TRIAL_STARTED').catch(() => {});
  sendPilotStatusChangedToAdmin(pilot, 'TRIAL_STARTED', req.user).catch(() => {});

  res.status(200).json({ status: 'success', message: 'Trial started successfully', data: { pilot } });
});

const markOrgPilotAsImplemented = catchAsync(async (req, res, next) => {
  const { pilotId } = req.params;

  const { error, status, pilot } = await checkPilotInScope(pilotId, req.orgScope);
  if (error) return next(new AppError(error, status));

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
  sendPilotStatusChangedToAdmin(pilot, 'IMPLEMENTED', req.user).catch(() => {});

  res.status(200).json({ status: 'success', message: 'Pilot marked as implemented successfully', data: { pilot } });
});

const cancelOrgPilot = catchAsync(async (req, res, next) => {
  const { pilotId } = req.params;

  const { error, status, pilot } = await checkPilotInScope(pilotId, req.orgScope);
  if (error) return next(new AppError(error, status));

  if (pilot.status === 'CANCELLED' || pilot.status === 'IMPLEMENTED') {
    return next(new AppError('Cannot cancel a pilot that is already cancelled or implemented', 400));
  }

  pilot.status = 'CANCELLED';
  await pilot.save();

  sendPilotStatusChanged(pilot, 'CANCELLED').catch(() => {});
  sendPilotStatusChangedToAdmin(pilot, 'CANCELLED', req.user).catch(() => {});

  res.status(200).json({ status: 'success', message: 'Pilot cancelled successfully', data: { pilot } });
});

const startOrgPilot = catchAsync(async (req, res, next) => {
  const { pilotId } = req.params;

  const { error, status, pilot } = await checkPilotInScope(pilotId, req.orgScope);
  if (error) return next(new AppError(error, status));

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
  sendPilotStatusChangedToAdmin(pilot, 'PILOT_STARTED', req.user).catch(() => {});

  res.status(200).json({ status: 'success', message: 'Pilot started successfully', data: { pilot } });
});

module.exports = { getOrgPilots, getOrgPilotById, startOrgTrial, markOrgPilotAsImplemented, cancelOrgPilot, startOrgPilot };
