const BusinessModel = require('../../../models/BusinessModel');
const Innovation = require('../../../models/Innovation');
const Pilot = require('../../../models/Pilot');
const VleProfile = require('../../../models/VleProfile');
const InnovatorProfile = require('../../../models/InnovatorProfile');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { sendBusinessModelSubmittedToAdmin } = require('../../../services/notification/admin/pilotNotification');

const createMyBusinessModel = catchAsync(async (req, res, next) => {
  const vleId = req.user._id;
  const { pilotId, ...fields } = req.body;

  // Validate pilot belongs to this VLE — derive innovationId from it
  const pilot = await Pilot.findOne({ _id: pilotId, vleId });
  if (!pilot) {
    return next(new AppError('Pilot request not found or not authorized', 404));
  }

  const innovationId = pilot.innovationId;

  const innovation = await Innovation.findById(innovationId);
  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }
  if (innovation.status !== 'PUBLISHED') {
    return next(new AppError('Can only create a business model for published innovations', 400));
  }

  // Use pilotId for duplicate check — has unique index
  const existing = await BusinessModel.findOne({ pilotId });
  if (existing) {
    return res.status(409).json({
      status: 'error',
      message: 'Business model already exists for this innovation',
      data: { businessModel: existing }
    });
  }

  const businessModel = await BusinessModel.create({
    postedBy: vleId,
    innovationId,
    pilotId: pilot._id,
    ...fields
  });

  sendBusinessModelSubmittedToAdmin(businessModel, req.user).catch(err =>
    console.error('Failed to send business model notification to admin:', err.message)
  );

  await businessModel.populate('innovationId', 'innovationName');

  // Sync selected personas to VleProfile.interestedPersonas
  if (fields.personaInterest?.length) {
    await VleProfile.findOneAndUpdate(
      { userId: vleId },
      { $addToSet: { interestedPersonas: { $each: fields.personaInterest } } }
    );
  }

  res.status(201).json({
    status: 'success',
    message: 'Business model created successfully',
    data: { businessModel }
  });
});

const getMyBusinessModels = catchAsync(async (req, res, next) => {
  const vleId = req.user._id;
  const { innovationId, pilotId, page = 1, limit = 20 } = req.query;

  const filter = { postedBy: vleId };
  if (innovationId) filter.innovationId = innovationId;
  if (pilotId) filter.pilotId = pilotId;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [businessModels, total] = await Promise.all([
    BusinessModel.find(filter)
      .populate({
        path: 'innovationId',
        select: 'innovationName description media.images innovatorId',
        populate: { path: 'innovatorId', select: 'fullName' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    BusinessModel.countDocuments(filter)
  ]);

  const innovatorIds = [...new Set(
    businessModels.map(bm => bm.innovationId?.innovatorId?._id?.toString()).filter(Boolean)
  )];
  const innovatorProfiles = await InnovatorProfile.find({ userId: { $in: innovatorIds } })
    .select('userId enterpriseName').lean();
  const profileMap = Object.fromEntries(
    innovatorProfiles.map(p => [p.userId.toString(), p.enterpriseName])
  );
  const businessModelsData = businessModels.map(bm => {
    const obj = bm.toObject();
    if (obj.innovationId?.innovatorId) {
      const uid = obj.innovationId.innovatorId._id?.toString();
      if (uid) obj.innovationId.innovatorId.enterpriseName = profileMap[uid] || null;
    }
    return obj;
  });

  res.status(200).json({
    status: 'success',
    data: {
      businessModels: businessModelsData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

const getMyBusinessModelById = catchAsync(async (req, res, next) => {
  const { businessModelId } = req.params;
  const vleId = req.user._id;

  const businessModel = await BusinessModel.findOne({ _id: businessModelId, postedBy: vleId })
    .populate('innovationId', 'innovationName category innovationStage media.images');

  if (!businessModel) {
    return next(new AppError('Business model not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { businessModel }
  });
});

module.exports = {
  createMyBusinessModel,
  getMyBusinessModels,
  getMyBusinessModelById
};
