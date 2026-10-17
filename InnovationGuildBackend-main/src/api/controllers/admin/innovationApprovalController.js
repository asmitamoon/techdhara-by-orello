const mongoose = require('mongoose');
const Innovation = require('../../../models/Innovation');
const InnovatorProfile = require('../../../models/InnovatorProfile');
const Pilot = require('../../../models/Pilot');
const User = require('../../../models/User');
const Match = require('../../../models/Match');
const Comment = require('../../../models/Comment');
const SavedInnovation = require('../../../models/SavedInnovation');
const BusinessModel = require('../../../models/BusinessModel');
const Notification = require('../../../models/Notification');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { deleteFile, deleteMultipleFiles, uploadMultipleFiles } = require('../../../services/storage/minioService');
const { invalidateProblemMatches } = require('../../../services/cache/matchCache');
const { addVideoCompressionJob } = require('../../../services/queue/videoQueue');
const { STATUS } = require('../../../config/videoProcessing');
const { findMatchingInnovationRequests } = require('../../../services/matching/matchingService');
const { updateInnovationKeywords } = require('../../../services/matching/keywordExtractor');
const { sendInnovationApprovalNotification, sendInnovationRejectionNotification } = require('../../../services/notification/admin/contentApprovalNotification');
const { sendRequestEditNotification } = require('../../../services/notification/admin/requestEditNotification');
const { invalidateInnovationOnApproval, invalidateInnovationOnModification } = require('../../../services/cache/cacheInvalidation');
const { broadcastNewInnovationPublished } = require('../../../services/notification/common/broadcastNotification');
const { upsertOperations } = require('../../../utils/dbHelpers');

const getPendingInnovations = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;

  const filter = { status: 'PENDING_APPROVAL' };
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const innovations = await Innovation.find(filter)
    .populate('innovatorId', 'fullName email phone')
    .sort({ [sortBy]: sortOrder })
    .limit(parseInt(limit))
    .skip(skip);

  const innovatorIds = innovations.map(i => i.innovatorId?._id).filter(Boolean);
  const profiles = await InnovatorProfile.find({ userId: { $in: innovatorIds } })
    .select('userId enterpriseName').lean();
  const profileMap = new Map(profiles.map(p => [p.userId.toString(), p.enterpriseName]));
  const result = innovations.map(i => {
    const obj = i.toObject();
    if (obj.innovatorId?._id) {
      obj.innovatorId.enterpriseName = profileMap.get(obj.innovatorId._id.toString()) || null;
    }
    return obj;
  });

  const total = await Innovation.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      innovations: result,
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

  const innovation = await Innovation.findById(innovationId)
    .populate('innovatorId', 'fullName email phone profilePicture');

  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      innovation
    }
  });
});

const approveInnovation = catchAsync(async (req, res, next) => {
  const { innovationId } = req.params;

  const innovation = await Innovation.findById(innovationId);

  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }

  if (innovation.status !== 'PENDING_APPROVAL') {
    return next(new AppError('Only innovations with PENDING_APPROVAL status can be approved', 400));
  }

  innovation.status = 'PUBLISHED';
  innovation.approvedAt = new Date();
  await innovation.save();

  const innovator = await User.findById(innovation.innovatorId);
  if (innovator) {
    try {
      await sendInnovationApprovalNotification(innovation, innovator);
    } catch (error) {
      console.error('Failed to send innovation approval notification:', error);
    }
    setImmediate(() =>
      broadcastNewInnovationPublished(innovation, innovator).catch(err =>
        console.error('Failed to broadcast new innovation published:', err.message)
      )
    );
  }

  try {
    await updateInnovationKeywords(innovationId);
    await findMatchingInnovationRequests(innovationId);
  } catch (error) {
    console.error('Error in matching after innovation approval:', error);
  }

  await invalidateInnovationOnApproval(innovationId);

  res.status(200).json({
    status: 'success',
    message: 'Innovation approved and published successfully',
    data: {
      innovation
    }
  });
});

const rejectInnovation = catchAsync(async (req, res, next) => {
  const { innovationId } = req.params;
  const { reason } = req.body;

  const innovation = await Innovation.findById(innovationId);

  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }

  if (innovation.status !== 'PENDING_APPROVAL') {
    return next(new AppError('Only innovations with PENDING_APPROVAL status can be rejected', 400));
  }

  innovation.status = 'REJECTED';
  innovation.rejectionReason = reason;
  await innovation.save();

  const innovator = await User.findById(innovation.innovatorId);
  if (innovator) {
    try {
      await sendInnovationRejectionNotification(innovation, innovator, reason);
    } catch (error) {
      console.error('Failed to send innovation rejection notification:', error);
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Innovation rejected successfully',
    data: {
      innovation,
      rejectionReason: reason || null
    }
  });
});

