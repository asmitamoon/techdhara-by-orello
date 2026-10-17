const catchAsync = require('../../../utils/catchAsync');
const InnovatorProfile = require('../../../models/InnovatorProfile');

const getMe = catchAsync(async (req, res, next) => {
  const user = req.user;

  const userData = {
    id: user._id,
    email: user.email,
    phone: user.phone,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
    profilePicture: user.profilePicture,
    registrationComplete: user.registrationComplete,
  };

  if (user.role === 'INNOVATOR') {
    const profile = await InnovatorProfile.findOne({ userId: user._id }).select('links').lean();
    if (profile?.links) userData.links = profile.links;
  }

  res.status(200).json({ status: 'success', data: { user: userData } });
});

module.exports = { getMe };
