const BusinessModel = require('../../../models/BusinessModel');
const Pilot = require('../../../models/Pilot');
const VleProfile = require('../../../models/VleProfile');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');

const getBusinessModelDetails = catchAsync(async (req, res, next) => {
  const { businessModelId } = req.params;

  const businessModel = await BusinessModel.findById(businessModelId)
    .populate('postedBy', 'fullName email role')
    .populate('innovationId', 'innovationName category innovationStage media.images')
    .lean();

  if (!businessModel) {
    return next(new AppError('Business model not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { businessModel }
  });
});

const updateBusinessModel = catchAsync(async (req, res, next) => {
  const { businessModelId } = req.params;

  const businessModel = await BusinessModel.findById(businessModelId);

  if (!businessModel) {
    return next(new AppError('Business model not found', 404));
  }

  const pilot = await Pilot.findById(businessModel.pilotId).select('status').lean();
  if (pilot && (pilot.status === 'IMPLEMENTED' || pilot.status === 'CANCELLED')) {
    return next(new AppError('Business model cannot be edited after the pilot is implemented or cancelled', 400));
  }

  const allowedUpdates = [
    'personaInterest', 'assessmentReadiness',
    'initialCost', 'fieldCapacity', 'customHiringCharges', 'estimatedRevenue', 'paybackPeriod',
    'inventoryCosts', 'logisticsCosts', 'salesTargetYear', 'commissionsPlanned', 'estimatedRevenueSales',
    'servicingInventoryCosts', 'servicingLogisticsCosts', 'servicingTargetYear', 'servicingCommissionPlanned',
    'machinesPlanned', 'costFabrication', 'sellingPrice', 'estimatedRevenueAssembly'
  ];

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      businessModel[field] = req.body[field];
    }
  });

  await businessModel.save();

  if (req.body.personaInterest !== undefined) {
    const allBMs = await BusinessModel.find({ postedBy: businessModel.postedBy })
      .select('personaInterest')
      .lean();
    const allPersonas = [...new Set(allBMs.flatMap(bm => bm.personaInterest || []))];
    await VleProfile.findOneAndUpdate(
      { userId: businessModel.postedBy },
      { $set: { interestedPersonas: allPersonas } }
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Business model updated successfully',
    data: { businessModel }
  });
});

const getBusinessModelByPilot = catchAsync(async (req, res, next) => {
  const { pilotId } = req.params;

  const pilot = await Pilot.findById(pilotId).select('_id').lean();
  if (!pilot) {
    return next(new AppError('Pilot not found', 404));
  }

  const businessModel = await BusinessModel.findOne({ pilotId })
    .populate('pilotId', 'status')
    .populate('postedBy', 'fullName email role')
    .populate('innovationId', 'innovationName category innovationStage media.images')
    .lean();

  if (!businessModel) {
    return next(new AppError('Business model not found for this pilot', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { businessModel }
  });
});

module.exports = {
  getBusinessModelDetails,
  updateBusinessModel,
  getBusinessModelByPilot
};
