const Notification = require('../../../models/Notification');
const catchAsync = require('../../../utils/catchAsync');
const { AppError } = require('../../../utils/errorHandler');

const getMyNotifications = catchAsync(async (req, res, next) => {
  const { isRead, page = 1, limit = 20 } = req.query;
  const userId = req.user._id;

  const filter = { recipient: userId };
  if (isRead !== undefined) {
    filter.isRead = isRead === 'true';
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

  res.status(200).json({
    status: 'success',
    data: {
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const markMyNotificationsAsRead = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read',
    data: { markedCount: result.modifiedCount }
  });
});

const deleteMyNotification = catchAsync(async (req, res, next) => {
  const { notificationId } = req.params;
  const userId = req.user._id;

  const notification = await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Notification deleted',
    data: null
  });
});

const clearMyNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const result = await Notification.deleteMany({ recipient: userId });
  res.status(200).json({
    status: 'success',
    message: 'All notifications cleared',
    data: { deletedCount: result.deletedCount }
  });
});

module.exports = {
  getMyNotifications,
  markMyNotificationsAsRead,
  deleteMyNotification,
  clearMyNotifications
};
