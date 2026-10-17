const InnovationRequest = require('../../../models/InnovationRequest');
const User = require('../../../models/User');
const VleProfile = require('../../../models/VleProfile');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { deleteFile, deleteMultipleFiles, uploadFile, uploadMultipleFiles } = require('../../../services/storage/minioService');
const { invalidateProblemOnModification, invalidateProblemOnApproval } = require('../../../services/cache/cacheInvalidation');
const { sendVleSubmittedProblem } = require('../../../services/notification/ao/vleActivityNotification');
const { findMatchingInnovations } = require('../../../services/matching/matchingService');
const { updateProblemKeywords } = require('../../../services/matching/keywordExtractor');
const { sendProblemApprovalNotification } = require('../../../services/notification/admin/contentApprovalNotification');
const { broadcastNewProblemPublished } = require('../../../services/notification/common/broadcastNotification');
const { upsertOperations } = require('../../../utils/dbHelpers');

const createProblem = catchAsync(async (req, res, next) => {
  const problemData = {
    ...req.body,
    postedBy: req.user._id,
    status: 'DRAFT'
  };

  // Don't store empty categoryOther
  if (!problemData.categoryOther) {
    delete problemData.categoryOther;
  }

  const problem = new InnovationRequest(problemData);
  await problem.save();

  const problemId = problem._id;

  if (req.files) {
    if (req.files.cover && req.files.cover.length > 0) {
      const coverFile = req.files.cover[0];
      const uploadedCover = await uploadFile(
        coverFile.buffer,
        coverFile.originalname,
        coverFile.mimetype,
        `problems/${problemId}/cover`
      );
      problem.coverImage = uploadedCover.url;
    }

    if (req.files.files && req.files.files.length > 0) {
      const uploadedFiles = await uploadMultipleFiles(
        req.files.files,
        `problems/${problemId}`
      );

      const mediaFiles = uploadedFiles.map(file => {
        let fileType = 'IMAGE';
        if (file.mimetype.startsWith('video/')) {
          fileType = 'VIDEO';
        } else if (file.mimetype === 'application/pdf') {
          fileType = 'PDF';
        }

        return {
          type: fileType,
          url: file.url,
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype,
          objectName: file.objectName
        };
      });

      problem.mediaFiles = mediaFiles;
    }

    await problem.save();
  }

  await upsertOperations(req.body.operationsUndertaken);
  await upsertOperations(req.body.machineOperations);

  res.status(201).json({
    status: 'success',
    message: 'Problem created successfully as DRAFT',
    data: {
      problem
    }
  });
});

const getMyProblems = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;

  const filter = { postedBy: req.user._id };
  if (status) {
    filter.status = status.toUpperCase();
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const problems = await InnovationRequest.find(filter)
    .sort({ [sortBy]: sortOrder })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await InnovationRequest.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      problems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const getProblemDetails = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;

  const problem = await InnovationRequest.findById(problemId);

  if (!problem) {
    return next(new AppError('Problem not found', 404));
  }

  if (problem.postedBy.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only view your own problems', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      problem
    }
  });
});

const updateProblem = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;

  const problem = await InnovationRequest.findById(problemId);

  if (!problem) {
    return next(new AppError('Problem not found', 404));
  }

  if (problem.postedBy.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only update your own problems', 403));
  }

  if (problem.status === 'PENDING_APPROVAL') {
    return next(new AppError('Cannot edit problems that are pending approval. Wait for admin review.', 400));
  }

  const wasPublished = problem.status === 'PUBLISHED';

  const allowedUpdates = [
    'problemTitle', 'problemDescription', 'regionState', 'regionDistrict', 'regionVillage',
    'category', 'categoryOther', 'valueChainStages', 'crops', 'operationsUndertaken',
    'machineOperations', 'currentMethodology', 'knowMachinery', 'machineChallenge',
    'energySource', 'pullCapacity', 'engineCapacity', 'motorCapacity', 'renewableType',
    'specificInfo', 'problemSize', 'endProducts', 'salesChannels', 'newChannels',
    'currentRevenue', 'expectedRevenue', 'machineBudget'
  ];

  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      problem[key] = req.body[key];
    }
  });

  // Don't store empty categoryOther
  if (!problem.categoryOther) {
    problem.categoryOther = undefined;
  }

  if (wasPublished) {
    problem.status = 'PENDING_APPROVAL';
  }

  // Handle cover image changes
  if (req.files?.cover?.[0]) {
    if (problem.coverImage) {
      try { await deleteFile(problem.coverImage); } catch (e) { /* ignore */ }
    }
    const coverFile = req.files.cover[0];
    const uploadedCover = await uploadFile(
      coverFile.buffer,
      coverFile.originalname,
      coverFile.mimetype,
      `problems/${problemId}/cover`
    );
    problem.coverImage = uploadedCover.url;
  } else if (req.body.removeCoverImage === 'true' && problem.coverImage) {
    try { await deleteFile(problem.coverImage); } catch (e) { /* ignore */ }
    problem.coverImage = undefined;
  }

  await problem.save();
  await upsertOperations(req.body.operationsUndertaken);
  await upsertOperations(req.body.machineOperations);

  if (wasPublished) {
    await invalidateProblemOnModification(problemId);
  }

  const message = wasPublished
    ? 'Problem updated and submitted for re-approval'
    : 'Problem updated successfully';

  res.status(200).json({
    status: 'success',
    message,
    data: {
      problem
    }
  });
});

