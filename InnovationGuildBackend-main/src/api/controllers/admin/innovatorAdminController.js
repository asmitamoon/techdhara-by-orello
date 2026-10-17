const User = require('../../../models/User');
const InnovatorProfile = require('../../../models/InnovatorProfile');
const Innovation = require('../../../models/Innovation');
const Pilot = require('../../../models/Pilot');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { uploadFile, deleteFile } = require('../../../services/storage/minioService');
const { sendApprovalNotification, sendRejectionNotification } = require('../../../services/notification/admin/userApprovalNotification');
const { sendRequestEditNotification } = require('../../../services/notification/admin/requestEditNotification');

const getApprovedInnovators = catchAsync(async (req, res, next) => {
  const {
    status, search, state, district, igImplementation,
    page = 1, limit = 20
  } = req.query;

  // Step 1: filter on InnovatorProfile fields (location, igImplementation)
  const profileFilter = {};
  if (state) profileFilter.state = state;
  if (district) profileFilter.district = district;

  let userIdFilter = null;
  if (Object.keys(profileFilter).length > 0) {
    const profiles = await InnovatorProfile.find(profileFilter).select('userId').lean();
    userIdFilter = profiles.map(p => p.userId);
  }

  // Step 2: filter Users
  const userFilter = { role: 'INNOVATOR', status: status ? status.toUpperCase() : 'APPROVED' };
  if (search) {
    const enterpriseMatches = await InnovatorProfile.find(
      { enterpriseName: { $regex: search, $options: 'i' } }
    ).select('userId').lean();
    const enterpriseUserIds = enterpriseMatches.map(p => p.userId);

    userFilter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { _id: { $in: enterpriseUserIds } }
    ];
  }
  // Step 1.5: filter by igImplementation (computed from pilot data)
  let igIdFilter = null;
  if (igImplementation) {
    const allActivePilots = await Pilot.find(
      { status: { $ne: 'CANCELLED' } },
      { innovationId: 1, status: 1 }
    ).lean();

    const activeInnoIds = allActivePilots.map(p => p.innovationId);
    const activeInnovations = await Innovation.find(
      { _id: { $in: activeInnoIds } },
      { innovatorId: 1 }
    ).lean();

    const innoMap = new Map(
      activeInnovations.map(i => [i._id.toString(), i.innovatorId.toString()])
    );

    const igStatusMap = new Map();
    for (const pilot of allActivePilots) {
      const innovatorId = innoMap.get(pilot.innovationId.toString());
      if (!innovatorId) continue;
      if (pilot.status === 'IMPLEMENTED') {
        igStatusMap.set(innovatorId, 'Yes');
      } else if (igStatusMap.get(innovatorId) !== 'Yes') {
        igStatusMap.set(innovatorId, 'Under Process');
      }
    }

    if (igImplementation === 'Yes' || igImplementation === 'Under Process') {
      const ids = [...igStatusMap.entries()]
        .filter(([, v]) => v === igImplementation)
        .map(([k]) => k);
      igIdFilter = { $in: ids };
    } else if (igImplementation === 'No') {
      const activeIds = [...igStatusMap.keys()];
      igIdFilter = { $nin: activeIds };
    }
  }

  // Combine location filter and igImplementation filter on _id
  const idConditions = [];
  if (userIdFilter !== null) idConditions.push({ _id: { $in: userIdFilter } });
  if (igIdFilter !== null) idConditions.push({ _id: igIdFilter });

  if (idConditions.length === 1) {
    userFilter._id = idConditions[0]._id;
  } else if (idConditions.length === 2) {
    userFilter.$and = idConditions;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(userFilter)
      .select('-passwordHash')
      .sort({ signUpDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments(userFilter)
  ]);

  // Step 3: attach profiles
  const profiles = await InnovatorProfile.find({ userId: { $in: users.map(u => u._id) } }).lean();
  const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));

  // Step 4: compute igImplementation from pilot data
  const userIds = users.map(u => u._id);
  const innovations = await Innovation.find(
    { innovatorId: { $in: userIds } },
    { _id: 1, innovatorId: 1 }
  ).lean();

  const igImplMap = new Map();
  if (innovations.length > 0) {
    const innovationIds = innovations.map(i => i._id);
    const pilots = await Pilot.find(
      { innovationId: { $in: innovationIds }, status: { $ne: 'CANCELLED' } },
      { innovationId: 1, status: 1 }
    ).lean();

    const innoToInnovator = new Map(
      innovations.map(i => [i._id.toString(), i.innovatorId.toString()])
    );

    for (const pilot of pilots) {
      const innovatorIdStr = innoToInnovator.get(pilot.innovationId.toString());
      if (!innovatorIdStr) continue;
      const current = igImplMap.get(innovatorIdStr) || 'No';
      if (pilot.status === 'IMPLEMENTED') {
        igImplMap.set(innovatorIdStr, 'Yes');
      } else if (current !== 'Yes') {
        igImplMap.set(innovatorIdStr, 'Under Process');
      }
    }
  }

  const result = users.map(u => ({
    ...u,
    profile: {
      ...(profileMap.get(u._id.toString()) || null),
      igImplementation: igImplMap.get(u._id.toString()) || 'No',
    },
  }));

  res.status(200).json({
    status: 'success',
    data: {
      innovators: result,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const getInnovatorDetails = catchAsync(async (req, res, next) => {
  const { innovatorId } = req.params;

  const user = await User.findById(innovatorId).select('-passwordHash');
  if (!user || user.role !== 'INNOVATOR') {
    return next(new AppError('Innovator not found', 404));
  }

  const profile = await InnovatorProfile.findOne({ userId: innovatorId });

  res.status(200).json({
    status: 'success',
    data: { user, profile }
  });
});

const getInnovatorInnovations = catchAsync(async (req, res, next) => {
  const { innovatorId } = req.params;
  const { status, search, category, subCategory, stage, state, page = 1, limit = 20 } = req.query;

  const user = await User.findById(innovatorId);
  if (!user || user.role !== 'INNOVATOR') {
    return next(new AppError('Innovator not found', 404));
  }

  const filter = { innovatorId };
  if (status) filter.status = status.toUpperCase();
  if (category) filter.category = { $in: [category] };
  if (subCategory) filter.subcategory = { $in: [subCategory] };
  if (stage) filter.innovationStage = stage;
  if (state) filter.salesLocation = { $in: [state] };
  if (search) filter.innovationName = { $regex: search, $options: 'i' };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [innovations, total] = await Promise.all([
    Innovation.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Innovation.countDocuments(filter)
  ]);

  const innovationIds = innovations.map(i => i._id);
  const implementedCounts = await Pilot.aggregate([
    { $match: { innovationId: { $in: innovationIds }, status: 'IMPLEMENTED' } },
    { $group: { _id: '$innovationId', count: { $sum: 1 } } }
  ]);
  const countMap = new Map(implementedCounts.map(item => [item._id.toString(), item.count]));
  const innovationsWithCounts = innovations.map(i => ({
    ...i,
    noImplemented: countMap.get(i._id.toString()) || 0
  }));

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

const updateInnovator = catchAsync(async (req, res, next) => {
  const { innovatorId } = req.params;

  const user = await User.findById(innovatorId);
  if (!user || user.role !== 'INNOVATOR') {
    return next(new AppError('Innovator not found', 404));
  }

  const allowedFields = [
    'enterpriseName', 'startDate', 'links',
    'addressLine1', 'addressLine2',
    'district', 'state', 'description'
  ];
  const updates = {};
  allowedFields.forEach(f => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  if (req.body.fullName !== undefined) {
    await User.findByIdAndUpdate(innovatorId, { fullName: req.body.fullName });
  }

  if (req.file) {
    const innovatorUser = await User.findById(innovatorId).select('profilePicture').lean();
    if (innovatorUser?.profilePicture) deleteFile(innovatorUser.profilePicture).catch(() => {});
    const uploadResult = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, `users/${innovatorId}/profile-picture`);
    await User.findByIdAndUpdate(innovatorId, { profilePicture: uploadResult.url });
  }

  const profile = await InnovatorProfile.findOneAndUpdate(
    { userId: innovatorId },
    updates,
    { new: true, runValidators: true }
  );

  if (!profile) {
    return next(new AppError('Innovator profile not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Innovator updated successfully',
    data: { profile }
  });
});

const getPendingInnovators = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Only users who completed profile (profile-first — excludes incomplete registrations)
  const pendingUserIds = await User.find({ status: 'PENDING', role: 'INNOVATOR', editRequested: { $ne: true } }).distinct('_id');

  const [profiles, total] = await Promise.all([
    InnovatorProfile.find({ userId: { $in: pendingUserIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    InnovatorProfile.countDocuments({ userId: { $in: pendingUserIds } })
  ]);

  const userIds = profiles.map(p => p.userId);
  const users = await User.find({ _id: { $in: userIds } }).select('-passwordHash').lean();
  const userMap = new Map(users.map(u => [u._id.toString(), u]));

  const innovators = profiles.map(profile => ({
    ...userMap.get(profile.userId.toString()),
    profile
  }));

  res.status(200).json({
    status: 'success',
    data: {
      innovators,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    }
  });
});

const approveInnovator = catchAsync(async (req, res, next) => {
  const { innovatorId } = req.params;

  const user = await User.findById(innovatorId);
  if (!user || user.role !== 'INNOVATOR') return next(new AppError('Innovator not found', 404));
  if (user.status === 'APPROVED') return next(new AppError('Innovator is already approved', 400));

  user.status = 'APPROVED';
  user.approvedAt = new Date();
  await user.save();

  const notificationsSent = await sendApprovalNotification(user);

  res.status(200).json({
    status: 'success',
    message: 'Innovator approved successfully',
    data: {
      user: { id: user._id, email: user.email, phone: user.phone, fullName: user.fullName, role: user.role, status: user.status },
      notificationsSent
    }
  });
});

const rejectInnovator = catchAsync(async (req, res, next) => {
  const { innovatorId } = req.params;
  const { reason } = req.body;

  const user = await User.findById(innovatorId);
  if (!user || user.role !== 'INNOVATOR') return next(new AppError('Innovator not found', 404));
  if (user.status === 'REJECTED') return next(new AppError('Innovator is already rejected', 400));

  user.status = 'REJECTED';
  await user.save();

  const notificationsSent = await sendRejectionNotification(user, reason);

  res.status(200).json({
    status: 'success',
    message: 'Innovator rejected successfully',
    data: {
      user: { id: user._id, email: user.email, phone: user.phone, fullName: user.fullName, role: user.role, status: user.status },
      rejectionReason: reason || null,
      notificationsSent
    }
  });
});


const requestEditInnovator = catchAsync(async (req, res, next) => {
  const { innovatorId } = req.params;
  const { reason } = req.body;

  const user = await User.findById(innovatorId)
    .select('_id fullName phone email role status isPhoneUser isPhoneVerified isEmailUser isEmailVerified isGoogleUser editRequested editRequestReason');
  if (!user || user.role !== 'INNOVATOR') return next(new AppError('Innovator not found', 404));
  if (user.status !== 'PENDING') return next(new AppError('Edit can only be requested for pending users', 400));

  user.editRequested = true;
  user.editRequestReason = reason || '';
  await user.save();

  try {
    await sendRequestEditNotification(user, reason, 'Profile', user.fullName);
  } catch (e) {
    console.error('Failed to send request-edit notification:', e);
  }

  res.status(200).json({
    status: 'success',
    message: 'Edit requested successfully',
    data: { user: { id: user._id, fullName: user.fullName, editRequested: user.editRequested } }
  });
});

module.exports = {
  getApprovedInnovators,
  getInnovatorDetails,
  getInnovatorInnovations,
  updateInnovator,
  getPendingInnovators,
  approveInnovator,
  rejectInnovator,
  requestEditInnovator,
};
