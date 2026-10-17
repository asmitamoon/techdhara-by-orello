const Innovation = require('../../../models/Innovation');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { sendInnovationSubmittedToAdmin } = require('../../../services/notification/admin/innovationNotification');
const { deleteFile, deleteMultipleFiles, uploadFile, uploadMultipleFiles } = require('../../../services/storage/minioService');
const { invalidateInnovationOnModification } = require('../../../services/cache/cacheInvalidation');
const { addVideoCompressionJob } = require('../../../services/queue/videoQueue');
const { STATUS } = require('../../../config/videoProcessing');
const { upsertOperations } = require('../../../utils/dbHelpers');

const createInnovation = catchAsync(async (req, res, next) => {
  const innovationData = {
    ...req.body,
    innovatorId: req.user._id,
    status: 'DRAFT',
    media: { images: [], videos: [] },
    downloadableResources: []
  };

  const innovation = new Innovation(innovationData);
  const innovationId = innovation._id;

  const imagePositions = req.body.imagePositions ? JSON.parse(req.body.imagePositions) : [];
  const videoPositions = req.body.videoPositions ? JSON.parse(req.body.videoPositions) : [];
  const externalVideoData = req.body.externalVideoData ? JSON.parse(req.body.externalVideoData) : [];

  if (req.files) {
    if (req.files.images && req.files.images.length > 0) {
      const uploadedImages = await uploadMultipleFiles(
        req.files.images,
        `innovations/${innovationId}/images`
      );

      innovation.media.images = uploadedImages.map((file, i) => ({
        url: file.url,
        filename: file.filename,
        mimetype: file.mimetype,
        objectName: file.objectName,
        size: file.size,
        uploadedAt: new Date(),
        position: imagePositions[i] ?? i
      }));
    }

    if (req.files.videos && req.files.videos.length > 0) {
      const uploadedVideos = await uploadMultipleFiles(
        req.files.videos,
        `innovations/${innovationId}/videos`
      );

      uploadedVideos.forEach((file, i) => {
        const videoData = {
          url: file.url,
          isExternal: false,
          filename: file.filename,
          mimetype: file.mimetype,
          objectName: file.objectName,
          size: file.size,
          uploadedAt: new Date(),
          processingStatus: STATUS.ORIGINAL,
          position: videoPositions[i] ?? i
        };

        innovation.media.videos.push(videoData);
      });

      // Queue video compression jobs
      await innovation.save();

      for (let i = 0; i < uploadedVideos.length; i++) {
        const file = uploadedVideos[i];
        const videoIndex = innovation.media.videos.findIndex(v => v.objectName === file.objectName);

        if (videoIndex !== -1) {
          try {
            await addVideoCompressionJob({
              innovationId: innovation._id,
              videoIndex,
              videoUrl: file.url,
              objectName: file.objectName,
              originalFilename: file.filename
            });

            innovation.media.videos[videoIndex].processingStatus = STATUS.QUEUED;
            console.log(`[InnovationController] Queued compression for video ${videoIndex} of innovation ${innovation._id}`);
          } catch (error) {
            console.error(`[InnovationController] Failed to queue video compression:`, error);
          }
        }
      }
    }

    if (req.files.documents && req.files.documents.length > 0) {
      const uploadedDocuments = await uploadMultipleFiles(
        req.files.documents,
        `innovations/${innovationId}/documents`
      );

      uploadedDocuments.forEach(file => {
        innovation.downloadableResources.push({
          type: file.mimetype === 'application/pdf' ? 'PDF' : 'DOCUMENT',
          url: file.url,
          filename: file.filename,
          mimetype: file.mimetype,
          objectName: file.objectName,
          size: file.size,
          uploadedAt: new Date()
        });
      });
    }
  }

  if (externalVideoData.length > 0) {
    externalVideoData.forEach(({ url, position }) => {
      innovation.media.videos.push({ url, isExternal: true, position: position ?? 0 });
    });
  }

  await innovation.save();
  await upsertOperations(req.body.coveredOperations);

  res.status(201).json({
    status: 'success',
    message: 'Innovation created successfully as DRAFT',
    data: {
      innovation
    }
  });
});

const getMyInnovations = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;

  const filter = { innovatorId: req.user._id };
  if (status) {
    filter.status = status.toUpperCase();
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const innovations = await Innovation.find(filter)
    .sort({ [sortBy]: sortOrder })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Innovation.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      innovations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const getInnovationDetails = catchAsync(async (req, res, next) => {
  const { innovationId } = req.params;

  const innovation = await Innovation.findById(innovationId);

  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }

  if (innovation.innovatorId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only view your own innovations', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      innovation
    }
  });
});

