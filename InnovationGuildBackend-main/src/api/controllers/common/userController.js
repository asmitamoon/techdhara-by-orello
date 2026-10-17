const catchAsync = require('../../../utils/catchAsync');
const { AppError } = require('../../../utils/errorHandler');
const User = require('../../../models/User');
const Innovation = require('../../../models/Innovation');
const InnovationRequest = require('../../../models/InnovationRequest');
const VleProfile = require('../../../models/VleProfile');
const InnovatorProfile = require('../../../models/InnovatorProfile');
const AoProfile = require('../../../models/AoProfile');
const NodalOrgProfile = require('../../../models/NodalOrgProfile');
const GeneralUserProfile = require('../../../models/GeneralUserProfile');
const Pilot = require('../../../models/Pilot');

const getUserById = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const user = await User.findOne({ _id: userId, $or: [{ status: 'APPROVED' }, { _id: req.user._id }] })
    .select('fullName email phone profilePicture role').lean();
  if (!user) return next(new AppError('User not found', 404));

  let profile = null;
  if (user.role === 'VLE') {
    profile = await VleProfile.findOne({ userId: user._id })
      .select('mobile age gender village district state affiliatedOrg mainLivelihood livelihoodExperience qualification otherLivelihoods machineExpYears interestedPersonas trainings vleCategory vleCategoryOther vleStatus languages')
      .lean();
    if (profile?.affiliatedOrg && /^[a-f\d]{24}$/i.test(profile.affiliatedOrg)) {
      const aoProf = await AoProfile.findOne({ userId: profile.affiliatedOrg }).select('orgName').lean();
      profile = { ...profile, affiliatedOrg: aoProf?.orgName || '' };
    }
  } else if (user.role === 'INNOVATOR') {
    profile = await InnovatorProfile.findOne({ userId: user._id })
      .select('links district state enterpriseName startDate description')
      .lean();
  } else if (user.role === 'AO') {
    profile = await AoProfile.findOne({ userId: user._id })
      .select('website village district state orgType orgTypeOther streamOfWork streamOfWorkOther nodalOrg orgName pocName')
      .lean();
    if (profile?.nodalOrg) {
      const noProf = await NodalOrgProfile.findOne({ userId: profile.nodalOrg }).select('orgName').lean();
      profile = { ...profile, nodalOrg: noProf?.orgName || '' };
    }
  } else if (user.role === 'NO') {
    profile = await NodalOrgProfile.findOne({ userId: user._id })
      .select('website hqState orgType operationalStates description orgName')
      .lean();
  } else if (user.role === 'GENERAL_USER') {
    profile = await GeneralUserProfile.findOne({ userId: user._id })
      .select('mobile age gender village district state')
      .lean();
  }

  let implementedPilots = [];
  if (user.role === 'VLE') {
    implementedPilots = await Pilot.find({ vleId: user._id, status: 'IMPLEMENTED' })
      .populate('innovationId', 'innovationName')
      .lean();
  }

  res.status(200).json({ status: 'success', data: { user, profile: profile || null, implementedPilots } });
});

const getUserInnovations = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const innovations = await Innovation.find({ innovatorId: userId, status: 'PUBLISHED' })
    .sort({ createdAt: -1 })
    .limit(6)
    .select('innovationName description media innovatorId')
    .populate('innovatorId', 'fullName')
    .lean();
  res.status(200).json({ status: 'success', data: { innovations } });
});

const getUserProblems = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const problems = await InnovationRequest.find({ postedBy: userId, status: 'PUBLISHED' })
    .sort({ createdAt: -1 })
    .limit(6)
    .select('problemTitle problemDescription postedBy')
    .populate('postedBy', 'fullName')
    .lean();
  res.status(200).json({ status: 'success', data: { problems } });
});

module.exports = { getUserById, getUserInnovations, getUserProblems };
