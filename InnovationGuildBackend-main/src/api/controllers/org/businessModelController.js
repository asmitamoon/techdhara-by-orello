const BusinessModel = require('../../../models/BusinessModel');
const Pilot = require('../../../models/Pilot');
const VleProfile = require('../../../models/VleProfile');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { sendBusinessModelSubmittedToAdmin } = require('../../../services/notification/admin/pilotNotification');

const checkPilotInScope = async (pilotId, orgScope) => {
  const pilot = await Pilot.findById(pilotId).select('vleId innovationId').lean();
  if (!pilot) return { error: 'Pilot not found', status: 404 };
  const vleProfile = await VleProfile.findOne({ userId: pilot.vleId }).select('affiliatedOrg').lean();
  if (!vleProfile || !orgScope.isInScope(vleProfile.affiliatedOrg))
    return { error: 'You can only manage business models for VLEs within your organization', status: 403 };
  return { pilot };
};

const getOrgBusinessModelByPilot = catchAsync(async (req, res, next) => {
  const { pilotId } = req.params;
  const { error, status } = await checkPilotInScope(pilotId, req.orgScope);
  if (error) return next(new AppError(error, status));

  const bm = await BusinessModel.findOne({ pilotId })
    .populate('pilotId', 'status')
    .lean();

  if (!bm) return next(new AppError('Business model not found for this pilot', 404));

  res.status(200).json({ status: 'success', data: { businessModel: bm } });
});

const createOrgBusinessModel = catchAsync(async (req, res, next) => {
  const { pilotId } = req.params;
  const { error, status, pilot } = await checkPilotInScope(pilotId, req.orgScope);
  if (error) return next(new AppError(error, status));

  const existing = await BusinessModel.findOne({ pilotId }).select('_id').lean();
  if (existing) return next(new AppError('Business model already exists for this pilot', 400));

  const bm = await BusinessModel.create({
    pilotId,
    postedBy: pilot.vleId,
    innovationId: pilot.innovationId,
    ...req.body,
  });

  sendBusinessModelSubmittedToAdmin(bm, req.user).catch(err =>
    console.error('Failed to send business model notification to admin:', err.message)
  );

  res.status(201).json({ status: 'success', message: 'Business model created successfully', data: { businessModel: bm } });
});

const updateOrgBusinessModel = catchAsync(async (req, res, next) => {
  const { pilotId } = req.params;
  const { error, status } = await checkPilotInScope(pilotId, req.orgScope);
  if (error) return next(new AppError(error, status));

  const bm = await BusinessModel.findOne({ pilotId });
  if (!bm) return next(new AppError('Business model not found for this pilot', 404));

  const pilot = await Pilot.findById(pilotId).select('status').lean();
  if (pilot.status === 'IMPLEMENTED' || pilot.status === 'CANCELLED') {
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
    if (req.body[field] !== undefined) bm[field] = req.body[field];
  });

  await bm.save();

  if (req.body.personaInterest !== undefined) {
    const allBMs = await BusinessModel.find({ postedBy: bm.postedBy })
      .select('personaInterest')
      .lean();
    const allPersonas = [...new Set(allBMs.flatMap(b => b.personaInterest || []))];
    await VleProfile.findOneAndUpdate(
      { userId: bm.postedBy },
      { $set: { interestedPersonas: allPersonas } }
    );
  }

  res.status(200).json({ status: 'success', message: 'Business model updated successfully', data: { businessModel: bm } });
});

module.exports = { getOrgBusinessModelByPilot, createOrgBusinessModel, updateOrgBusinessModel };
