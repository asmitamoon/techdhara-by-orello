const FieldReport = require('../../../models/FieldReport');
const Pilot = require('../../../models/Pilot');
const Innovation = require('../../../models/Innovation');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');

const getAllFieldReports = catchAsync(async (req, res) => {
  const {
    pilotId,
    createdBy,
    vleId,
    innovationId,
    fromDate,
    toDate,
    page = 1,
    limit = 50,
    sortBy = 'reportDate',
    order = 'desc'
  } = req.query;

  const filter = {};

  if (pilotId) filter.pilotId = pilotId;
  if (createdBy) filter.createdBy = createdBy;

  if (fromDate || toDate) {
    filter.reportDate = {};
    if (fromDate) filter.reportDate.$gte = new Date(fromDate);
    if (toDate) filter.reportDate.$lte = new Date(toDate);
  }

  if (vleId) {
    const pilots = await Pilot.find({ vleId }).select('_id').lean();
    const pilotIds = pilots.map(p => p._id);
    filter.pilotId = { $in: pilotIds };
  }

  if (innovationId) {
    const pilots = await Pilot.find({ innovationId }).select('_id').lean();
    const pilotIds = pilots.map(p => p._id);
    if (filter.pilotId) {
      filter.pilotId = { $in: filter.pilotId.$in.filter(id => pilotIds.some(pid => pid.toString() === id.toString())) };
    } else {
      filter.pilotId = { $in: pilotIds };
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = { [sortBy]: order === 'asc' ? 1 : -1 };

  const [reports, total] = await Promise.all([
    FieldReport.find(filter)
      .populate({
        path: 'pilotId',
        select: 'innovationId vleId',
        populate: [
          { path: 'innovationId', select: 'innovationName category innovationStage media.images' },
          { path: 'vleId', select: 'fullName email phone role profilePicture' }
        ]
      })
      .populate('createdBy', 'fullName email role')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    FieldReport.countDocuments(filter)
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

const getFieldReportStats = catchAsync(async (req, res) => {
  const allReports = await FieldReport.find({})
    .populate('pilotId', 'vleId')
    .populate('createdBy', 'fullName')
    .lean();

  const stats = {
    totalReports: allReports.length,
    topAOs: [],
    topVLEs: [],
    reportsOverTime: {}
  };

  const aoReportCounts = {};
  const vleReportCounts = {};

  allReports.forEach(report => {
    const aoId = report.createdBy._id.toString();
    aoReportCounts[aoId] = aoReportCounts[aoId] || { id: aoId, name: report.createdBy.fullName, count: 0 };
    aoReportCounts[aoId].count++;

    if (report.pilotId && report.pilotId.vleId) {
      const vleId = report.pilotId.vleId.toString();
      vleReportCounts[vleId] = (vleReportCounts[vleId] || 0) + 1;
    }

    const month = new Date(report.reportDate).toISOString().slice(0, 7);
    stats.reportsOverTime[month] = (stats.reportsOverTime[month] || 0) + 1;
  });

  stats.topAOs = Object.values(aoReportCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  stats.topVLEs = Object.entries(vleReportCounts)
    .map(([vleId, count]) => ({ vleId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  res.status(200).json({
    status: 'success',
    data: { stats }
  });
});

const getFieldReportDetails = catchAsync(async (req, res, next) => {
  const { reportId } = req.params;

  const report = await FieldReport.findById(reportId)
    .populate({
      path: 'pilotId',
      select: 'innovationId vleId adminReview',
      populate: [
        {
          path: 'innovationId',
          select: 'innovationName description category innovationStage media.images innovatorId',
          populate: { path: 'innovatorId', select: 'fullName email' }
        },
        { path: 'vleId', select: 'fullName email phone role profilePicture' },
        { path: 'adminReview.createdBy', select: 'fullName role' }
      ]
    })
    .populate('createdBy', 'fullName email phone role')
    .lean();

  if (!report) {
    return next(new AppError('Field report not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { report }
  });
});

const getVleFieldReports = catchAsync(async (req, res) => {
  const { vleId } = req.params;
  const { page = 1, limit = 50, sortBy = 'reportDate', order = 'desc' } = req.query;

  const pilots = await Pilot.find({ vleId }).select('_id').lean();
  const pilotIds = pilots.map(p => p._id);

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = { [sortBy]: order === 'asc' ? 1 : -1 };

  const [reports, total] = await Promise.all([
    FieldReport.find({ pilotId: { $in: pilotIds } })
      .populate({
        path: 'pilotId',
        select: 'innovationId vleId',
        populate: [
          { path: 'innovationId', select: 'innovationName category innovationStage media.images' },
          { path: 'vleId', select: 'fullName email phone role profilePicture' }
        ]
      })
      .populate('createdBy', 'fullName email role')
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

const getPilotFieldReports = catchAsync(async (req, res, next) => {
  const { pilotId } = req.params;
  const { page = 1, limit = 50, sortBy = 'reportDate', order = 'desc' } = req.query;

  const pilot = await Pilot.findById(pilotId)
    .populate('innovationId', 'innovationName category innovationStage')
    .populate('vleId', 'fullName email phone role')
    .lean();

  if (!pilot) {
    return next(new AppError('Pilot not found', 404));
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = { [sortBy]: order === 'asc' ? 1 : -1 };

  const [reports, total] = await Promise.all([
    FieldReport.find({ pilotId })
      .populate('createdBy', 'fullName email role')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    FieldReport.countDocuments({ pilotId })
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      pilot,
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

const getInnovationFieldReports = catchAsync(async (req, res, next) => {
  const { innovationId } = req.params;
  const { page = 1, limit = 50, sortBy = 'reportDate', order = 'desc' } = req.query;

  const innovation = await Innovation.findById(innovationId)
    .select('innovationName category innovationStage')
    .lean();

  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }

  const pilots = await Pilot.find({ innovationId }).select('_id').lean();
  const pilotIds = pilots.map(p => p._id);

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = { [sortBy]: order === 'asc' ? 1 : -1 };

  const [reports, total] = await Promise.all([
    FieldReport.find({ pilotId: { $in: pilotIds } })
      .populate({
        path: 'pilotId',
        select: 'vleId',
        populate: { path: 'vleId', select: 'fullName email phone role profilePicture' }
      })
      .populate('createdBy', 'fullName email role')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    FieldReport.countDocuments({ pilotId: { $in: pilotIds } })
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      innovation,
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

const createFieldReportAsAdmin = catchAsync(async (req, res, next) => {
  const { pilotId } = req.params;

  const pilot = await Pilot.findById(pilotId).select('status').lean();
  if (!pilot) {
    return next(new AppError('Pilot not found', 404));
  }

  if (pilot.status !== 'TRIAL_STARTED') {
    return next(new AppError('Field reports can only be created for pilots in TRIAL_STARTED status', 400));
  }

  const report = new FieldReport({
    pilotId,
    createdBy: req.user._id,
    ...req.body
  });
  await report.save();

  await report.populate({
    path: 'pilotId',
    populate: [
      { path: 'innovationId', select: 'innovationName category innovationStage' },
      { path: 'vleId', select: 'fullName email phone role' }
    ]
  });
  await report.populate('createdBy', 'fullName email role');

  res.status(201).json({
    status: 'success',
    message: 'Field report created successfully',
    data: { report }
  });
});

module.exports = {
  getAllFieldReports,
  getFieldReportStats,
  getFieldReportDetails,
  getVleFieldReports,
  getPilotFieldReports,
  getInnovationFieldReports,
  createFieldReportAsAdmin
};