const getApprovedInnovations = catchAsync(async (req, res, next) => {
  const {
    status,
    category,
    subCategory,
    stage,
    innovatorId,
    search,
    state,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    order = 'desc'
  } = req.query;

  const filter = {};

  filter.status = status ? status.toUpperCase() : 'PUBLISHED';

  if (category) {
    filter.category = category;
  }

  if (subCategory) {
    filter.subcategory = subCategory;
  }

  if (stage) {
    filter.innovationStage = stage;
  }

  if (innovatorId) {
    filter.innovatorId = innovatorId;
  }

  if (search) {
    const matchingUsers = await User.find(
      { fullName: { $regex: search, $options: 'i' } }
    ).select('_id').lean();
    const matchingUserIds = matchingUsers.map(u => u._id);

    filter.$or = [
      { innovationName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { innovatorId: { $in: matchingUserIds } }
    ];
  }

  if (state) {
    filter.salesLocation = { $in: [state] };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const [innovations, total] = await Promise.all([
    Innovation.find(filter)
      .populate('innovatorId', 'fullName email phone')
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip),
    Innovation.countDocuments(filter)
  ]);

  const innovationIds = innovations.map(i => i._id);
  const [implementedCounts, approvedProfiles] = await Promise.all([
    Pilot.aggregate([
      { $match: { innovationId: { $in: innovationIds }, status: 'IMPLEMENTED' } },
      { $group: { _id: '$innovationId', count: { $sum: 1 } } }
    ]),
    InnovatorProfile.find({ userId: { $in: innovations.map(i => i.innovatorId?._id).filter(Boolean) } })
      .select('userId enterpriseName').lean()
  ]);
  const countMap = new Map(implementedCounts.map(item => [item._id.toString(), item.count]));
  const approvedProfileMap = new Map(approvedProfiles.map(p => [p.userId.toString(), p.enterpriseName]));
  const innovationsWithCounts = innovations.map(i => {
    const obj = i.toObject();
    if (obj.innovatorId?._id) {
      obj.innovatorId.enterpriseName = approvedProfileMap.get(obj.innovatorId._id.toString()) || null;
    }
    return { ...obj, noImplemented: countMap.get(i._id.toString()) || 0 };
  });

  res.status(200).json({
    status: 'success',
    data: {
      innovations: innovationsWithCounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const updateInnovation = catchAsync(async (req, res, next) => {
  const { innovationId } = req.params;

  const innovation = await Innovation.findById(innovationId);
  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
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

  // Pre-parse JSON string fields from FormData
  const jsonFields = ['category', 'subcategory', 'salesLocation', 'coveredOperations', 'sellingPrice'];
  jsonFields.forEach(field => {
    if (req.body[field] && typeof req.body[field] === 'string') {
      try { req.body[field] = JSON.parse(req.body[field]); } catch (e) {}
    }
  });

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      innovation[field] = req.body[field];
    }
  });

  // Parse deletedMediaIds (JSON string from FormData or array from JSON body)
  const deletedMediaIds = (() => {
    const raw = req.body.deletedMediaIds;
    if (!raw) return [];
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  })();

  // Delete removed media files from storage and database
  if (deletedMediaIds.length > 0) {
    for (const id of deletedMediaIds) {
      const imgIdx = innovation.media.images.findIndex(f => f._id.toString() === id);
      if (imgIdx !== -1) {
        const file = innovation.media.images[imgIdx];
        try { await deleteFile(file.url); } catch (e) { /* file may already be gone */ }
        innovation.media.images.splice(imgIdx, 1);
        continue;
      }
      const vidIdx = innovation.media.videos.findIndex(f => f._id.toString() === id);
      if (vidIdx !== -1) {
        const file = innovation.media.videos[vidIdx];
        try { await deleteFile(file.url); } catch (e) { /* file may already be gone */ }
        innovation.media.videos.splice(vidIdx, 1);
      }
    }
  }

  // Upload new images
  if (req.files?.images?.length > 0) {
    const imagePositions = req.body.imagePositions ? JSON.parse(req.body.imagePositions) : [];
    const uploadedImages = await uploadMultipleFiles(req.files.images, `innovations/${innovationId}/images`);
    uploadedImages.forEach((file, i) => {
      innovation.media.images.push({
        url: file.url, filename: file.filename, mimetype: file.mimetype,
        objectName: file.objectName, size: file.size, uploadedAt: new Date(),
        position: imagePositions[i] ?? i,
      });
    });
  }

  // Upload new videos
  let uploadedVideos = [];
  if (req.files?.videos?.length > 0) {
    const existingUploadedVideos = innovation.media.videos.filter(v => !v.isExternal).length;
    if (existingUploadedVideos >= 2) {
      return next(new AppError('Cannot upload more videos. Maximum 2 uploaded videos allowed per innovation.', 400));
    }

    const videoPositions = req.body.videoPositions ? JSON.parse(req.body.videoPositions) : [];
    uploadedVideos = await uploadMultipleFiles(req.files.videos, `innovations/${innovationId}/videos`);
    uploadedVideos.forEach((file, i) => {
      innovation.media.videos.push({
        url: file.url, isExternal: false, filename: file.filename, mimetype: file.mimetype,
        objectName: file.objectName, size: file.size, uploadedAt: new Date(),
        processingStatus: STATUS.ORIGINAL, position: videoPositions[i] ?? i,
      });
    });
  }

  // Upload new documents
  if (req.files?.documents?.length > 0) {
    const uploadedDocuments = await uploadMultipleFiles(
      req.files.documents,
      `innovations/${innovationId}/documents`
    );
    uploadedDocuments.forEach(file => {
      innovation.downloadableResources.push({
        type: file.mimetype === 'application/pdf' ? 'PDF' : 'DOCUMENT',
        url: file.url, filename: file.filename, mimetype: file.mimetype,
        objectName: file.objectName, size: file.size, uploadedAt: new Date(),
      });
    });
  }

  // Delete removed documents
  const deletedDocumentIds = (() => {
    const raw = req.body.deletedDocumentIds;
    if (!raw) return [];
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  })();
  if (deletedDocumentIds.length > 0) {
    for (const docId of deletedDocumentIds) {
      const docIdx = innovation.downloadableResources.findIndex(d => d._id.toString() === docId);
      if (docIdx !== -1) {
        const doc = innovation.downloadableResources[docIdx];
        try { await deleteFile(doc.url); } catch (e) { /* file may already be gone */ }
        innovation.downloadableResources.splice(docIdx, 1);
      }
    }
  }

  // Add new external (YouTube) videos
  const externalVideoData = req.body.externalVideoData ? JSON.parse(req.body.externalVideoData) : [];
  if (externalVideoData.length > 0) {
    externalVideoData.forEach(({ url, position }) => {
      innovation.media.videos.push({ url, isExternal: true, position: position ?? 0 });
    });
  }

  // Clean up any stale downloadableResources entries with invalid types (e.g. legacy 'VIDEO' entries)
  innovation.downloadableResources = innovation.downloadableResources.filter(
    r => ['PDF', 'DOCUMENT'].includes(r.type)
  );

  const mediaOrder = (() => {
    const raw = req.body.mediaOrder;
    if (!raw) return [];
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  })();
  if (mediaOrder.length > 0) {
    const orderMap = new Map(mediaOrder.map(o => [String(o._id), o.position]));
    innovation.media.images.forEach(img => {
      const pos = orderMap.get(String(img._id));
      if (pos !== undefined) img.position = pos;
    });
    innovation.media.videos.forEach(vid => {
      const pos = orderMap.get(String(vid._id));
      if (pos !== undefined) vid.position = pos;
    });
  }

  await innovation.save();
  await upsertOperations(req.body.coveredOperations);

  // Queue video compression for newly uploaded videos
  if (uploadedVideos.length > 0) {
    for (const file of uploadedVideos) {
      const vidIdx = innovation.media.videos.findIndex(v => v.objectName === file.objectName);
      if (vidIdx !== -1) {
        try {
          await addVideoCompressionJob({
            innovationId: innovation._id, videoIndex: vidIdx,
            videoUrl: file.url, objectName: file.objectName, originalFilename: file.filename,
          });
          innovation.media.videos[vidIdx].processingStatus = STATUS.QUEUED;
        } catch (e) { /* non-fatal: video uploaded but compression not queued */ }
      }
    }
    await innovation.save();
  }

  const MATCHING_RELEVANT_FIELDS = [
    'innovationName', 'description', 'category', 'categoryOther',
    'subcategory', 'coveredOperations', 'suitableCrops', 'suitableTerrains',
    'suitableSoil', 'weatherConditions', 'otherUsageConditions',
    'performanceParams', 'technicalTraining', 'demoInstallations'
  ];
  const matchingFieldsChanged = MATCHING_RELEVANT_FIELDS.some(f => req.body[f] !== undefined);

  if (wasPublished) {
    await invalidateInnovationOnModification(innovationId);
    if (matchingFieldsChanged) {
      try {
        await updateInnovationKeywords(innovationId);
        await findMatchingInnovationRequests(innovationId);
      } catch (err) {
        console.error('Post-update matching failed:', err);
      }
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Innovation updated successfully',
    data: { innovation }
  });
});

const requestEditInnovation = catchAsync(async (req, res, next) => {
  const { innovationId } = req.params;
  const { reason } = req.body;

  if (!reason) {
    return next(new AppError('A reason is required when requesting an edit', 400));
  }

  const innovation = await Innovation.findById(innovationId);
  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }

  innovation.status = 'DRAFT';
  innovation.rejectionReason = reason;
  await innovation.save();

  const innovator = await User.findById(innovation.innovatorId);
  if (innovator) {
    try {
      await sendRequestEditNotification(innovator, reason, 'Innovation', innovation.innovationName);
    } catch (error) {
      console.error('Failed to send request-edit notification:', error);
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Edit requested successfully. Innovation returned to draft.',
    data: { innovation }
  });
});

// SUPER_ADMIN only: permanently delete an innovation — ONLY if it is not yet involved in a
// pilot process. A pilot, or a business model (which requires a pilot), means the pilot process
// is ongoing or done, so deletion is refused. This transitively protects field reports &
// bookkeeping (which hang off a pilot). Only the lightweight, safe dependents are cascaded.
const adminDeleteInnovation = catchAsync(async (req, res, next) => {
  const { innovationId } = req.params;

  const innovation = await Innovation.findById(innovationId);
  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }

  // Guardrail: block if the innovation is already part of a pilot process.
  // BusinessModel.pilotId is required, so a business model implies a pilot — we still check it
  // explicitly in case a pilot was removed but its business model lingered.
  const pilotCount = await Pilot.countDocuments({ innovationId });
  const businessModelCount = await BusinessModel.countDocuments({ innovationId });
  if (pilotCount > 0 || businessModelCount > 0) {
    return next(new AppError(
      `Cannot delete: this innovation is already part of a pilot process (pilots: ${pilotCount}, business models: ${businessModelCount}). Only innovations not yet involved in a pilot can be deleted.`,
      409
    ));
  }

  // Capture matched problemIds for cache invalidation before deleting the matches
  const matches = await Match.find({ innovationId }).select('problemId').lean();
  const problemIds = [...new Set(matches.map(m => String(m.problemId)).filter(Boolean))];

  // Atomic DB cascade — lightweight, safe dependents only (auto-generated matches, comments,
  // saved-list entries, notifications). Pilots / business models were ruled out above.
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Match.deleteMany({ innovationId }, { session });
      await Comment.deleteMany({ innovationId }, { session });
      await SavedInnovation.deleteMany({ innovationId }, { session });
      await Notification.deleteMany({ entityType: 'Innovation', entityId: innovationId }, { session });
      await Innovation.deleteOne({ _id: innovationId }, { session });
    });
  } finally {
    await session.endSession();
  }

  // Storage cleanup — best-effort, after commit (a failed file delete never corrupts DB state)
  const fileUrls = [
    ...(innovation.media?.images?.map(i => i.url) || []),
    ...(innovation.media?.videos?.filter(v => !v.isExternal).map(v => v.url) || []),
    ...(innovation.downloadableResources?.map(r => r.url) || []),
  ].filter(Boolean);
  if (fileUrls.length) {
    try {
      await deleteMultipleFiles(fileUrls);
    } catch (error) {
      console.error('[adminDeleteInnovation] file cleanup failed:', error.message);
    }
  }

  // Cache invalidation: public list/detail + innovation match cache, and each matched problem
  await invalidateInnovationOnModification(innovationId);
  for (const problemId of problemIds) {
    await invalidateProblemMatches(problemId);
  }

  console.log(`[adminDeleteInnovation] SUPER_ADMIN ${req.user._id} deleted innovation ${innovationId} (matches:${matches.length}, files:${fileUrls.length})`);

  res.status(200).json({
    status: 'success',
    message: 'Innovation and all related data deleted'
  });
});

module.exports = {
  getPendingInnovations,
  getInnovationDetails,
  approveInnovation,
  rejectInnovation,
  requestEditInnovation,
  updateInnovation,
  getApprovedInnovations,
  adminDeleteInnovation
};
