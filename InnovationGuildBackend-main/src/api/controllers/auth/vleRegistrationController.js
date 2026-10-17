const VleProfile = require('../../../models/VleProfile');
const User = require('../../../models/User');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { sendRegistrationConfirmation } = require('../../../services/notification/common/registrationNotification');
const { sendNewUserRegisteredToAdmin } = require('../../../services/notification/admin/newRegistrationNotification');
const { sendVleRegisteredConfirmation } = require('../../../services/notification/ao/vleActivityNotification');

const completeVleRegistration = catchAsync(async (req, res, next) => {
  const {
    fullName,
    mobile,
    age,
    gender,
    village,
    district,
    state,
    affiliatedOrg,
    mainLivelihood,
    livelihoodExperience,
    otherLivelihoods,
    yearlyRevenue,
    qualification,
    languages,
    hasMachineExp,
    trainingsTaken,
    machineExpYears,
    machinesWorkedWith,
    vleCategory,
    vleCategoryOther,
    supportAssessment
  } = req.body;

  if (req.user.role !== 'VLE') {
    return next(new AppError('Only VLE users can access this endpoint', 403));
  }

  const existingProfile = await VleProfile.findOne({ userId: req.user._id });
  if (existingProfile) {
    return next(new AppError('VLE profile already exists', 400));
  }

  req.user.fullName = fullName;
  req.user.registrationComplete = true;
  await req.user.save();

  const vleProfileData = {
    userId: req.user._id,
    mobile,
    age,
    gender,
    village,
    district,
    state,
    mainLivelihood,
    livelihoodExperience,
    languages,
    hasMachineExp,
    machineExpYears: machineExpYears || 0,
    vleCategory
  };

  if (affiliatedOrg) vleProfileData.affiliatedOrg = affiliatedOrg;
  if (otherLivelihoods) vleProfileData.otherLivelihoods = otherLivelihoods;
  if (yearlyRevenue) vleProfileData.yearlyRevenue = yearlyRevenue;
  if (qualification) vleProfileData.qualification = qualification;
  if (trainingsTaken) vleProfileData.trainingsTaken = trainingsTaken;
  if (machinesWorkedWith) vleProfileData.machinesWorkedWith = machinesWorkedWith;
  if (vleCategoryOther) vleProfileData.vleCategoryOther = vleCategoryOther;
  if (supportAssessment && supportAssessment.length > 0) vleProfileData.supportAssessment = supportAssessment;

  const vleProfile = new VleProfile(vleProfileData);
  await vleProfile.save();

  sendRegistrationConfirmation(req.user).catch(err =>
    console.error('Failed to send VLE registration confirmation:', err.message)
  );

  if (vleProfile.affiliatedOrg) {
    User.findById(vleProfile.affiliatedOrg).then(aoUser => {
      if (aoUser) sendVleRegisteredConfirmation(aoUser, req.user).catch(() => {});
    }).catch(() => {});
  } else {
    sendNewUserRegisteredToAdmin(req.user).catch(() => {});
  }

  res.status(201).json({
    status: 'success',
    message: 'VLE registration completed successfully',
    data: {
      vleProfile: {
        id: vleProfile._id,
        fullName: req.user.fullName,
        location: `${vleProfile.village}, ${vleProfile.district}, ${vleProfile.state}`,
        category: vleProfile.vleCategory,
        supportAssessment: vleProfile.supportAssessment
      }
    }
  });
});

const getVleProfile = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'VLE') {
    return next(new AppError('Only VLE users can access this endpoint', 403));
  }

  const vleProfile = await VleProfile.findOne({ userId: req.user._id });

  if (!vleProfile) {
    return next(new AppError('VLE profile not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      fullName: req.user.fullName,
      vleProfile
    }
  });
});

module.exports = {
  completeVleRegistration,
  getVleProfile
};
