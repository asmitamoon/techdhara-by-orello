const { uploadFile, uploadMultipleFiles, deleteFile } = require('../../../services/storage/minioService');
const Innovation = require('../../../models/Innovation');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');

const uploadInnovationFiles = catchAsync(async (req, res, next) => {
  const { innovationId } = req.params;
  const files = req.files;

  if (!files || files.length === 0) {
    return next(new AppError('No files provided', 400));
  }

  const innovation = await Innovation.findById(innovationId);

  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }

  if (innovation.innovatorId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only upload files to your own innovations', 403));
  }

  const uploadedFiles = await uploadMultipleFiles(files, `innovations/${innovationId}`);

  uploadedFiles.forEach(file => {
    if (file.mimetype.startsWith('image/')) {
      innovation.media.images.push({
        url: file.url,
        filename: file.filename,
        mimetype: file.mimetype,
        objectName: file.objectName,
        size: file.size,
        uploadedAt: new Date()
      });
    } else if (file.mimetype.startsWith('video/')) {
      innovation.media.videos.push({
        url: file.url,
        isExternal: false,
        filename: file.filename,
        mimetype: file.mimetype,
        objectName: file.objectName,
        size: file.size,
        uploadedAt: new Date(),
        processingStatus: 'ORIGINAL'
      });
    } else if (file.mimetype === 'application/pdf') {
      innovation.downloadableResources.push({
        type: 'PDF',
        url: file.url,
        filename: file.filename,
        mimetype: file.mimetype,
        objectName: file.objectName,
        size: file.size,
        uploadedAt: new Date()
      });
    }
  });

  await innovation.save();

  res.status(200).json({
    status: 'success',
    message: 'Files uploaded successfully',
    data: {
      uploadedFiles: uploadedFiles.map(f => ({ url: f.url, filename: f.filename, size: f.size, mimetype: f.mimetype }))
    }
  });
});

const deleteInnovationFile = catchAsync(async (req, res, next) => {
  const { innovationId, fileId } = req.params;

  const innovation = await Innovation.findById(innovationId);

  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }

  if (innovation.innovatorId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only delete files from your own innovations', 403));
  }

  let found = null;
  let foundArr = null;
  let foundIdx = -1;

  const searchArrays = [
    innovation.media.images,
    innovation.media.videos,
    innovation.downloadableResources
  ];

  for (const arr of searchArrays) {
    const idx = arr.findIndex(f => f._id.toString() === fileId);
    if (idx !== -1) {
      found = arr[idx];
      foundArr = arr;
      foundIdx = idx;
      break;
    }
  }

  if (!found) {
    return next(new AppError('File not found', 404));
  }

  await deleteFile(found.url);
  foundArr.splice(foundIdx, 1);

  if (foundArr === innovation.media.videos && found.objectName) {
    const drIdx = innovation.downloadableResources.findIndex(r => r.objectName === found.objectName);
    if (drIdx !== -1) innovation.downloadableResources.splice(drIdx, 1);
  }

  await innovation.save();

  res.status(200).json({
    status: 'success',
    message: 'File deleted successfully'
  });
});

const uploadCoverImage = catchAsync(async (req, res, next) => {
  const { innovationId } = req.params;
  const file = req.file;

  if (!file) {
    return next(new AppError('No file provided', 400));
  }

  const innovation = await Innovation.findById(innovationId);

  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }

  if (innovation.innovatorId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only upload cover image to your own innovations', 403));
  }

  if (innovation.media.images.length > 0) {
    try {
      await deleteFile(innovation.media.images[0].url);
    } catch (error) {
      console.error('Error deleting old cover image:', error);
    }
  }

  const uploadedFile = await uploadFile(
    file.buffer,
    file.originalname,
    file.mimetype,
    `innovations/${innovationId}/cover`
  );

  const coverImageData = {
    url: uploadedFile.url,
    filename: uploadedFile.filename,
    mimetype: uploadedFile.mimetype,
    objectName: uploadedFile.objectName,
    size: uploadedFile.size,
    uploadedAt: new Date()
  };

  if (innovation.media.images.length > 0) {
    innovation.media.images.splice(0, 1, coverImageData);
  } else {
    innovation.media.images.push(coverImageData);
  }

  await innovation.save();

  res.status(200).json({
    status: 'success',
    message: 'Cover image uploaded successfully',
    data: {
      coverImage: uploadedFile.url
    }
  });
});

module.exports = {
  uploadInnovationFiles,
  deleteInnovationFile,
  uploadCoverImage
};
