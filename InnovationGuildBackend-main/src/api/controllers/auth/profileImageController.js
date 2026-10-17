const { uploadFile, deleteFile } = require('../../../services/storage/minioService');
const User = require('../../../models/User');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');

const uploadProfileImage = catchAsync(async (req, res, next) => {
  const file = req.file;

  if (!file) {
    return next(new AppError('No file provided', 400));
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.profilePicture && user.profilePicture.includes(process.env.MINIO_ENDPOINT)) {
    try {
      await deleteFile(user.profilePicture);
    } catch (error) {
      console.error('Error deleting old profile picture:', error);
    }
  }

  const uploadedFile = await uploadFile(
    file.buffer,
    file.originalname,
    file.mimetype,
    `users/${user._id}/profile-picture`
  );

  user.profilePicture = uploadedFile.url;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Profile image uploaded successfully',
    data: {
      profilePicture: uploadedFile.url,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profilePicture: user.profilePicture
      }
    }
  });
});

const deleteProfileImage = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (!user.profilePicture) {
    return next(new AppError('No profile picture to delete', 400));
  }

  if (user.profilePicture.includes(process.env.MINIO_ENDPOINT)) {
    try {
      await deleteFile(user.profilePicture);
    } catch (error) {
      console.error('Error deleting profile picture from MinIO:', error);
    }
  }

  user.profilePicture = null;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Profile image deleted successfully'
  });
});

const getProfileImage = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      profilePicture: user.profilePicture
    }
  });
});

module.exports = {
  uploadProfileImage,
  deleteProfileImage,
  getProfileImage
};
