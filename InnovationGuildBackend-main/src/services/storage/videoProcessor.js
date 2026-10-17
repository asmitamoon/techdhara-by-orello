const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { FFMPEG_SETTINGS, STORAGE } = require('../../config/videoProcessing');
const { AppError } = require('../../utils/errorHandler');

const compressVideo = async (inputBuffer, originalFilename) => {
  const timestamp = Date.now();
  const tempDir = STORAGE.tempDir;

  try {
    await fs.mkdir(tempDir, { recursive: true });

    const inputPath = path.join(tempDir, `input-${timestamp}-${originalFilename}`);
    const outputFilename = originalFilename.replace(/\.[^/.]+$/, '.mp4');
    const outputPath = path.join(tempDir, `output-${timestamp}-${outputFilename}`);

    await fs.writeFile(inputPath, inputBuffer);

    console.log(`[VideoProcessor] Starting compression for ${originalFilename}`);
    const startTime = Date.now();
    const ffmpegArgs = [
      '-i', inputPath,
      '-c:v', FFMPEG_SETTINGS.codec,
      '-s', FFMPEG_SETTINGS.resolution,
      '-b:v', FFMPEG_SETTINGS.videoBitrate,
      '-c:a', FFMPEG_SETTINGS.audioCodec,
      '-b:a', FFMPEG_SETTINGS.audioBitrate,
      '-preset', FFMPEG_SETTINGS.preset,
      '-crf', FFMPEG_SETTINGS.crf.toString(),
      '-movflags', '+faststart',
      '-profile:v', 'high',
      '-level', '4.0',
      '-g', '60',
      '-sc_threshold', '0',
      '-f', FFMPEG_SETTINGS.format,
      '-y', // Overwrite output file if exists
      outputPath
    ];

    console.log(`[VideoProcessor] FFmpeg command: ffmpeg ${ffmpegArgs.join(' ')}`);

    // Execute FFmpeg compression
    await new Promise((resolve, reject) => {
      const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

      let stderrData = '';

      ffmpegProcess.stderr.on('data', (data) => {
        const output = data.toString();
        stderrData += output;

        // Parse progress from FFmpeg stderr output
        const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2})/);
        if (timeMatch) {
          const [, hours, minutes, seconds] = timeMatch;
          const currentTime = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);

          // Log progress periodically (every 30 seconds of video time)
          if (currentTime % 30 === 0) {
            console.log(`[VideoProcessor] Processing: ${hours}:${minutes}:${seconds}`);
          }
        }
      });

      ffmpegProcess.on('close', (code) => {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        if (code === 0) {
          console.log(`[VideoProcessor] Compression completed in ${duration}s`);
          resolve();
        } else {
          console.error(`[VideoProcessor] FFmpeg error (exit code ${code}):`, stderrData);
          reject(new AppError(`Video compression failed with exit code ${code}`, 500));
        }
      });

      ffmpegProcess.on('error', (err) => {
        console.error(`[VideoProcessor] FFmpeg spawn error:`, err);
        reject(new AppError(`Failed to spawn FFmpeg: ${err.message}`, 500));
      });
    });

    // Read compressed video
    const compressedBuffer = await fs.readFile(outputPath);

    const metadata = await getVideoMetadata(outputPath);

    await fs.unlink(inputPath).catch(err =>
      console.warn(`[VideoProcessor] Failed to delete input temp file: ${err.message}`)
    );
    await fs.unlink(outputPath).catch(err =>
      console.warn(`[VideoProcessor] Failed to delete output temp file: ${err.message}`)
    );

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
    const originalSize = inputBuffer.length;
    const compressedSize = compressedBuffer.length;
    const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(2);

    console.log(`[VideoProcessor] Compression stats:
      - Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB
      - Compressed: ${(compressedSize / 1024 / 1024).toFixed(2)} MB
      - Saved: ${compressionRatio}%
      - Time: ${processingTime}s
    `);

    return {
      buffer: compressedBuffer,
      filename: outputFilename,
      metadata: {
        ...metadata
      }
    };

  } catch (error) {
    console.error(`[VideoProcessor] Compression error:`, error);
    throw error;
  }
};

const getVideoMetadata = (videoPath) => {
  return new Promise((resolve, reject) => {
    const ffprobeArgs = [
      '-v', 'error',
      '-show_entries', 'format=duration,bit_rate:stream=codec_type,codec_name,width,height',
      '-of', 'json',
      videoPath
    ];

    const ffprobeProcess = spawn('ffprobe', ffprobeArgs);

    let stdoutData = '';
    let stderrData = '';

    ffprobeProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    ffprobeProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    ffprobeProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const metadata = JSON.parse(stdoutData);
          const videoStream = metadata.streams.find(s => s.codec_type === 'video');
          const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

          resolve({
            duration: parseFloat(metadata.format.duration) || 0,
            bitrate: parseInt(metadata.format.bit_rate) || 0,
            width: videoStream?.width || 0,
            height: videoStream?.height || 0,
            videoCodec: videoStream?.codec_name || 'unknown',
            audioCodec: audioStream?.codec_name || 'none'
          });
        } catch (err) {
          console.error(`[VideoProcessor] Metadata parse error:`, err);
          reject(new AppError('Failed to parse video metadata', 500));
        }
      } else {
        console.error(`[VideoProcessor] ffprobe error (exit code ${code}):`, stderrData);
        reject(new AppError('Failed to extract video metadata', 500));
      }
    });

    ffprobeProcess.on('error', (err) => {
      console.error(`[VideoProcessor] ffprobe spawn error:`, err);
      reject(new AppError(`Failed to spawn ffprobe: ${err.message}`, 500));
    });
  });
};

const validateVideoFile = (mimetype) => {
  const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
  return allowedTypes.includes(mimetype);
};

const cleanupTempFiles = async () => {
  try {
    const tempDir = STORAGE.tempDir;

    try {
      await fs.access(tempDir);
    } catch {
      return;
    }

    const files = await fs.readdir(tempDir);
    const now = Date.now();
    const maxAge = 3600000; // 1 hour

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);
      const age = now - stats.mtimeMs;

      if (age > maxAge) {
        await fs.unlink(filePath);
        console.log(`[VideoProcessor] Cleaned up old temp file: ${file}`);
      }
    }
  } catch (error) {
    console.error(`[VideoProcessor] Temp cleanup error:`, error);
  }
};

module.exports = {
  compressVideo,
  getVideoMetadata,
  validateVideoFile,
  cleanupTempFiles
};
