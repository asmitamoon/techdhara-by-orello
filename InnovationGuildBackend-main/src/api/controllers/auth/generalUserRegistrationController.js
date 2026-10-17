const User = require('../../../models/User');
const GeneralUserProfile = require('../../../models/GeneralUserProfile');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { sendRegistrationConfirmation } = require('../../../services/notification/common/registrationNotification');

const completeGeneralUserRegistration = catchAsync(async (req, res, next) => {
  const { fullName, mobile, age, gender, state, district, village } = req.body;

  if (req.user.role !== 'GENERAL_USER') {
    return next(new AppError('Only General Users can access this endpoint', 403));
  }

  const existingProfile = await GeneralUserProfile.findOne({ userId: req.user._id });
  if (existingProfile) {
    return next(new AppError('General User profile already exists', 400));
  }

  const user = await User.findById(req.user._id);
  user.fullName = fullName;
  user.registrationComplete = true;
  user.status = 'APPROVED';
  user.approvedAt = new Date();
  await user.save();

  const generalUserProfile = new GeneralUserProfile({
    userId: req.user._id,
    mobile,
    age,
    gender,
    state,
    district,
    village
  });
  await generalUserProfile.save();

  sendRegistrationConfirmation(req.user).catch(err =>
    console.error('Failed to send general user registration confirmation:', err.message)
  );

  res.status(201).json({
    status: 'success',
    message: 'General User registration completed successfully',
    data: {
      profile: {
        id: generalUserProfile._id,
        fullName: user.fullName,
        mobile: generalUserProfile.mobile,
        age: generalUserProfile.age,
        gender: generalUserProfile.gender,
        location: `${generalUserProfile.village}, ${generalUserProfile.district}, ${generalUserProfile.state}`
      },
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        registrationComplete: true
      }
    }
  });
});

const getGeneralUserProfile = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'GENERAL_USER') {
    return next(new AppError('Only General Users can access this endpoint', 403));
  }

  const generalUserProfile = await GeneralUserProfile.findOne({ userId: req.user._id });
  if (!generalUserProfile) {
    return next(new AppError('General User profile not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: req.user._id,
        email: req.user.email,
        phone: req.user.phone,
        fullName: req.user.fullName,
        role: req.user.role,
        status: req.user.status
      },
      generalUserProfile
    }
  });
});

module.exports = {
  completeGeneralUserRegistration,
  getGeneralUserProfile
};
