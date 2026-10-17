const catchAsync = require('../../../utils/catchAsync');
const Bookkeeping = require('../../../models/Bookkeeping');
const Pilot = require('../../../models/Pilot');
const BusinessModel = require('../../../models/BusinessModel');
const { normalizePeriodDate } = require('../../../utils/periodHelpers');
const { AppError } = require('../../../utils/errorHandler');

const createBookkeepingEntry = catchAsync(async (req, res, next) => {
  const {
    pilotId, selectedDate, selectedPeriod,
    unitsSold, pricePerUnit,
    unitsServiced, servicingType, avgServiceCharge, sparesReplaced, spareEarnings,
    rentalType, rentalCount, rentalUsers, rentalCharge,
    fabricationUnits, fabricationCost, fabricationSellingPrice, fabricationSold
  } = req.body;
  const vleId = req.user._id;

  const pilot = await Pilot.findOne({ _id: pilotId, vleId });
  if (!pilot) {
    return res.status(404).json({
      status: 'error',
      message: 'Pilot not found or does not belong to this VLE'
    });
  }

  const normalizedDate = normalizePeriodDate(selectedDate, selectedPeriod);

  const pilotMinDate = pilot.implementedAt || pilot.trialStartedAt || pilot.startedAt;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Period-end check: Monthly/Yearly must be fully completed before submission
  if (selectedPeriod === 'Monthly') {
    const lastDayOfMonth = new Date(normalizedDate.getFullYear(), normalizedDate.getMonth() + 1, 0);
    if (today < lastDayOfMonth) {
      return next(new AppError('Monthly reports can only be submitted on or after the last day of the month.', 400));
    }
  }
  if (selectedPeriod === 'Yearly') {
    const lastDayOfYear = new Date(normalizedDate.getFullYear(), 11, 31);
    if (today < lastDayOfYear) {
      return next(new AppError('Yearly reports can only be submitted on or after December 31st of that year.', 400));
    }
  }

  // Min-date check: use end-of-period so partial periods (pilot started mid-month/year) are allowed
  if (pilotMinDate) {
    const min = new Date(pilotMinDate);
    min.setHours(0, 0, 0, 0);
    let periodEnd = normalizedDate;
    if (selectedPeriod === 'Monthly') {
      periodEnd = new Date(normalizedDate.getFullYear(), normalizedDate.getMonth() + 1, 0);
    } else if (selectedPeriod === 'Yearly') {
      periodEnd = new Date(normalizedDate.getFullYear(), 11, 31);
    }
    if (periodEnd < min) {
      const minStr = min.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      return next(new AppError(`This period is before your pilot's start date (${minStr}). Please select a later period.`, 400));
    }
  }

  const existingEntry = await Bookkeeping.findOne({
    pilotId,
    periodDate: normalizedDate,
    reportingPeriod: selectedPeriod
  });

  if (existingEntry) {
    return res.status(400).json({
      status: 'error',
      message: 'Bookkeeping entry already exists for this pilot and period. Use update endpoint to modify existing entry.'
    });
  }

  const entryData = {
    pilotId,
    reportingPeriod: selectedPeriod,
    periodDate: normalizedDate,
    unitsSold, pricePerUnit,
    unitsServiced, servicingType, avgServiceCharge, sparesReplaced, spareEarnings,
    rentalType, rentalCount, rentalUsers, rentalCharge,
    fabricationUnits, fabricationCost, fabricationSellingPrice, fabricationSold
  };

  Object.keys(entryData).forEach(key => { if (entryData[key] === undefined) delete entryData[key]; });

  const entry = await Bookkeeping.create(entryData);

  res.status(201).json({
    status: 'success',
    message: 'Bookkeeping entry created successfully',
    data: {
      entry
    }
  });
});

