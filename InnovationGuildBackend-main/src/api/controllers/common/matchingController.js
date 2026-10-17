const catchAsync = require('../../../utils/catchAsync');
const Match = require('../../../models/Match');
const InnovationRequest = require('../../../models/InnovationRequest');
const Innovation = require('../../../models/Innovation');
const { AppError } = require('../../../utils/errorHandler');

const getProblemMatches = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const problem = await InnovationRequest.findById(problemId);
  if (!problem) {
    return next(new AppError('Problem not found', 404));
  }

  if (problem.postedBy.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only view matches for your own problems', 403));
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const matches = await Match.find({ problemId })
    .populate('innovationId', 'innovationName description category status innovationStage innovatorId')
    .sort({ matchScore: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalCount = await Match.countDocuments({ problemId });

  res.status(200).json({
    status: 'success',
    data: {
      matches,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      }
    }
  });
});

const getInnovationMatches = catchAsync(async (req, res, next) => {
  const { innovationId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const innovation = await Innovation.findById(innovationId);
  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }

  if (innovation.innovatorId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only view matches for your own innovations', 403));
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const matches = await Match.find({ innovationId })
    .populate('problemId', 'problemTitle problemDescription category status postedBy')
    .sort({ matchScore: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalCount = await Match.countDocuments({ innovationId });

  res.status(200).json({
    status: 'success',
    data: {
      matches,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      }
    }
  });
});

module.exports = {
  getProblemMatches,
  getInnovationMatches
};
