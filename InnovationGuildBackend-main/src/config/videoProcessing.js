/**
 * Video Processing Configuration
 * FFmpeg settings for video compression
 */

const os = require('os');
const path = require('path');

const getDefaultTempDir = () => {
  const systemTempDir = os.tmpdir();
  return path.join(systemTempDir, 'video-processing');
};

module.exports = {
  // FFmpeg compression settings
  FFMPEG_SETTINGS: {
    resolution: '1280x720',      // 720p output
    codec: 'libx264',             // H.264 codec
    preset: 'veryfast',           // Encoding speed (veryfast for 1 vCPU)
    videoBitrate: '2000k',        // 2 Mbps video bitrate
    audioCodec: 'aac',            // AAC audio codec
    audioBitrate: '128k',         // 128 kbps audio bitrate
    crf: 28,                      // Constant Rate Factor (23=default, 28=faster/smaller)
    format: 'mp4'                 // Output format
  },

  // Queue configuration
  QUEUE_CONFIG: {
    maxConcurrent: 1,             // Process 1 video at a time (1 GB RAM constraint)
    maxRetries: 3,                // Retry failed jobs 3 times
    retryDelay: 5000,             // 5 seconds between retries
    jobTimeout: 1800000,          // 30 minutes max per job (safety for large files)
    removeOnComplete: 100,        // Keep last 100 completed jobs in queue
    removeOnFail: 200             // Keep last 200 failed jobs for debugging
  },

  // Storage settings
  STORAGE: {
    tempDir: process.env.TEMP_VIDEO_DIR || getDefaultTempDir(),
    maxTempDiskUsage: 2 * 1024 * 1024 * 1024,  // 2 GB max temp files
    cleanupInterval: 3600000      // Cleanup temp files every hour
  },

  // Processing status enum
  STATUS: {
    ORIGINAL: 'ORIGINAL',         // Video uploaded, not processed
    QUEUED: 'QUEUED',             // Job added to queue, waiting
    PROCESSING: 'PROCESSING',     // Currently being compressed
    COMPLETED: 'COMPLETED',       // Compression successful
    FAILED: 'FAILED'              // Compression failed after retries
  }
};