const updateInnovation = catchAsync(async (req, res, next) => {
  const { innovationId } = req.params;

  const innovation = await Innovation.findById(innovationId);

  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }

  if (innovation.innovatorId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only update your own innovations', 403));
  }

  if (innovation.status === 'PENDING_APPROVAL') {
    return next(new AppError('Cannot edit innovations that are pending approval. Wait for admin review.', 400));
  }

  const wasPublished = innovation.status === 'PUBLISHED';

  const allowedUpdates = [
    'innovationName', 'description', 'category', 'categoryOther',
    'subcategory', 'subcategoryOther',
    'yearLaunched', 'innovationStage', 'sellingPrice', 'numberOfUnitsInstalled',
    'distributorNetwork', 'salesLocation',
    'powerSource', 'pullCapacity', 'engineCapacity', 'motorCapacity', 'renewableType',
    'dimensions', 'weight', 'attachments', 'performanceParams', 'coveredOperations',
    'manufacturingLocation',
    'suitableCrops', 'suitableTerrains', 'suitableSoil', 'weatherConditions',
    'otherUsageConditions', 'spareParts', 'importedParts',
    'maintenanceTraining', 'financingSupport', 'technicalTraining', 'demoInstallations'
  ];

  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      innovation[key] = req.body[key];
    }
  });

  const imagePositions = req.body.imagePositions ? JSON.parse(req.body.imagePositions) : [];
  const videoPositions = req.body.videoPositions ? JSON.parse(req.body.videoPositions) : [];
  const externalVideoData = req.body.externalVideoData ? JSON.parse(req.body.externalVideoData) : [];

  if (req.files) {
    if (req.files.images && req.files.images.length > 0) {
      const uploadedImages = await uploadMultipleFiles(
        req.files.images,
        `innovations/${innovationId}/images`
      );

      const newImages = uploadedImages.map((file, i) => ({
        url: file.url,
        filename: file.filename,
        mimetype: file.mimetype,
        objectName: file.objectName,
        size: file.size,
        uploadedAt: new Date(),
        position: imagePositions[i] ?? i
      }));

      if (!innovation.media) innovation.media = { images: [], videos: [] };
      innovation.media.images.push(...newImages);
    }

    if (req.files.videos && req.files.videos.length > 0) {
      const uploadedVideos = await uploadMultipleFiles(
        req.files.videos,
        `innovations/${innovationId}/videos`
      );

      const existingUploadedVideos = innovation.media.videos.filter(v => !v.isExternal).length;
      if (existingUploadedVideos >= 2) {
        return next(new AppError('Cannot upload more videos. Maximum 2 uploaded videos allowed per innovation.', 400));
      }

      if (!innovation.media) innovation.media = { images: [], videos: [] };
      if (!innovation.downloadableResources) innovation.downloadableResources = [];

      uploadedVideos.forEach((file, i) => {
        const videoData = {
          url: file.url,
          isExternal: false,
          filename: file.filename,
          mimetype: file.mimetype,
          objectName: file.objectName,
          size: file.size,
          uploadedAt: new Date(),
          processingStatus: STATUS.ORIGINAL,
          position: videoPositions[i] ?? i
        };

        innovation.media.videos.push(videoData);
      });

      await innovation.save();

      for (let i = 0; i < uploadedVideos.length; i++) {
        const file = uploadedVideos[i];
        const videoIndex = innovation.media.videos.findIndex(v => v.objectName === file.objectName);

        if (videoIndex !== -1) {
          try {
            await addVideoCompressionJob({
              innovationId: innovation._id,
              videoIndex,
              videoUrl: file.url,
              objectName: file.objectName,
              originalFilename: file.filename
            });

            innovation.media.videos[videoIndex].processingStatus = STATUS.QUEUED;
            console.log(`[InnovationController] Queued compression for video ${videoIndex} of innovation ${innovation._id}`);
          } catch (error) {
            console.error(`[InnovationController] Failed to queue video compression:`, error);
          }
        }
      }
    }

    if (req.files.documents && req.files.documents.length > 0) {
      const uploadedDocuments = await uploadMultipleFiles(
        req.files.documents,
        `innovations/${innovationId}/documents`
      );

      if (!innovation.downloadableResources) innovation.downloadableResources = [];

      uploadedDocuments.forEach(file => {
        innovation.downloadableResources.push({
          type: file.mimetype === 'application/pdf' ? 'PDF' : 'DOCUMENT',
          url: file.url,
          filename: file.filename,
          mimetype: file.mimetype,
          objectName: file.objectName,
          size: file.size,
          uploadedAt: new Date()
        });
      });
    }
  }

  if (req.body.mediaOrder?.length > 0) {
    const orderMap = new Map(req.body.mediaOrder.map(o => [String(o._id), o.position]));
    innovation.media.images.forEach(img => {
      const pos = orderMap.get(String(img._id));
      if (pos !== undefined) img.position = pos;
    });
    innovation.media.videos.forEach(vid => {
      const pos = orderMap.get(String(vid._id));
      if (pos !== undefined) vid.position = pos;
    });
  }

  if (req.body.removedExternalVideoIds?.length > 0) {
    const idsToRemove = req.body.removedExternalVideoIds.map(String);
    innovation.media.videos = innovation.media.videos.filter(
      v => !v.isExternal || !idsToRemove.includes(String(v._id))
    );
  }

  if (externalVideoData.length > 0) {
    if (!innovation.media) innovation.media = { images: [], videos: [] };
    externalVideoData.forEach(({ url, position }) => {
      innovation.media.videos.push({ url, isExternal: true, position: position ?? 0 });
    });
  }

  if (wasPublished) {
    innovation.status = 'PENDING_APPROVAL';
  }

  await innovation.save();
  await upsertOperations(req.body.coveredOperations);

  if (wasPublished) {
    await invalidateInnovationOnModification(innovationId);
  }

  const message = wasPublished
    ? 'Innovation updated and submitted for re-approval'
    : 'Innovation updated successfully';

  res.status(200).json({
    status: 'success',
    message,
    data: {
      innovation
    }
  });
});

