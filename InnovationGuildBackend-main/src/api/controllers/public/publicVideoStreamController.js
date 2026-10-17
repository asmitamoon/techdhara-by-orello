const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const Innovation = require('../../../models/Innovation');
const { streamVideoRange, getVideoSize, minioClient, bucketName } = require('../../../services/storage/minioService');

const streamPublicVideo = catchAsync(async (req, res, next) => {
  const { innovationId, videoIndex } = req.params;

  const innovation = await Innovation.findById(innovationId);
  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }

  if (innovation.status !== 'PUBLISHED') {
    return next(new AppError('Innovation not found', 404));
  }

  const index = parseInt(videoIndex);
  const video = innovation.media.videos[index];

  if (!video) {
    return next(new AppError('Video not found', 404));
  }

  if (video.isExternal) {
    return next(new AppError('Cannot stream external videos', 400));
  }

  if (video.processingStatus !== 'COMPLETED') {
    return next(new AppError('Video is still processing', 425));
  }

  const fileSize = await getVideoSize(video.objectName);
  const range = req.headers.range;

  if (!range) {
    res.writeHead(200, {
      'Content-Type': 'video/mp4',
      'Content-Length': fileSize,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000'
    });

    const stream = await minioClient.getObject(bucketName, video.objectName);
    return stream.pipe(res);
  }

  const parts = range.replace(/bytes=/, '').split('-');
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

  if (start >= fileSize || end >= fileSize || start > end) {
    res.writeHead(416, {
      'Content-Range': `bytes */${fileSize}`
    });
    return res.end();
  }

  const chunkSize = (end - start) + 1;

  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunkSize,
    'Content-Type': 'video/mp4',
    'Cache-Control': 'public, max-age=31536000'
  });

  const stream = await streamVideoRange(video.objectName, start, end);
  stream.pipe(res);
});

module.exports = {
  streamPublicVideo
};
