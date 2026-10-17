const FieldReport = require('../../../models/FieldReport');
const Pilot = require('../../../models/Pilot');
const VleProfile = require('../../../models/VleProfile');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');

const getOrgFieldReportDetails = catchAsync(async (req, res, next) => {
  const { reportId } = req.params;

  const report = await FieldReport.findById(reportId)
    .populate({
      path: 'pilotId',
      select: 'innovationId vleId',
      populate: [
        { path: 'innovationId', select: 'innovationName' },
        { path: 'vleId', select: 'fullName' }
      ]
    })
    .lean();

  if (!report) {
    return next(new AppError('Field report not found', 404));
  }

  if (!req.orgScope.isInScope(report.createdBy)) {
    return next(new AppError('You can only view field reports within your organization', 403));
  }

  res.status(200).json({
    status: 'success',
    data: { report }
  });
});

const getOrgPilotFieldReports = catchAsync(async (req, res, next) => {
  const { pilotId } = req.params;
  const { page = 1, limit = 50, sortBy = 'reportDate', order = 'desc' } = req.query;

  const pilot = await Pilot.findById(pilotId).select('vleId').lean();
  if (!pilot) {
    return next(new AppError('Pilot not found', 404));
  }

  const vleProfile = await VleProfile.findOne({ userId: pilot.vleId }).select('affiliatedOrg').lean();
  if (!vleProfile) {
    return next(new AppError('VLE profile not found', 404));
  }

  if (!vleProfile.affiliatedOrg || !req.orgScope.isInScope(vleProfile.affiliatedOrg)) {
    return next(new AppError('You can only view field reports for pilots within your organization', 403));
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = { [sortBy]: order === 'asc' ? 1 : -1 };

  const [reports, total] = await Promise.all([
    FieldReport.find({ pilotId })
      .select('_id reportDate')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    FieldReport.countDocuments({ pilotId })
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const getOrgVleFieldReports = catchAsync(async (req, res, next) => {
  const { vleId } = req.params;
  const { page = 1, limit = 50, sortBy = 'reportDate', order = 'desc' } = req.query;

  const vleProfile = await VleProfile.findOne({ userId: vleId }).select('affiliatedOrg').lean();
  if (!vleProfile) return next(new AppError('VLE not found', 404));
  if (!vleProfile.affiliatedOrg || !req.orgScope.isInScope(vleProfile.affiliatedOrg)) {
    return next(new AppError('You can only view field reports for VLEs within your organization', 403));
  }

  const pilots = await Pilot.find({ vleId }).select('_id').lean();
  const pilotIds = pilots.map(p => p._id);

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = { [sortBy]: order === 'asc' ? 1 : -1 };

  const [reports, total] = await Promise.all([
    FieldReport.find({ pilotId: { $in: pilotIds } })
      .select('_id reportDate')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    FieldReport.countDocuments({ pilotId: { $in: pilotIds } })
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

module.exports = { getOrgFieldReportDetails, getOrgPilotFieldReports, getOrgVleFieldReports };
