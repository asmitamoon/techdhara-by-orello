const FILE_LIMITS = {
  IMAGE: {
    maxPerFile: 5 * 1024 * 1024,
    maxCount: 10,
    allowedMimes: ['image/jpeg', 'image/png', 'image/webp']
  },
  VIDEO: {
    maxPerFile: 200 * 1024 * 1024,
    maxCount: 2,
    allowedMimes: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo']
  },
  DOCUMENT: {
    maxPerFile: 10 * 1024 * 1024,
    maxTotalSize: 20 * 1024 * 1024,
    maxCount: 10,
    allowedMimes: [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  }
};

const IMAGE_COMPRESSION = {
  quality: 85,
  maxWidth: 3000,
  maxHeight: 3000,
  format: 'webp'
};

const ERROR_MESSAGES = {
  IMAGE_SIZE: (filename) => `Image '${filename}' exceeds 5MB limit`,
  IMAGE_FORMAT: (filename) => `Image '${filename}' has invalid format. Allowed: JPEG, PNG, WebP`,
  IMAGE_COUNT: 'Cannot upload more than 10 images',
  VIDEO_SIZE: (filename) => `Video '${filename}' exceeds 200MB limit`,
  VIDEO_COUNT: 'Cannot upload more than 2 videos',
  DOCUMENT_SIZE: (filename) => `Document '${filename}' exceeds 10MB limit`,
  DOCUMENT_COUNT: 'Cannot upload more than 10 documents',
  DOCUMENT_TOTAL: 'Total document size cannot exceed 20MB',
  INVALID_FILE_TYPE: 'Invalid file type. Only images (JPG, PNG, WEBP), Office documents (PDF, PPT, DOC, XLS), and videos (MP4, MOV, AVI) are allowed'
};

module.exports = {
  FILE_LIMITS,
  IMAGE_COMPRESSION,
  ERROR_MESSAGES
};
