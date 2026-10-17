const SavedInnovation = require('../../../models/SavedInnovation');
const Innovation = require('../../../models/Innovation');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');

const saveInnovation = catchAsync(async (req, res, next) => {
  const { innovationId } = req.params;
  const userId = req.user._id;

  const innovation = await Innovation.findById(innovationId);

  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }

  if (innovation.status !== 'PUBLISHED') {
    return next(new AppError('You can only save published innovations', 400));
  }

  const existingSaved = await SavedInnovation.findOne({ userId, innovationId });

  if (existingSaved) {
    await existingSaved.populate('innovationId', 'innovationName description category innovationStage innovatorId');

    return res.status(200).json({
      status: 'success',
      message: 'Innovation already saved',
      data: {
        savedInnovation: existingSaved
      }
    });
  }

  const savedInnovation = await SavedInnovation.create({
    userId,
    innovationId
  });

  await savedInnovation.populate('innovationId', 'innovationName description category innovationStage innovatorId');

  res.status(201).json({
    status: 'success',
    message: 'Innovation saved successfully',
    data: {
      savedInnovation
    }
  });
});

const unsaveInnovation = catchAsync(async (req, res, next) => {
  const { innovationId } = req.params;
  const userId = req.user._id;

  const savedInnovation = await SavedInnovation.findOneAndDelete({ userId, innovationId });

  if (!savedInnovation) {
    return next(new AppError('Saved innovation not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Innovation removed from saved list'
  });
});

const getMySavedInnovations = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { page = 1, limit = 20, search } = req.query;

  const query = { userId };

  const skip = (page - 1) * limit;

  let savedInnovations = await SavedInnovation.find(query)
    .populate({
      path: 'innovationId',
      select: 'innovationName description category innovationStage innovatorId yearLaunched sellingPrice media',
      populate: {
        path: 'innovatorId',
        select: 'firstName lastName role profilePicture'
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  if (search) {
    const searchLower = search.toLowerCase();
    savedInnovations = savedInnovations.filter(saved =>
      saved.innovationId && (
        saved.innovationId.innovationName.toLowerCase().includes(searchLower) ||
        saved.innovationId.description.toLowerCase().includes(searchLower)
      )
    );
  }

  const totalCount = await SavedInnovation.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: {
      savedInnovations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

module.exports = {
  saveInnovation,
  unsaveInnovation,
  getMySavedInnovations
};
