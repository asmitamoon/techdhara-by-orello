const User = require('../../../models/User');
const AoProfile = require('../../../models/AoProfile');
const NodalOrgProfile = require('../../../models/NodalOrgProfile');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { sendAoApprovalNotification, sendAoRejectionNotification } = require('../../../services/notification/no/aoApprovalNotification');
const { broadcastNewAoApproved } = require('../../../services/notification/common/broadcastNotification');
const { sendRequestEditNotification } = require('../../../services/notification/admin/requestEditNotification');

const getPendingAos = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;

  if (req.user.role !== 'NO' || req.user.status !== 'APPROVED') {
    return next(new AppError('Only approved Nodal Organizations can access this endpoint', 403));
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const pendingUserIds = await User.find({ status: 'PENDING', editRequested: { $ne: true } }).distinct('_id');

  const profileFilter = {
    nodalOrg: req.user._id,
    userId: { $in: pendingUserIds },
  };

  const [aoProfiles, total] = await Promise.all([
    AoProfile.find(profileFilter)
      .select('userId orgName district state')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    AoProfile.countDocuments(profileFilter),
  ]);

  const userIds = aoProfiles.map(p => p.userId);
  const users = await User.find({ _id: { $in: userIds } }).select('_id fullName').lean();
  const userMap = new Map(users.map(u => [u._id.toString(), u]));

  const pendingAos = aoProfiles
    .map(profile => {
      const user = userMap.get(profile.userId.toString());
      if (!user) return null;
      return {
        userId: user._id,
        fullName: user.fullName,
        orgName: profile.orgName,
        stateCode: profile.state,
        districtCode: profile.district,
      };
    })
    .filter(ao => ao !== null);

  res.status(200).json({
    status: 'success',
    data: {
      pendingAos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

const getAoDetails = catchAsync(async (req, res, next) => {
  const { aoId } = req.params;

  if (req.user.role !== 'NO' || req.user.status !== 'APPROVED') {
    return next(new AppError('Only approved Nodal Organizations can access this endpoint', 403));
  }

  const user = await User.findById(aoId);
  if (!user || user.role !== 'AO') {
    return next(new AppError('AO user not found', 404));
  }

  const aoProfile = await AoProfile.findOne({ userId: aoId });
  if (!aoProfile) {
    return next(new AppError('AO profile not found', 404));
  }

  if (aoProfile.nodalOrg.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to view this AO', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      },
      aoProfile
    }
  });
});

const approveAo = catchAsync(async (req, res, next) => {
  const { aoId } = req.params;

  if (req.user.role !== 'NO' || req.user.status !== 'APPROVED') {
    return next(new AppError('Only approved Nodal Organizations can access this endpoint', 403));
  }

  const user = await User.findById(aoId);
  if (!user || user.role !== 'AO') {
    return next(new AppError('AO user not found', 404));
  }

  const aoProfile = await AoProfile.findOne({ userId: aoId });
  if (!aoProfile) {
    return next(new AppError('AO profile not found', 404));
  }

  if (aoProfile.nodalOrg.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to approve this AO', 403));
  }

  if (user.status === 'APPROVED') {
    return next(new AppError('AO is already approved', 400));
  }

  if (user.status !== 'PENDING') {
    return next(new AppError('Only pending AOs can be approved', 400));
  }

  user.status = 'APPROVED';
  user.approvedAt = new Date();
  await user.save();

  const nodalOrgProfile = await NodalOrgProfile.findOne({ userId: req.user._id });
  if (nodalOrgProfile) {
    nodalOrgProfile.numberOfAffiliatedOrgs = (nodalOrgProfile.numberOfAffiliatedOrgs || 0) + 1;
    await nodalOrgProfile.save();
  }

  try {
    await sendAoApprovalNotification(user, req.user);
  } catch (error) {
    console.error('Failed to send AO approval notification:', error.message);
  }

  setImmediate(() =>
    broadcastNewAoApproved(user, aoProfile).catch(err =>
      console.error('Failed to broadcast new AO approved:', err.message)
    )
  );

  res.status(200).json({
    status: 'success',
    message: 'AO approved successfully',
    data: {
      userId: user._id,
      status: user.status,
      orgName: aoProfile.orgName
    }
  });
});

const rejectAo = catchAsync(async (req, res, next) => {
  const { aoId } = req.params;
  const { reason } = req.body;

  if (req.user.role !== 'NO' || req.user.status !== 'APPROVED') {
    return next(new AppError('Only approved Nodal Organizations can access this endpoint', 403));
  }

  const user = await User.findById(aoId);
  if (!user || user.role !== 'AO') {
    return next(new AppError('AO user not found', 404));
  }

  const aoProfile = await AoProfile.findOne({ userId: aoId });
  if (!aoProfile) {
    return next(new AppError('AO profile not found', 404));
  }

  if (aoProfile.nodalOrg.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to reject this AO', 403));
  }

  if (user.status === 'REJECTED') {
    return next(new AppError('AO is already rejected', 400));
  }

  if (user.status !== 'PENDING') {
    return next(new AppError('Only pending AOs can be rejected', 400));
  }

  user.status = 'REJECTED';
  await user.save();

  try {
    await sendAoRejectionNotification(user, req.user, reason);
  } catch (error) {
    console.error('Failed to send AO rejection notification:', error.message);
  }

  res.status(200).json({
    status: 'success',
    message: 'AO rejected successfully',
    data: {
      userId: user._id,
      status: user.status,
      orgName: aoProfile.orgName,
      reason
    }
  });
});

const requestEditAo = catchAsync(async (req, res, next) => {
  const { aoId } = req.params;
  const { reason } = req.body;

  const aoProfile = await AoProfile.findOne({ userId: aoId });
  if (!aoProfile) return next(new AppError('AO not found', 404));

  if (aoProfile.nodalOrg.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to request edit for this AO', 403));
  }

  const user = await User.findById(aoId)
    .select('_id fullName phone email role status isPhoneUser isPhoneVerified isEmailUser isEmailVerified isGoogleUser editRequested editRequestReason');
  if (!user || user.role !== 'AO') return next(new AppError('AO user not found', 404));
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
  getPendingAos,
  getAoDetails,
  approveAo,
  rejectAo,
  requestEditAo
};
