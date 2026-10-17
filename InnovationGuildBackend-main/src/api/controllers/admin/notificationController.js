const Notification = require('../../../models/Notification');
const catchAsync = require('../../../utils/catchAsync');
const { AppError } = require('../../../utils/errorHandler');

const getNotifications = catchAsync(async (req, res, next) => {
  const { isRead, page = 1, limit = 20 } = req.query;

  const filter = { recipient: null };
  if (isRead !== undefined) {
    filter.isRead = isRead === 'true';
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({ recipient: null, isRead: false });

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

const markAllAsRead = catchAsync(async (req, res, next) => {
  const result = await Notification.updateMany(
    { recipient: null, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read',
    data: { markedCount: result.modifiedCount }
  });
});

const deleteAllNotifications = catchAsync(async (req, res, next) => {
  const result = await Notification.deleteMany({ recipient: null });

  res.status(200).json({
    status: 'success',
    message: 'All notifications cleared',
    data: { deletedCount: result.deletedCount }
  });
});

const deleteNotification = catchAsync(async (req, res, next) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOneAndDelete({ _id: notificationId, recipient: null });

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Notification deleted',
    data: null
  });
});

module.exports = {
  getNotifications,
  markAllAsRead,
  deleteAllNotifications,
  deleteNotification
};
