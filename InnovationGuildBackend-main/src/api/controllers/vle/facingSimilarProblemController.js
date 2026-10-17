const FacingSimilarProblem = require('../../../models/FacingSimilarProblem');
const InnovationRequest = require('../../../models/InnovationRequest');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');

const toggleFacingSimilar = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;
  const userId = req.user._id;

  const problem = await InnovationRequest.findOne({ _id: problemId, status: 'PUBLISHED' });
  if (!problem) {
    return next(new AppError('Problem not found', 404));
  }

  if (problem.postedBy.toString() === userId.toString()) {
    return next(new AppError('You cannot mark your own problem as facing similar', 400));
  }

  const existing = await FacingSimilarProblem.findOne({ userId, problemId });

  if (existing) {
    await FacingSimilarProblem.deleteOne({ userId, problemId });
    await InnovationRequest.findByIdAndUpdate(problemId, { $inc: { upvotes: -1 } });
    return res.status(200).json({
      status: 'success',
      data: { interested: false }
    });
  }

  await FacingSimilarProblem.create({ userId, problemId });
  await InnovationRequest.findByIdAndUpdate(problemId, { $inc: { upvotes: 1 } });

  res.status(200).json({
    status: 'success',
    data: { interested: true }
  });
});

const getMyFacingSimilarProblems = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { page = 1, limit = 20, search } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  let records = await FacingSimilarProblem.find({ userId })
    .populate({
      path: 'problemId',
      select: 'problemTitle problemDescription category status coverImage postedBy createdAt',
      populate: {
        path: 'postedBy',
        select: 'fullName profilePicture'
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  if (search) {
    const searchLower = search.toLowerCase();
    records = records.filter(r =>
      r.problemId && (
        r.problemId.problemTitle.toLowerCase().includes(searchLower) ||
        r.problemId.problemDescription.toLowerCase().includes(searchLower)
      )
    );
  }

  const total = await FacingSimilarProblem.countDocuments({ userId });

  res.status(200).json({
    status: 'success',
    data: {
      problems: records,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

module.exports = {
  toggleFacingSimilar,
  getMyFacingSimilarProblems
};
