const catchAsync = require('../../../utils/catchAsync');
const { AppError } = require('../../../utils/errorHandler');
const Innovation = require('../../../models/Innovation');
const InnovatorProfile = require('../../../models/InnovatorProfile');
const Pilot = require('../../../models/Pilot');
const VleProfile = require('../../../models/VleProfile');

const getOrgInnovationById = catchAsync(async (req, res, next) => {
  const { innovationId } = req.params;

  // Forward lookup: find pilots for this innovation, then verify at least one VLE is in scope
  const pilots = await Pilot.find({ innovationId }).select('vleId').lean();
  if (!pilots.length) {
    return next(new AppError('Innovation not found or not associated with your organisation', 404));
  }

  const scopeChecks = await Promise.all(
    pilots.map(async (p) => {
      const vleProfile = await VleProfile.findOne({ userId: p.vleId }, { affiliatedOrg: 1 }).lean();
      return vleProfile && req.orgScope.isInScope(vleProfile.affiliatedOrg);
    })
  );

  if (!scopeChecks.some(Boolean)) {
    return next(new AppError('Innovation not found or not associated with your organisation', 404));
  }

  const innovation = await Innovation.findOne({ _id: innovationId, status: 'PUBLISHED' })
    .populate('innovatorId', 'fullName email profilePicture')
    .select('-rejectionReason')
    .lean();

  if (!innovation) return next(new AppError('Innovation not found', 404));

  const innovatorProfile = await InnovatorProfile.findOne(
    { userId: innovation.innovatorId._id },
    { state: 1, district: 1, description: 1 }
  ).lean();

  res.status(200).json({
    status: 'success',
    data: {
      innovation: {
        ...innovation,
        state: innovatorProfile?.state || '',
        district: innovatorProfile?.district || '',
        innovatorDescription: innovatorProfile?.description || '',
      }
    }
  });
});

module.exports = { getOrgInnovationById };