const deleteProblem = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;

  const problem = await InnovationRequest.findById(problemId);

  if (!problem) {
    return next(new AppError('Problem not found', 404));
  }

  if (problem.postedBy.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only delete your own problems', 403));
  }

  if (problem.status === 'PUBLISHED') {
    return next(new AppError('Cannot delete published problems. Please contact admin.', 400));
  }

  if (problem.coverImage) {
    try {
      await deleteFile(problem.coverImage);
    } catch (error) {
      console.error('Error deleting cover image:', error);
    }
  }

  if (problem.mediaFiles && problem.mediaFiles.length > 0) {
    try {
      const fileUrls = problem.mediaFiles.map(file => file.url);
      await deleteMultipleFiles(fileUrls);
    } catch (error) {
      console.error('Error deleting media files:', error);
    }
  }

  await InnovationRequest.findByIdAndDelete(problemId);

  res.status(200).json({
    status: 'success',
    message: 'Problem deleted successfully'
  });
});

const submitForApproval = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;

  const problem = await InnovationRequest.findById(problemId);

  if (!problem) {
    return next(new AppError('Problem not found', 404));
  }

  const isOwner = problem.postedBy.toString() === req.user._id.toString();
  const isRegistrant = problem.registeredBy?.toString() === req.user._id.toString();
  if (!isOwner && !isRegistrant) {
    return next(new AppError('You can only submit your own problems', 403));
  }

  if (!['DRAFT', 'REJECTED'].includes(problem.status)) {
    return next(new AppError(`Cannot submit problem with status ${problem.status}`, 400));
  }

  // AO and NO problems are auto-approved on submission
  if (req.user.role === 'AO' || req.user.role === 'NO') {
    problem.status = 'PUBLISHED';
    problem.approvedAt = new Date();
    await problem.save();

    const poster = await User.findById(problem.postedBy);
    if (poster) {
      try {
        await sendProblemApprovalNotification(problem, poster);
      } catch (err) {
        console.error('Failed to send problem approval notification:', err);
      }
      setImmediate(() =>
        broadcastNewProblemPublished(problem, poster).catch(err =>
          console.error('Failed to broadcast new problem published:', err.message)
        )
      );
    }
    try {
      await updateProblemKeywords(problem._id);
      await findMatchingInnovations(problem._id);
    } catch (err) {
      console.error('Error in matching after auto-approval:', err);
    }
    await invalidateProblemOnApproval(problem._id);

    return res.status(200).json({
      status: 'success',
      message: 'Problem published successfully',
      data: { problem }
    });
  }

  problem.status = 'PENDING_APPROVAL';
  await problem.save();

  if (req.user.role === 'VLE') {
    const vleProfile = await VleProfile.findOne({ userId: req.user._id });
    if (vleProfile && vleProfile.affiliatedOrg) {
      const aoUser = await User.findById(vleProfile.affiliatedOrg);
      if (aoUser) {
        sendVleSubmittedProblem(aoUser, problem, req.user).catch(err =>
          console.error('Failed to send VLE submitted problem notification to AO:', err.message)
        );
      }
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Problem submitted for approval',
    data: {
      problem
    }
  });
});

module.exports = {
  createProblem,
  getMyProblems,
  getProblemDetails,
  updateProblem,
  deleteProblem,
  submitForApproval
};
