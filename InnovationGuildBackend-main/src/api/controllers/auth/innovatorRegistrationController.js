const User = require('../../../models/User');
const InnovatorProfile = require('../../../models/InnovatorProfile');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { sendRegistrationConfirmation } = require('../../../services/notification/common/registrationNotification');
const { sendNewUserRegisteredToAdmin } = require('../../../services/notification/admin/newRegistrationNotification');

const completeInnovatorRegistration = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const {
    fullName,
    enterpriseName,
    startDate,
    links,
    addressLine1,
    addressLine2,
    district,
    state,
    description
  } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.role !== 'INNOVATOR') {
      return next(new AppError('This endpoint is only for Innovators', 403));
    }

    const existingProfile = await InnovatorProfile.findOne({ userId });
    if (existingProfile) {
      return next(new AppError('Innovator profile already exists', 400));
    }

    user.fullName = fullName;
    user.registrationComplete = true;
    await user.save();

    const innovatorProfile = new InnovatorProfile({
      userId,
      enterpriseName: enterpriseName || 'NA',
      startDate,
      links,
      addressLine1,
      addressLine2,
      district,
      state,
      description
    });

    await innovatorProfile.save();

    sendRegistrationConfirmation(user).catch(err =>
      console.error('Failed to send innovator registration confirmation:', err.message)
    );
    sendNewUserRegisteredToAdmin(user).catch(() => {});

    res.status(201).json({
      status: 'success',
      message: 'Innovator registration completed successfully',
      data: {
        profile: {
          id: innovatorProfile._id,
          fullName: user.fullName,
          enterpriseName: innovatorProfile.enterpriseName,
          startDate: innovatorProfile.startDate,
          links: innovatorProfile.links,
          addressLine1: innovatorProfile.addressLine1,
          addressLine2: innovatorProfile.addressLine2,
          district: innovatorProfile.district,
          state: innovatorProfile.state,
          description: innovatorProfile.description,
          createdAt: innovatorProfile.createdAt
        },
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          fullName: user.fullName,
          role: user.role,
          profilePicture: user.profilePicture,
          registrationComplete: true
        }
      }
    });

  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

const getInnovatorProfile = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.role !== 'INNOVATOR') {
      return next(new AppError('This endpoint is only for Innovators', 403));
    }

    const innovatorProfile = await InnovatorProfile.findOne({ userId });
    if (!innovatorProfile) {
      return next(new AppError('Innovator profile not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        profile: {
          id: innovatorProfile._id,
          fullName: user.fullName,
          enterpriseName: innovatorProfile.enterpriseName,
          startDate: innovatorProfile.startDate,
          links: innovatorProfile.links,
          addressLine1: innovatorProfile.addressLine1,
          addressLine2: innovatorProfile.addressLine2,
          district: innovatorProfile.district,
          state: innovatorProfile.state,
          description: innovatorProfile.description,
          createdAt: innovatorProfile.createdAt,
          updatedAt: innovatorProfile.updatedAt
        },
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          fullName: user.fullName,
          role: user.role,
          profilePicture: user.profilePicture,
          registrationComplete: true
        }
      }
    });

  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

module.exports = {
  completeInnovatorRegistration,
  getInnovatorProfile
};
