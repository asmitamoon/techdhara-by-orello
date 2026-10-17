const Bookkeeping = require('../../../models/Bookkeeping');
const Pilot = require('../../../models/Pilot');
const VleProfile = require('../../../models/VleProfile');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');

const getOrgVleBookkeepings = catchAsync(async (req, res, next) => {
  const { vleId } = req.params;
  const {
    persona,
    reportingPeriod,
    pilotId,
    fromDate,
    toDate,
    page = 1,
    limit = 50,
    sortBy = 'periodDate',
    order = 'desc'
  } = req.query;

  const vleProfile = await VleProfile.findOne({ userId: vleId });
  if (!vleProfile) return next(new AppError('VLE not found', 404));
  if (!vleProfile.affiliatedOrg || !req.orgScope.isInScope(vleProfile.affiliatedOrg)) {
    return next(new AppError('You can only view bookkeeping for VLEs within your organization', 403));
  }

  let filter = {};
  if (pilotId) {
    const pilot = await Pilot.findOne({ _id: pilotId, vleId: vleProfile.userId });
    if (!pilot) return next(new AppError('Pilot not found or does not belong to this VLE', 404));
    filter.pilotId = pilotId;
  } else {
    const pilots = await Pilot.find({ vleId: vleProfile.userId }, '_id');
    filter.pilotId = { $in: pilots.map(p => p._id) };
  }

  if (persona) filter.persona = persona;
  if (reportingPeriod) filter.reportingPeriod = reportingPeriod;
  if (fromDate || toDate) {
    filter.periodDate = {};
    if (fromDate) filter.periodDate.$gte = new Date(fromDate);
    if (toDate) filter.periodDate.$lte = new Date(toDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = { [sortBy]: order === 'asc' ? 1 : -1 };

  const populateOpts = {
    path: 'pilotId',
    select: 'innovationId vleId',
    populate: [
      { path: 'innovationId', select: 'innovationName' },
      { path: 'vleId', select: 'fullName email' }
    ]
  };

  const [entries, total] = await Promise.all([
    Bookkeeping.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate(populateOpts),
    Bookkeeping.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      entries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const getOrgVleBookkeepingById = catchAsync(async (req, res, next) => {
  const { vleId, bookkeepingId } = req.params;

  const vleProfile = await VleProfile.findOne({ userId: vleId });
  if (!vleProfile) return next(new AppError('VLE not found', 404));
  if (!vleProfile.affiliatedOrg || !req.orgScope.isInScope(vleProfile.affiliatedOrg)) {
    return next(new AppError('You can only view bookkeeping for VLEs within your organization', 403));
  }

  const entry = await Bookkeeping.findById(bookkeepingId).populate({
    path: 'pilotId',
    select: 'innovationId vleId',
    populate: [
      { path: 'innovationId', select: 'innovationName' },
      { path: 'vleId', select: 'fullName email' }
    ]
  });

  if (!entry) return next(new AppError('Bookkeeping entry not found', 404));

  if (!entry.pilotId?.vleId?._id.equals(vleProfile.userId)) {
    return next(new AppError('You can only view bookkeeping for VLEs within your organization', 403));
  }

  res.status(200).json({ status: 'success', data: { entry } });
});

module.exports = { getOrgVleBookkeepings, getOrgVleBookkeepingById };