const deleteInnovation = catchAsync(async (req, res, next) => {
  const { innovationId } = req.params;

  const innovation = await Innovation.findById(innovationId);

  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }

  if (innovation.innovatorId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only delete your own innovations', 403));
  }

  if (innovation.status === 'PUBLISHED') {
    return next(new AppError('Cannot delete published innovations. Please contact admin.', 400));
  }

  if (innovation.media?.images && innovation.media.images.length > 0) {
    try {
      const imageUrls = innovation.media.images.map(img => img.url);
      await deleteMultipleFiles(imageUrls);
    } catch (error) {
      console.error('Error deleting images:', error);
    }
  }

  if (innovation.media?.videos && innovation.media.videos.length > 0) {
    try {
      const uploadedVideos = innovation.media.videos.filter(v => !v.isExternal);
      const videoUrls = uploadedVideos.map(v => v.url);
      if (videoUrls.length > 0) {
        await deleteMultipleFiles(videoUrls);
      }
    } catch (error) {
      console.error('Error deleting videos:', error);
    }
  }

  if (innovation.downloadableResources && innovation.downloadableResources.length > 0) {
    try {
      const resourceUrls = innovation.downloadableResources.map(r => r.url);
      await deleteMultipleFiles(resourceUrls);
    } catch (error) {
      console.error('Error deleting downloadable resources:', error);
    }
  }

  await Innovation.findByIdAndDelete(innovationId);

  res.status(200).json({
    status: 'success',
    message: 'Innovation deleted successfully'
  });
});

const submitForApproval = catchAsync(async (req, res, next) => {
  const { innovationId } = req.params;

  const innovation = await Innovation.findById(innovationId);

  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }

  if (innovation.innovatorId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only submit your own innovations', 403));
  }

  if (req.user.status !== 'APPROVED') {
    return next(new AppError('Your account must be approved before you can submit innovations for review', 403));
  }

  if (!['DRAFT', 'REJECTED'].includes(innovation.status)) {
    return next(new AppError(`Cannot submit innovation with status ${innovation.status}`, 400));
  }

  innovation.status = 'PENDING_APPROVAL';
  await innovation.save();

  sendInnovationSubmittedToAdmin(req.user, innovation).catch(() => {});

  res.status(200).json({
    status: 'success',
    message: 'Innovation submitted for approval',
    data: {
      innovation
    }
  });
});

module.exports = {
  createInnovation,
  getMyInnovations,
  getInnovationDetails,
  updateInnovation,
  deleteInnovation,
  submitForApproval
};
