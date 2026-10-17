const ContactView = require('../../../models/ContactView');
const User = require('../../../models/User');
const catchAsync = require('../../../utils/catchAsync');

const getAllContactViews = catchAsync(async (req, res, next) => {
  const { search, role, from, to, page = 1, limit = 50 } = req.query;
  const skip = (page - 1) * parseInt(limit);

  const query = {};

  if (search) {
    const users = await User.find({
      $or: [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }).select('_id');

    const userIds = users.map(u => u._id);
    query.$or = [
      { viewerId: { $in: userIds } },
      { viewedUserId: { $in: userIds } }
    ];
  }

  if (role) {
    const roleUsers = await User.find({ role: role.toUpperCase() }).select('_id');
    query.viewerId = { $in: roleUsers.map(u => u._id) };
  }

  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }

  const [result = {}] = await ContactView.aggregate([
    { $match: query },
    {
      $lookup: {
        from: 'users',
        localField: 'viewerId',
        foreignField: '_id',
        as: '_viewer'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'viewedUserId',
        foreignField: '_id',
        as: '_viewedUser'
      }
    },
    { $match: { '_viewer.0': { $exists: true }, '_viewedUser.0': { $exists: true } } },
    {
      $facet: {
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: parseInt(limit) },
          {
            $project: {
              createdAt: 1,
              viewer: { $arrayElemAt: ['$_viewer', 0] },
              viewedUser: { $arrayElemAt: ['$_viewedUser', 0] }
            }
          }
        ],
        totalCount: [{ $count: 'count' }]
      }
    }
  ]);

  const views = result.data ?? [];
  const total = result.totalCount?.[0]?.count ?? 0;

  res.status(200).json({
    status: 'success',
    message: 'Contact views retrieved successfully',
    data: {
      views: views.map(view => ({
        viewer: {
          userId: view.viewer._id,
          fullName: view.viewer.fullName,
          role: view.viewer.role,
          profilePicture: view.viewer.profilePicture || null
        },
        viewedUser: {
          userId: view.viewedUser._id,
          fullName: view.viewedUser.fullName,
          role: view.viewedUser.role,
          profilePicture: view.viewedUser.profilePicture || null
        },
        createdAt: view.createdAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)) || 0,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

module.exports = {
  getAllContactViews
};
