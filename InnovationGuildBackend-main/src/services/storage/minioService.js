const Minio = require('minio');
const { AppError } = require('../../utils/errorHandler');
const { processImage } = require('./imageProcessor');

const parseEndpoint = () => {
  const endpoint = process.env.DO_SPACES_ENDPOINT || process.env.MINIO_ENDPOINT;
  const url = new URL(endpoint);
  return {
    endPoint: url.hostname,
    port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
    useSSL: url.protocol === 'https:'
  };
};

const { endPoint, port, useSSL } = parseEndpoint();

const minioClient = new Minio.Client({
  endPoint,
  port,
  useSSL,
  accessKey: process.env.DO_SPACES_KEY || process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.DO_SPACES_SECRET || process.env.MINIO_SECRET_KEY
});

const bucketName = process.env.DO_SPACES_BUCKET || process.env.MINIO_BUCKET || 'innovation-guild-assets';

const initializeBucket = async () => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');

      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`]
          }
        ]
      };
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
      console.log(`MinIO bucket '${bucketName}' created successfully`);
    }
  } catch (error) {
    console.error('MinIO initialization error:', error);
  }
};

initializeBucket();

const uploadFile = async (fileBuffer, filename, mimetype, folder = 'general') => {
  try {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');

    let processedBuffer = fileBuffer;
    let finalFilename = sanitizedFilename;
    let finalMimetype = mimetype;

    if (mimetype.startsWith('image/')) {
      try {
        processedBuffer = await processImage(fileBuffer);
        finalFilename = sanitizedFilename.replace(/\.[^/.]+$/, '.webp');
        finalMimetype = 'image/webp';
      } catch (error) {
        console.error('Image processing failed, uploading original:', error);
      }
    }

    const objectName = `${folder}/${timestamp}-${finalFilename}`;

    const metadata = {
      'Content-Type': finalMimetype,
      'x-amz-acl': 'public-read'
    };

    await minioClient.putObject(bucketName, objectName, processedBuffer, processedBuffer.length, metadata);

    const endpoint = process.env.DO_SPACES_ENDPOINT || process.env.MINIO_ENDPOINT;
    const cdnUrl = process.env.DO_SPACES_CDN;
    const fileUrl = cdnUrl
      ? `${cdnUrl}/${objectName}`
      : `${endpoint}/${bucketName}/${objectName}`;

    return {
      url: fileUrl,
      filename: finalFilename,
      size: processedBuffer.length,
      mimetype: finalMimetype,
      objectName
    };
  } catch (error) {
    console.error('MinIO upload error:', error);
    throw new AppError('File upload failed', 500);
  }
};

const uploadMultipleFiles = async (files, folder = 'general') => {
  try {
    const uploadPromises = files.map(file =>
      uploadFile(file.buffer, file.originalname, file.mimetype, folder)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('MinIO multiple upload error:', error);
    throw new AppError('Multiple file upload failed', 500);
  }
};

const deleteFile = async (fileUrlOrObjectName) => {
  try {
    let objectName;

    if (fileUrlOrObjectName.includes('http://') || fileUrlOrObjectName.includes('https://')) {
      const cdnBase = process.env.DO_SPACES_CDN;
      if (cdnBase && fileUrlOrObjectName.startsWith(cdnBase)) {
        objectName = fileUrlOrObjectName.slice(cdnBase.length + 1);
      } else {
        objectName = fileUrlOrObjectName.split(`${bucketName}/`)[1];
      }
    } else {
      objectName = fileUrlOrObjectName;
    }

    if (!objectName) {
      throw new AppError('Invalid file URL or object name', 400);
    }

    await minioClient.removeObject(bucketName, objectName);
    return true;
  } catch (error) {
    console.error('MinIO delete error:', error);
    throw new AppError('File deletion failed', 500);
  }
};

const deleteMultipleFiles = async (fileUrls) => {
  try {
    const deletePromises = fileUrls.map(url => deleteFile(url));
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('MinIO multiple delete error:', error);
    throw new AppError('Multiple file deletion failed', 500);
  }
};

const getPresignedUrl = async (objectName, expirySeconds = 24 * 60 * 60) => {
  try {
    return await minioClient.presignedGetObject(bucketName, objectName, expirySeconds);
  } catch (error) {
    console.error('MinIO presigned URL error:', error);
    throw new AppError('Failed to generate file URL', 500);
  }
};

const streamVideoRange = async (objectName, start, end) => {
  try {
    const stream = await minioClient.getPartialObject(
      bucketName,
      objectName,
      start,
      end - start + 1
    );
    return stream;
  } catch (error) {
    console.error('[MinIO] Range streaming error:', error);
    throw new AppError('Failed to stream video range', 500);
  }
};

const getVideoSize = async (objectName) => {
  try {
    const stat = await minioClient.statObject(bucketName, objectName);
    return stat.size;
  } catch (error) {
    console.error('[MinIO] Stat error:', error);
    throw new AppError('Failed to get video size', 404);
  }
};

module.exports = {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  deleteMultipleFiles,
  getPresignedUrl,
  streamVideoRange,
  getVideoSize,
  minioClient,
  bucketName
};
