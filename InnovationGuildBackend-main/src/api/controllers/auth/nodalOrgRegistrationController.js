const User = require('../../../models/User');
const NodalOrgProfile = require('../../../models/NodalOrgProfile');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { sendNewNodalOrgRegisteredToAdmin } = require('../../../services/notification/admin/newRegistrationNotification');

const completeNodalOrgRegistration = catchAsync(async (req, res, next) => {
  const {
    orgName,
    hqState,
    orgType,
    operationalStates,
    website,
    description,
    hasRuralPrograms,
    hasTechIntegration,
    channels,
    potentialAoCount
  } = req.body;

  if (req.user.role !== 'NO') {
    return next(new AppError('Only Nodal Organization users can access this endpoint', 403));
  }

  const existingProfile = await NodalOrgProfile.findOne({ userId: req.user._id });
  if (existingProfile) {
    return next(new AppError('Nodal Organization profile already exists', 400));
  }

  const nodalOrgProfileData = {
    userId: req.user._id,
    orgName,
    hqState,
    orgType
  };

  if (operationalStates && operationalStates.length > 0) nodalOrgProfileData.operationalStates = operationalStates;
  if (website) nodalOrgProfileData.website = website;
  if (description) nodalOrgProfileData.description = description;
  if (hasRuralPrograms) nodalOrgProfileData.hasRuralPrograms = hasRuralPrograms;
  if (hasTechIntegration) nodalOrgProfileData.hasTechIntegration = hasTechIntegration;
  if (channels) nodalOrgProfileData.channels = channels;
  if (potentialAoCount) nodalOrgProfileData.potentialAoCount = potentialAoCount;

  const nodalOrgProfile = new NodalOrgProfile(nodalOrgProfileData);
  await nodalOrgProfile.save();
  await User.findByIdAndUpdate(req.user._id, { registrationComplete: true });

  sendNewNodalOrgRegisteredToAdmin(req.user, nodalOrgProfile).catch(() => {});

  res.status(201).json({
    status: 'success',
    message: 'Nodal Organization registration completed successfully. Your profile is pending admin approval.',
    data: {
      nodalOrgProfile: {
        id: nodalOrgProfile._id,
        orgName: nodalOrgProfile.orgName,
        orgType: nodalOrgProfile.orgType,
        hqState: nodalOrgProfile.hqState
      }
    }
  });
});

const getNodalOrgProfile = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'NO') {
    return next(new AppError('Only Nodal Organization users can access this endpoint', 403));
  }

  const nodalOrgProfile = await NodalOrgProfile.findOne({ userId: req.user._id });

  if (!nodalOrgProfile) {
    return next(new AppError('Nodal Organization profile not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      nodalOrgProfile
    }
  });
});

module.exports = {
  completeNodalOrgRegistration,
  getNodalOrgProfile
};
