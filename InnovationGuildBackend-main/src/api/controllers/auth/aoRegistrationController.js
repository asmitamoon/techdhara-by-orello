const User = require('../../../models/User');
const AoProfile = require('../../../models/AoProfile');
const NodalOrgProfile = require('../../../models/NodalOrgProfile');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { sendPendingAoNotification } = require('../../../services/notification/no/aoApprovalNotification');
const { sendRegistrationConfirmation } = require('../../../services/notification/common/registrationNotification');

const completeAoRegistration = catchAsync(async (req, res, next) => {
  const {
    orgName,
    nodalOrg,
    orgType,
    orgTypeOther,
    streamOfWork,
    streamOfWorkOther,
    pocName,
    village,
    district,
    state,
    website
  } = req.body;

  if (req.user.role !== 'AO') {
    return next(new AppError('Only AO users can access this endpoint', 403));
  }

  const existingProfile = await AoProfile.findOne({ userId: req.user._id });
  if (existingProfile) {
    return next(new AppError('AO profile already exists', 400));
  }

  const nodalOrgUser = await User.findById(nodalOrg);
  if (!nodalOrgUser || nodalOrgUser.role !== 'NO') {
    return next(new AppError('Nodal Organization not found', 404));
  }

  if (nodalOrgUser.status !== 'APPROVED') {
    return next(new AppError('Selected Nodal Organization is not approved', 400));
  }

  const aoProfileData = {
    userId: req.user._id,
    orgName,
    nodalOrg,
    orgType,
    streamOfWork,
    pocName,
    village,
    district,
    state,
    registrationType: 'SELF_REGISTERED'
  };

  if (website) aoProfileData.website = website;
  if (orgTypeOther) aoProfileData.orgTypeOther = orgTypeOther;
  if (streamOfWorkOther) aoProfileData.streamOfWorkOther = streamOfWorkOther;

  const aoProfile = new AoProfile(aoProfileData);
  await aoProfile.save();
  await User.findByIdAndUpdate(req.user._id, { registrationComplete: true });

  try {
    await sendPendingAoNotification(nodalOrgUser, req.user, aoProfile);
  } catch (error) {
    console.error('Failed to send pending AO notification:', error.message);
  }

  sendRegistrationConfirmation(req.user).catch(err =>
    console.error('Failed to send AO registration confirmation:', err.message)
  );

  res.status(201).json({
    status: 'success',
    message: 'AO registration completed successfully. Awaiting approval from Nodal Organization.',
    data: {
      user: {
        id: req.user._id,
        email: req.user.email,
        phone: req.user.phone,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
        status: req.user.status
      },
      aoProfile: {
        id: aoProfile._id,
        orgName: aoProfile.orgName,
        location: `${aoProfile.village}, ${aoProfile.district}, ${aoProfile.state}`,
        orgType: aoProfile.orgType,
        registrationType: aoProfile.registrationType
      }
    }
  });
});

const getAoProfile = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'AO') {
    return next(new AppError('Only AO users can access this endpoint', 403));
  }

  const aoProfile = await AoProfile.findOne({ userId: req.user._id });

  if (!aoProfile) {
    return next(new AppError('AO profile not found', 404));
  }

  const nodalOrgProfile = aoProfile.nodalOrg
    ? await NodalOrgProfile.findOne({ userId: aoProfile.nodalOrg }).select('orgName').lean()
    : null;

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: req.user._id,
        email: req.user.email,
        phone: req.user.phone,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
        status: req.user.status
      },
      aoProfile,
      nodalOrgName: nodalOrgProfile?.orgName || null
    }
  });
});

module.exports = {
  completeAoRegistration,
  getAoProfile
};
