const catchAsync = require('../../../utils/catchAsync');
const Bookkeeping = require('../../../models/Bookkeeping');
const Pilot = require('../../../models/Pilot');
const { AppError } = require('../../../utils/errorHandler');

const populateOpts = {
  path: 'pilotId',
  select: 'innovationId vleId',
  populate: [
    { path: 'innovationId', select: 'innovationName' },
    { path: 'vleId', select: 'fullName email' }
  ]
};

const getBookkeepingData = catchAsync(async (req, res, next) => {
  const {
    vleId,
    pilotId,
    reportingPeriod,
    fromDate,
    toDate,
    page = 1,
    limit = 50,
    sortBy = 'periodDate',
    order = 'desc'
  } = req.query;

  const filter = {};

  if (pilotId) {
    filter.pilotId = pilotId;
  } else if (vleId) {
    const pilots = await Pilot.find({ vleId }).select('_id').lean();
    filter.pilotId = { $in: pilots.map(p => p._id) };
  }

  if (reportingPeriod) filter.reportingPeriod = reportingPeriod;

  if (fromDate || toDate) {
    filter.periodDate = {};
    if (fromDate) filter.periodDate.$gte = new Date(fromDate);
    if (toDate) filter.periodDate.$lte = new Date(toDate);
  }

  const sortOrder = order === 'asc' ? 1 : -1;
  const sortOptions = { [sortBy]: sortOrder };
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [entries, totalItems] = await Promise.all([
    Bookkeeping.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate(populateOpts)
      .lean(),
    Bookkeeping.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    message: 'Bookkeeping data retrieved successfully',
    data: {
      entries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalItems,
        totalPages: Math.ceil(totalItems / parseInt(limit))
      }
    }
  });
});

const getBookkeepingEntry = catchAsync(async (req, res, next) => {
  const { entryId } = req.params;

  const entry = await Bookkeeping.findById(entryId).populate({
    path: 'pilotId',
    select: 'innovationId vleId',
    populate: [
      { path: 'innovationId', select: 'innovationName category innovationStage media.images' },
      { path: 'vleId', select: 'fullName email role' }
    ]
  }).lean();

  if (!entry) {
    return next(new AppError('Bookkeeping entry not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      entry
    }
  });
});

const updateBookkeepingEntry = catchAsync(async (req, res, next) => {
  const { entryId } = req.params;

  const entry = await Bookkeeping.findById(entryId);
  if (!entry) {
    return next(new AppError('Bookkeeping entry not found', 404));
  }

  // Only allow updating data fields — pilotId, periodDate, reportingPeriod are immutable
  const allowedFields = [
    'unitsSold', 'pricePerUnit', 'unitsServiced', 'servicingType', 'avgServiceCharge',
    'sparesReplaced', 'spareEarnings', 'rentalType', 'rentalCount', 'rentalUsers',
    'rentalCharge', 'fabricationUnits', 'fabricationCost', 'fabricationSellingPrice',
    'fabricationSold'
  ];

  allowedFields.forEach(f => {
    if (req.body[f] !== undefined) entry[f] = req.body[f];
  });

  await entry.save();

  res.status(200).json({
    status: 'success',
    message: 'Bookkeeping entry updated successfully',
    data: { entry }
  });
});

module.exports = {
  getBookkeepingData,
  getBookkeepingEntry,
  updateBookkeepingEntry
};
