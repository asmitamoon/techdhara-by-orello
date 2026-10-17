const ContactView = require('../../../models/ContactView');
const User = require('../../../models/User');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');

const viewContact = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  const viewerId = req.user._id;

  if (viewerId.toString() === userId) {
    return next(new AppError('You cannot view your own contact details', 400));
  }

  const viewedUser = await User.findById(userId).select('fullName role email phone status profilePicture');

  if (!viewedUser) {
    return next(new AppError('User not found', 404));
  }

  const viewer = await User.findById(viewerId).select('status role');

  const existingView = await ContactView.findOne({ viewerId, viewedUserId: userId });

  if (existingView) {
    return res.status(200).json({
      status: 'success',
      message: 'Contact already viewed',
      data: {
        alreadyViewed: true,
        user: {
          userId: viewedUser._id,
          fullName: viewedUser.fullName,
          profilePicture: viewedUser.profilePicture || null,
          contactDetails: { email: viewedUser.email, phone: viewedUser.phone }
        },
        viewedAt: existingView.createdAt
      }
    });
  }

  if (viewer.status !== 'APPROVED') {
    return next(new AppError('Your account must be approved to view contact details', 403));
  }

  if (viewedUser.status !== 'APPROVED') {
    return next(new AppError("This user's account is not approved", 403));
  }

  const TRACKABLE_ROLES = ['VLE', 'INNOVATOR'];
  let contactViewedAt = new Date();
  if (TRACKABLE_ROLES.includes(viewer.role) && TRACKABLE_ROLES.includes(viewedUser.role)) {
    const contactView = new ContactView({ viewerId, viewedUserId: userId });
    await contactView.save();
    contactViewedAt = contactView.createdAt;
  }

  res.status(200).json({
    status: 'success',
    message: 'Contact viewed successfully',
    data: {
      alreadyViewed: false,
      user: {
        userId: viewedUser._id,
        fullName: viewedUser.fullName,
        profilePicture: viewedUser.profilePicture || null,
        contactDetails: { email: viewedUser.email, phone: viewedUser.phone }
      },
      viewedAt: contactViewedAt
    }
  });
});

module.exports = {
  viewContact
};
