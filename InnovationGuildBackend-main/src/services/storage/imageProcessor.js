const sharp = require('sharp');
const { AppError } = require('../../utils/errorHandler');
const { IMAGE_COMPRESSION } = require('../../config/uploadLimits');

const processImage = async (imageBuffer) => {
  try {
    return await sharp(imageBuffer)
      .resize(IMAGE_COMPRESSION.maxWidth, IMAGE_COMPRESSION.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: IMAGE_COMPRESSION.quality })
      .toBuffer();
  } catch (error) {
    console.error('Image processing error:', error);
    throw new AppError('Failed to process image', 500);
  }
};

const getImageMetadata = async (imageBuffer) => {
  try {
    return await sharp(imageBuffer).metadata();
  } catch (error) {
    console.error('Image metadata error:', error);
    throw new AppError('Failed to read image metadata', 500);
  }
};

module.exports = {
  processImage,
  getImageMetadata
};
