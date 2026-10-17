const FieldReport = require('../../../models/FieldReport');
const Pilot = require('../../../models/Pilot');
const VleProfile = require('../../../models/VleProfile');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { sendFieldReportSubmittedToAdmin } = require('../../../services/notification/admin/fieldReportNotification');

const createFieldReport = catchAsync(async (req, res, next) => {
  const { pilotId } = req.params;
  const aoId = req.user._id;
  const {
    reportDate, businessModelAdopted, typeOfTechnology, receivedTraining,
    machinePerformance, easeOfOperation, machineReliability, availabilityOfSpares,
    easeOfMaintenance, operationalChallenges, downtimeExperience, additionalComments,
    supportReceived, supportNeeded, recommendToOthers, improvementSuggestions
  } = req.body;

  const pilot = await Pilot.findById(pilotId);

  if (!pilot) {
    return next(new AppError('Pilot not found', 404));
  }

  if (!['TRIAL_STARTED', 'IMPLEMENTED'].includes(pilot.status)) {
    return next(new AppError('Field reports can only be created for pilots in TRIAL_STARTED or IMPLEMENTED status', 400));
  }

  const vleProfile = await VleProfile.findOne({ userId: pilot.vleId });

  if (!vleProfile) {
    return next(new AppError('VLE profile not found', 404));
  }

  if (!vleProfile.affiliatedOrg || vleProfile.affiliatedOrg.toString() !== aoId.toString()) {
    return next(new AppError('You can only create field reports for VLEs you registered', 403));
  }

  if (pilot.trialStartedAt && new Date(reportDate) < new Date(pilot.trialStartedAt.toISOString().split('T')[0])) {
    return next(new AppError('Report date cannot be before the trial start date', 400));
  }

  const existing = await FieldReport.findOne({ pilotId, reportDate: new Date(reportDate) });
  if (existing) {
    return next(new AppError('A field report already exists for this pilot on this date', 409));
  }

  const fieldReport = await FieldReport.create({
    pilotId,
    createdBy: aoId,
    reportDate: new Date(reportDate),
    businessModelAdopted,
    typeOfTechnology,
    receivedTraining,
    machinePerformance,
    easeOfOperation,
    machineReliability,
    availabilityOfSpares,
    easeOfMaintenance,
    operationalChallenges,
    downtimeExperience,
    additionalComments,
    supportReceived,
    supportNeeded,
    recommendToOthers,
    improvementSuggestions
  });

  sendFieldReportSubmittedToAdmin(req.user, fieldReport).catch(() => {});

  await fieldReport.populate({
    path: 'pilotId',
    populate: [
      { path: 'innovationId', select: 'innovationName category innovationStage media.images' },
      { path: 'vleId', select: 'firstName lastName email phone role profilePicture' }
    ]
  });
  await fieldReport.populate('createdBy', 'firstName lastName email role');

  res.status(201).json({
    status: 'success',
    message: 'Field report submitted successfully',
    data: {
      fieldReport
    }
  });
});

const getMyFieldReports = catchAsync(async (req, res) => {
  const aoId = req.user._id;
  const {
    pilotId,
    fromDate,
    toDate,
    page = 1,
    limit = 50,
    sortBy = 'reportDate',
    order = 'desc'
  } = req.query;

  const filter = { createdBy: aoId };

  if (pilotId) filter.pilotId = pilotId;

  if (fromDate || toDate) {
    filter.reportDate = {};
    if (fromDate) filter.reportDate.$gte = new Date(fromDate);
    if (toDate) filter.reportDate.$lte = new Date(toDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = { [sortBy]: order === 'asc' ? 1 : -1 };

  const reports = await FieldReport.find(filter)
    .populate({
      path: 'pilotId',
      populate: [
        { path: 'innovationId', select: 'innovationName category innovationStage media.images' },
        { path: 'vleId', select: 'firstName lastName email phone role profilePicture' }
      ]
    })
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await FieldReport.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      reports,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

const getFieldReportDetails = catchAsync(async (req, res, next) => {
  const { reportId } = req.params;
  const aoId = req.user._id;

  const report = await FieldReport.findById(reportId)
    .populate({
      path: 'pilotId',
      populate: [
        { path: 'innovationId', select: 'innovationName description category innovationStage media.images' },
        { path: 'vleId', select: 'firstName lastName email phone role profilePicture' }
      ]
    })
    .populate('createdBy', 'firstName lastName email role');

  if (!report) {
    return next(new AppError('Field report not found', 404));
  }

  if (report.createdBy._id.toString() !== aoId.toString()) {
    return next(new AppError('You can only view your own field reports', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      report
    }
  });
});

const deleteFieldReport = catchAsync(async (req, res, next) => {
  const { reportId } = req.params;
  const aoId = req.user._id;

  const report = await FieldReport.findById(reportId);

  if (!report) {
    return next(new AppError('Field report not found', 404));
  }

  if (report.createdBy.toString() !== aoId.toString()) {
    return next(new AppError('You can only delete your own field reports', 403));
  }

  await FieldReport.findByIdAndDelete(reportId);

  res.status(200).json({
    status: 'success',
    message: 'Field report deleted successfully',
    data: null
  });
});

const getPilotFieldReports = catchAsync(async (req, res, next) => {
  const { pilotId } = req.params;
  const aoId = req.user._id;
  const { page = 1, limit = 50, sortBy = 'reportDate', order = 'desc' } = req.query;

  const pilot = await Pilot.findById(pilotId);

  if (!pilot) {
    return next(new AppError('Pilot not found', 404));
  }

  const vleProfile = await VleProfile.findOne({ userId: pilot.vleId });

  if (!vleProfile) {
    return next(new AppError('VLE profile not found', 404));
  }

  if (!vleProfile.affiliatedOrg || vleProfile.affiliatedOrg.toString() !== aoId.toString()) {
    return next(new AppError('You can only view field reports for VLEs you registered', 403));
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = { [sortBy]: order === 'asc' ? 1 : -1 };

  const reports = await FieldReport.find({ pilotId })
    .populate({
      path: 'pilotId',
      populate: [
        { path: 'innovationId', select: 'innovationName category innovationStage media.images' },
        { path: 'vleId', select: 'firstName lastName email phone role profilePicture' }
      ]
    })
    .populate('createdBy', 'firstName lastName email role')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await FieldReport.countDocuments({ pilotId });

  res.status(200).json({
    status: 'success',
    data: {
      pilot: {
        _id: pilot._id,
        status: pilot.status
      },
      reports,
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
  createFieldReport,
  getMyFieldReports,
  getFieldReportDetails,
  deleteFieldReport,
  getPilotFieldReports
};
