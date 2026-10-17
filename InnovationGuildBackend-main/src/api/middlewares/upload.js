const multer = require('multer');
const { AppError } = require('../../utils/errorHandler');
const { FILE_LIMITS, ERROR_MESSAGES } = require('../../config/uploadLimits');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedDocumentTypes = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];

  const allAllowedTypes = [...allowedImageTypes, ...allowedDocumentTypes, ...allowedVideoTypes];

  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only images (JPG, PNG, WEBP), Office documents (PDF, PPT, DOC, XLS), and videos (MP4, MOV, AVI) are allowed', 400), false);
  }
};

const limits = {
  fileSize: 200 * 1024 * 1024
};

const upload = multer({
  storage,
  fileFilter,
  limits
});

const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File size exceeds 200MB limit', 400));
        }
        return next(new AppError(err.message, 400));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

const uploadMultiple = (fieldName, maxCount = 10) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('One or more files exceed 200MB limit', 400));
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(new AppError(`Maximum ${maxCount} files allowed`, 400));
        }
        return next(new AppError(err.message, 400));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

const uploadFields = (fields) => {
  return (req, res, next) => {
    upload.fields(fields)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('One or more files exceed 200MB limit', 400));
        }
        return next(new AppError(err.message, 400));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

const validateFileSize = (options = {}) => {
  return (req, res, next) => {
    if (!req.files) return next();

    try {
      let totalDocumentSize = 0;

      if (req.files.images && req.files.images.length > 0) {
        if (req.files.images.length > FILE_LIMITS.IMAGE.maxCount) {
          return next(new AppError(ERROR_MESSAGES.IMAGE_COUNT, 400));
        }

        for (const file of req.files.images) {
          if (file.size > FILE_LIMITS.IMAGE.maxPerFile) {
            return next(new AppError(ERROR_MESSAGES.IMAGE_SIZE(file.originalname), 400));
          }
        }
      }

      if (req.files.videos && req.files.videos.length > 0) {
        if (req.files.videos.length > FILE_LIMITS.VIDEO.maxCount) {
          return next(new AppError(ERROR_MESSAGES.VIDEO_COUNT, 400));
        }

        for (const file of req.files.videos) {
          if (file.size > FILE_LIMITS.VIDEO.maxPerFile) {
            return next(new AppError(ERROR_MESSAGES.VIDEO_SIZE(file.originalname), 400));
          }
        }
      }

      if (req.files.documents && req.files.documents.length > 0) {
        if (req.files.documents.length > FILE_LIMITS.DOCUMENT.maxCount) {
          return next(new AppError(ERROR_MESSAGES.DOCUMENT_COUNT, 400));
        }

        for (const file of req.files.documents) {
          if (file.size > FILE_LIMITS.DOCUMENT.maxPerFile) {
            return next(new AppError(ERROR_MESSAGES.DOCUMENT_SIZE(file.originalname), 400));
          }
          totalDocumentSize += file.size;
        }

        if (totalDocumentSize > FILE_LIMITS.DOCUMENT.maxTotalSize) {
          return next(new AppError(ERROR_MESSAGES.DOCUMENT_TOTAL, 400));
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  validateFileSize
};
