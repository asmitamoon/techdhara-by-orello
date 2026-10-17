const Comment = require('../../../models/Comment');
const Innovation = require('../../../models/Innovation');
const InnovationRequest = require('../../../models/InnovationRequest');
const User = require('../../../models/User');
const VleProfile = require('../../../models/VleProfile');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { sendInnovationCommentNotification, sendProblemCommentNotification } = require('../../../services/notification/common/commentNotification');

const createCommentOnInnovation = catchAsync(async (req, res, next) => {
  const { innovationId } = req.params;
  const { content } = req.body;

  const innovation = await Innovation.findById(innovationId);

  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }

  if (innovation.status !== 'PUBLISHED') {
    return next(new AppError('You can only comment on published innovations', 400));
  }

  const comment = await Comment.create({
    innovationId,
    userId: req.user._id,
    content
  });

  await comment.populate('userId', 'fullName profilePicture role');

  try {
    const owner = await User.findById(innovation.innovatorId);

    if (owner && owner._id.toString() !== req.user._id.toString()) {
      sendInnovationCommentNotification(innovation, owner, req.user, content)
        .catch(err => console.error('Comment notification failed:', err));
    }
  } catch (error) {
    console.error('Error sending comment notification:', error);
  }

  res.status(201).json({
    status: 'success',
    message: 'Comment posted successfully',
    data: {
      comment
    }
  });
});

const createCommentOnProblem = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;
  const { content } = req.body;

  const problem = await InnovationRequest.findById(problemId);

  if (!problem) {
    return next(new AppError('Problem not found', 404));
  }

  if (problem.status !== 'PUBLISHED') {
    return next(new AppError('You can only comment on published problems', 400));
  }

  const comment = await Comment.create({
    problemId,
    userId: req.user._id,
    content
  });

  await comment.populate('userId', 'fullName profilePicture role');

  try {
    const owner = await User.findById(problem.postedBy);

    if (owner && owner._id.toString() !== req.user._id.toString()) {
      sendProblemCommentNotification(problem, owner, req.user, content)
        .catch(err => console.error('Comment notification failed:', err));
    }

    if (owner && owner.role === 'VLE') {
      const vleProfile = await VleProfile.findOne({ userId: owner._id });
      if (vleProfile && vleProfile.affiliatedOrg) {
        const aoUser = await User.findById(vleProfile.affiliatedOrg);
        if (aoUser && aoUser._id.toString() !== req.user._id.toString()) {
          sendProblemCommentNotification(problem, aoUser, req.user, content)
            .catch(err => console.error('AO comment notification failed:', err));
        }
      }
    }
  } catch (error) {
    console.error('Error sending comment notification:', error);
  }

  res.status(201).json({
    status: 'success',
    message: 'Comment posted successfully',
    data: {
      comment
    }
  });
});

const getInnovationComments = catchAsync(async (req, res, next) => {
  const { innovationId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const innovation = await Innovation.findById(innovationId);

  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const comments = await Comment.find({ innovationId })
    .populate('userId', 'fullName profilePicture role')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Comment.countDocuments({ innovationId });

  res.status(200).json({
    status: 'success',
    data: {
      comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const getProblemComments = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const problem = await InnovationRequest.findById(problemId);

  if (!problem) {
    return next(new AppError('Problem not found', 404));
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const comments = await Comment.find({ problemId })
    .populate('userId', 'fullName profilePicture role')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Comment.countDocuments({ problemId });

  res.status(200).json({
    status: 'success',
    data: {
      comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const deleteComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return next(new AppError('Comment not found', 404));
  }

  if (comment.userId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only delete your own comments', 403));
  }

  await Comment.findByIdAndDelete(commentId);

  res.status(200).json({
    status: 'success',
    message: 'Comment deleted successfully'
  });
});

const getMyComments = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const comments = await Comment.find({ userId: req.user._id })
    .populate('innovationId', 'innovationName category')
    .populate('problemId', 'problemTitle category')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Comment.countDocuments({ userId: req.user._id });

  res.status(200).json({
    status: 'success',
    data: {
      comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

module.exports = {
  createCommentOnInnovation,
  createCommentOnProblem,
  getInnovationComments,
  getProblemComments,
  deleteComment,
  getMyComments
};
