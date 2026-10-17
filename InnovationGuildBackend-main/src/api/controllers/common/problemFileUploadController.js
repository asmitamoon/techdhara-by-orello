const { uploadFile, uploadMultipleFiles, deleteFile } = require('../../../services/storage/minioService');
const InnovationRequest = require('../../../models/InnovationRequest');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');

const uploadProblemFiles = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;
  const file = req.file;

  if (!file) {
    return next(new AppError('No image provided', 400));
  }

  if (!file.mimetype.startsWith('image/')) {
    return next(new AppError('Only image files are allowed', 400));
  }

  const problem = await InnovationRequest.findById(problemId);

  if (!problem) {
    return next(new AppError('Problem not found', 404));
  }

  if (problem.postedBy.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only upload images to your own problems', 403));
  }

  if (problem.mediaFiles && problem.mediaFiles.length > 0) {
    return next(new AppError('Problem already has an image. Delete the existing image first.', 400));
  }

  const uploadedFile = await uploadFile(
    file.buffer,
    file.originalname,
    file.mimetype,
    `problems/${problemId}`
  );

  const mediaFile = {
    type: 'IMAGE',
    url: uploadedFile.url,
    filename: uploadedFile.filename,
    size: uploadedFile.size,
    mimetype: uploadedFile.mimetype,
    objectName: uploadedFile.objectName
  };

  problem.mediaFiles.push(mediaFile);
  await problem.save();

  res.status(200).json({
    status: 'success',
    message: 'Image uploaded successfully',
    data: {
      uploadedFile: mediaFile
    }
  });
});

const deleteProblemFile = catchAsync(async (req, res, next) => {
  const { problemId, fileId } = req.params;

  const problem = await InnovationRequest.findById(problemId);

  if (!problem) {
    return next(new AppError('Problem not found', 404));
  }

  if (problem.postedBy.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only delete files from your own problems', 403));
  }

  const fileIndex = problem.mediaFiles.findIndex(
    file => file._id.toString() === fileId
  );

  if (fileIndex === -1) {
    return next(new AppError('File not found', 404));
  }

  const file = problem.mediaFiles[fileIndex];

  await deleteFile(file.url);

  problem.mediaFiles.splice(fileIndex, 1);
  await problem.save();

  res.status(200).json({
    status: 'success',
    message: 'File deleted successfully'
  });
});

module.exports = {
  uploadProblemFiles,
  deleteProblemFile
};