const getBookkeepingEntries = catchAsync(async (req, res, next) => {
  const vleId = req.user._id;
  const {
    pilotId,
    reportingPeriod,
    fromDate,
    toDate,
    page = 1,
    limit = 50,
    sortBy = 'periodDate',
    order = 'desc'
  } = req.query;

  const pilots = await Pilot.find({ vleId }, '_id');
  const pilotIds = pilots.map(p => p._id);

  let filter;
  if (pilotId) {
    const valid = pilotIds.some(id => id.toString() === pilotId);
    if (!valid) {
      return res.status(403).json({ status: 'error', message: 'Pilot does not belong to this VLE' });
    }
    filter = { pilotId };
  } else {
    filter = { pilotId: { $in: pilotIds } };
  }

  if (reportingPeriod) filter.reportingPeriod = reportingPeriod;

  if (fromDate || toDate) {
    filter.periodDate = {};
    if (fromDate) filter.periodDate.$gte = new Date(fromDate);
    if (toDate) filter.periodDate.$lte = new Date(toDate);
  }

  const sortOrder = order === 'asc' ? 1 : -1;
  const sortOptions = { [sortBy]: sortOrder };

  const skip = (page - 1) * limit;

  const [entries, totalItems] = await Promise.all([
    Bookkeeping.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate({ path: 'pilotId', select: 'innovationId', populate: { path: 'innovationId', select: 'innovationName' } })
      .lean(),
    Bookkeeping.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    message: 'Bookkeeping entries retrieved successfully',
    data: {
      entries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

const updateBookkeepingEntry = catchAsync(async (req, res, next) => {
  const { entryId } = req.params;
  const vleId = req.user._id;

  const entry = await Bookkeeping.findById(entryId);
  if (!entry) {
    return res.status(404).json({
      status: 'error',
      message: 'Bookkeeping entry not found or you do not have permission to update it'
    });
  }

  const pilot = await Pilot.findOne({ _id: entry.pilotId, vleId });
  if (!pilot) {
    return res.status(403).json({
      status: 'error',
      message: 'Bookkeeping entry not found or you do not have permission to update it'
    });
  }

  const allowedUpdates = [
    'unitsSold', 'pricePerUnit',
    'unitsServiced', 'servicingType', 'avgServiceCharge', 'sparesReplaced', 'spareEarnings',
    'rentalType', 'rentalCount', 'rentalUsers', 'rentalCharge',
    'fabricationUnits', 'fabricationCost', 'fabricationSellingPrice', 'fabricationSold'
  ];

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) entry[field] = req.body[field];
  });

  await entry.save();

  res.status(200).json({
    status: 'success',
    message: 'Bookkeeping entry updated successfully',
    data: {
      entry
    }
  });
});

const deleteBookkeepingEntry = catchAsync(async (req, res, next) => {
  const { entryId } = req.params;
  const vleId = req.user._id;

  const entry = await Bookkeeping.findById(entryId);
  if (!entry) {
    return res.status(404).json({
      status: 'error',
      message: 'Bookkeeping entry not found or you do not have permission to delete it'
    });
  }

  const pilot = await Pilot.findOne({ _id: entry.pilotId, vleId });
  if (!pilot) {
    return res.status(403).json({
      status: 'error',
      message: 'Bookkeeping entry not found or you do not have permission to delete it'
    });
  }

  await entry.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Bookkeeping entry deleted successfully',
    data: null
  });
});

const getBookkeepingEntryById = catchAsync(async (req, res, next) => {
  const { entryId } = req.params;
  const vleId = req.user._id;

  const entry = await Bookkeeping.findById(entryId).populate({
    path: 'pilotId',
    select: 'innovationId vleId',
    populate: [
      { path: 'innovationId', select: 'innovationName' },
      { path: 'vleId', select: 'fullName' }
    ]
  });

  if (!entry) return next(new AppError('Bookkeeping entry not found', 404));

  const pilot = await Pilot.findOne({ _id: entry.pilotId, vleId });
  if (!pilot) return next(new AppError('You do not have permission to view this entry', 403));

  res.status(200).json({ status: 'success', data: { entry } });
});

const getBookkeepingContext = catchAsync(async (req, res, next) => {
  const { pilotId } = req.params;
  const vleId = req.user._id;

  const pilot = await Pilot.findOne({ _id: pilotId, vleId })
    .populate('innovationId', 'innovationName');
  if (!pilot) return next(new AppError('Pilot not found or not authorized', 404));

  const businessModel = await BusinessModel.findOne({ pilotId });
  const minDate = pilot.implementedAt || pilot.trialStartedAt || pilot.startedAt || null;

  res.status(200).json({
    status: 'success',
    data: {
      innovationName: pilot.innovationId?.innovationName || '',
      personaInterest: businessModel?.personaInterest || [],
      minDate,
    }
  });
});

module.exports = {
  createBookkeepingEntry,
  getBookkeepingEntries,
  getBookkeepingEntryById,
  updateBookkeepingEntry,
  deleteBookkeepingEntry,
  getBookkeepingContext
};
