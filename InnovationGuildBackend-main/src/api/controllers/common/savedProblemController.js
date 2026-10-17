const SavedProblem = require('../../../models/SavedProblem');
const InnovationRequest = require('../../../models/InnovationRequest');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');

const saveProblem = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;
  const userId = req.user._id;

  const problem = await InnovationRequest.findById(problemId);

  if (!problem) {
    return next(new AppError('Problem not found', 404));
  }

  if (problem.status !== 'PUBLISHED') {
    return next(new AppError('You can only save published problems', 400));
  }

  const existingSaved = await SavedProblem.findOne({ userId, problemId });

  if (existingSaved) {
    await existingSaved.populate('problemId', 'problemTitle problemDescription category status coverImage postedBy');

    return res.status(200).json({
      status: 'success',
      message: 'Problem already saved',
      data: { savedProblem: existingSaved }
    });
  }

  const savedProblem = await SavedProblem.create({ userId, problemId });

  await savedProblem.populate('problemId', 'problemTitle problemDescription category status coverImage postedBy');

  res.status(201).json({
    status: 'success',
    message: 'Problem saved successfully',
    data: { savedProblem }
  });
});

const unsaveProblem = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;
  const userId = req.user._id;

  const savedProblem = await SavedProblem.findOneAndDelete({ userId, problemId });

  if (!savedProblem) {
    return next(new AppError('Saved problem not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Problem removed from saved list'
  });
});

const getMySavedProblems = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { page = 1, limit = 20, search } = req.query;

  const skip = (page - 1) * limit;

  let savedProblems = await SavedProblem.find({ userId })
    .populate({
      path: 'problemId',
      select: 'problemTitle problemDescription category status coverImage postedBy createdAt',
      populate: {
        path: 'postedBy',
        select: 'firstName lastName role profilePicture'
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  if (search) {
    const searchLower = search.toLowerCase();
    savedProblems = savedProblems.filter(saved =>
      saved.problemId && (
        saved.problemId.problemTitle.toLowerCase().includes(searchLower) ||
        saved.problemId.problemDescription.toLowerCase().includes(searchLower)
      )
    );
  }

  const totalCount = await SavedProblem.countDocuments({ userId });

  res.status(200).json({
    status: 'success',
    data: {
      savedProblems,
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
  saveProblem,
  unsaveProblem,
  getMySavedProblems
};
