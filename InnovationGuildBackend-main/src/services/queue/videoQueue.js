const Bull = require('bull');
const { compressVideo, cleanupTempFiles } = require('../storage/videoProcessor');
const { uploadFile, deleteFile, minioClient, bucketName } = require('../storage/minioService');
const Innovation = require('../../models/Innovation');
const { QUEUE_CONFIG, STATUS } = require('../../config/videoProcessing');

const videoQueue = new Bull('video-compression', process.env.REDIS_URL || 'redis://localhost:6379', {
  defaultJobOptions: {
    attempts: QUEUE_CONFIG.maxRetries,
    backoff: {
      type: 'exponential',
      delay: QUEUE_CONFIG.retryDelay
    },
    timeout: QUEUE_CONFIG.jobTimeout,
    removeOnComplete: QUEUE_CONFIG.removeOnComplete,
    removeOnFail: QUEUE_CONFIG.removeOnFail
  }
});

videoQueue.process(QUEUE_CONFIG.maxConcurrent, async (job) => {
  const { innovationId, videoIndex, videoUrl, objectName, originalFilename } = job.data;

  console.log(`[VideoQueue] Processing job ${job.id} for innovation ${innovationId}, video ${videoIndex}`);

  try {
    await updateVideoStatus(innovationId, videoIndex, STATUS.PROCESSING);

    // Download video from MinIO
    console.log(`[VideoQueue] Downloading video from MinIO: ${objectName}`);

    const chunks = [];
    const stream = await minioClient.getObject(bucketName, objectName);

    await new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    const videoBuffer = Buffer.concat(chunks);
    const originalSize = videoBuffer.length;

    console.log(`[VideoQueue] Downloaded ${(originalSize / 1024 / 1024).toFixed(2)} MB`);

    // Compress video
    const { buffer: compressedBuffer, filename: compressedFilename, metadata } = await compressVideo(
      videoBuffer,
      originalFilename
    );

    console.log(`[VideoQueue] Compression successful, uploading to MinIO...`);

    // Upload compressed video to MinIO
    const uploadResult = await uploadFile(
      compressedBuffer,
      compressedFilename,
      'video/mp4',
      `innovations/${innovationId}/videos`
    );

    console.log(`[VideoQueue] Uploaded compressed video: ${uploadResult.url}`);

    try {
      await deleteFile(objectName);
      console.log(`[VideoQueue] Deleted original video: ${objectName}`);
    } catch (err) {
      console.warn(`[VideoQueue] Failed to delete original video: ${err.message}`);
    }

    await updateVideoAfterCompression(innovationId, videoIndex, {
      url: uploadResult.url,
      filename: uploadResult.filename,
      objectName: uploadResult.objectName,
      size: uploadResult.size,
      mimetype: 'video/mp4',
      processingStatus: STATUS.COMPLETED,
    });

    console.log(`[VideoQueue] Job ${job.id} completed successfully`);

    return {
      success: true,
      innovationId,
      videoIndex,
      compressedUrl: uploadResult.url,
      metadata
    };

  } catch (error) {
    console.error(`[VideoQueue] Job ${job.id} failed:`, error);

    await updateVideoStatus(innovationId, videoIndex, STATUS.FAILED, error.message);

    throw error; // Re-throw to trigger Bull retry mechanism
  }
});

const addVideoCompressionJob = async (jobData) => {
  const job = await videoQueue.add(jobData, {
    priority: 1 // Can add priority logic later
  });

  console.log(`[VideoQueue] Added job ${job.id} to queue for innovation ${jobData.innovationId}`);

  return job.id;
};

const getJobStatus = async (jobId) => {
  const job = await videoQueue.getJob(jobId);

  if (!job) {
    return { status: 'NOT_FOUND' };
  }

  const state = await job.getState();
  const progress = job.progress();
  const failedReason = job.failedReason;

  return {
    jobId: job.id,
    status: state,
    progress,
    failedReason,
    data: job.data
  };
};

const updateVideoStatus = async (innovationId, videoIndex, status, errorMessage = null) => {
  const updateFields = {
    [`media.videos.${videoIndex}.processingStatus`]: status
  };

  if (errorMessage) {
    updateFields[`media.videos.${videoIndex}.processingError`] = errorMessage;
  }

  const innovation = await Innovation.findByIdAndUpdate(
    innovationId,
    { $set: updateFields },
    { new: true, runValidators: false }
  );

  if (!innovation || !innovation.media.videos[videoIndex]) {
    throw new Error(`Innovation or video not found: ${innovationId}, index ${videoIndex}`);
  }

  console.log(`[VideoQueue] Updated video status to ${status} for innovation ${innovationId}, video ${videoIndex}`);
};

const updateVideoAfterCompression = async (innovationId, videoIndex, videoData) => {
  const updateFields = {};

  Object.keys(videoData).forEach(key => {
    updateFields[`media.videos.${videoIndex}.${key}`] = videoData[key];
  });

  const innovation = await Innovation.findByIdAndUpdate(
    innovationId,
    { $set: updateFields },
    { new: true, runValidators: false }
  );

  if (!innovation || !innovation.media.videos[videoIndex]) {
    throw new Error(`Innovation or video not found: ${innovationId}, index ${videoIndex}`);
  }

  console.log(`[VideoQueue] Updated innovation ${innovationId}, video ${videoIndex} with compressed data`);
};

videoQueue.on('completed', (job, result) => {
  console.log(`[VideoQueue] Job ${job.id} completed:`, result);
});

videoQueue.on('failed', (job, err) => {
  console.error(`[VideoQueue] Job ${job.id} failed:`, err.message);
});

videoQueue.on('stalled', (job) => {
  console.warn(`[VideoQueue] Job ${job.id} stalled`);
});

videoQueue.on('error', (error) => {
  console.error(`[VideoQueue] Queue error:`, error);
});

setInterval(async () => {
  await cleanupTempFiles();
}, 3600000);

const getQueueStats = async () => {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    videoQueue.getWaitingCount(),
    videoQueue.getActiveCount(),
    videoQueue.getCompletedCount(),
    videoQueue.getFailedCount(),
    videoQueue.getDelayedCount()
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed
  };
};

module.exports = {
  videoQueue,
  addVideoCompressionJob,
  getJobStatus,
  getQueueStats
};
