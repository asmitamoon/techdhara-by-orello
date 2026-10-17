const SavedProfile = require('../../../models/SavedProfile');
const User = require('../../../models/User');
const VleProfile = require('../../../models/VleProfile');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');

const saveProfile = catchAsync(async (req, res, next) => {
  const { userId: savedUserId } = req.params;
  const userId = req.user._id;

  if (userId.toString() === savedUserId) {
    return next(new AppError('You cannot save your own profile', 400));
  }

  const targetUser = await User.findById(savedUserId);

  if (!targetUser) {
    return next(new AppError('User not found', 404));
  }

  if (targetUser.status !== 'APPROVED') {
    return next(new AppError('You can only save profiles of approved users', 400));
  }

  if (targetUser.role !== 'VLE') {
    return next(new AppError('You can only save VLE profiles', 400));
  }

  const existingSaved = await SavedProfile.findOne({ userId, savedUserId });

  if (existingSaved) {
    await existingSaved.populate('savedUserId', 'fullName role profilePicture');

    return res.status(200).json({
      status: 'success',
      message: 'Profile already saved',
      data: {
        savedProfile: existingSaved
      }
    });
  }

  const savedProfile = await SavedProfile.create({
    userId,
    savedUserId
  });

  await savedProfile.populate('savedUserId', 'fullName role profilePicture');

  res.status(201).json({
    status: 'success',
    message: 'Profile saved successfully',
    data: {
      savedProfile
    }
  });
});

const unsaveProfile = catchAsync(async (req, res, next) => {
  const { userId: savedUserId } = req.params;
  const userId = req.user._id;

  const savedProfile = await SavedProfile.findOneAndDelete({ userId, savedUserId });

  if (!savedProfile) {
    return next(new AppError('Saved profile not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Profile removed from saved list'
  });
});

const getMySavedProfiles = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { page = 1, limit = 20, search } = req.query;

  const query = { userId };

  const skip = (page - 1) * limit;

  let savedProfiles = await SavedProfile.find(query)
    .populate({
      path: 'savedUserId',
      select: 'fullName role profilePicture status'
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Enrich with VLE profile location and languages
  const userIds = savedProfiles.map(s => s.savedUserId?._id).filter(Boolean);
  const vleProfiles = await VleProfile.find({ userId: { $in: userIds } })
    .select('userId village district state languages');
  const vleMap = {};
  vleProfiles.forEach(p => { vleMap[p.userId.toString()] = p; });

  let enriched = savedProfiles.map(saved => {
    const obj = saved.toObject();
    if (obj.savedUserId?._id) {
      const vle = vleMap[obj.savedUserId._id.toString()];
      if (vle) {
        obj.savedUserId.location = [vle.village, vle.district, vle.state].filter(Boolean).join(', ');
        obj.savedUserId.languages = vle.languages?.join(', ') ?? '';
      }
    }
    return obj;
  });

  if (search) {
    const searchLower = search.toLowerCase();
    enriched = enriched.filter(saved =>
      saved.savedUserId &&
      saved.savedUserId.fullName?.toLowerCase().includes(searchLower)
    );
  }

  const totalCount = await SavedProfile.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: {
      savedProfiles: enriched,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

module.exports = {
  saveProfile,
  unsaveProfile,
  getMySavedProfiles
};
