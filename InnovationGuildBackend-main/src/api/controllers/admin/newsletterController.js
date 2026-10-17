const NewsletterSubscription = require('../../../models/NewsletterSubscription');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');

const getAllSubscriptions = catchAsync(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const subscriptions = await NewsletterSubscription.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('email createdAt')
    .lean();

  const total = await NewsletterSubscription.countDocuments();

  res.status(200).json({
    status: 'success',
    message: 'Newsletter subscriptions retrieved successfully',
    data: {
      subscriptions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

const deleteSubscription = catchAsync(async (req, res, next) => {
  const { subscriptionId } = req.params;

  const subscription = await NewsletterSubscription.findById(subscriptionId);

  if (!subscription) {
    return next(new AppError('Newsletter subscription not found', 404));
  }

  await NewsletterSubscription.findByIdAndDelete(subscriptionId);

  res.status(200).json({
    status: 'success',
    message: 'Newsletter subscription deleted successfully',
    data: null
  });
});

const exportSubscriptions = catchAsync(async (req, res, next) => {
  const subscriptions = await NewsletterSubscription.find()
    .sort({ createdAt: -1 })
    .select('email createdAt')
    .lean();

  if (subscriptions.length === 0) {
    return next(new AppError('No subscriptions found to export', 404));
  }

  const csvRows = ['Email,Subscribed At'];
  subscriptions.forEach(sub => {
    csvRows.push([
      sub.email,
      sub.createdAt ? new Date(sub.createdAt).toISOString() : ''
    ].join(','));
  });

  res.header('Content-Type', 'text/csv');
  res.header('Content-Disposition', `attachment; filename=newsletter-subscriptions-${Date.now()}.csv`);
  res.status(200).send(csvRows.join('\n'));
});

module.exports = {
  getAllSubscriptions,
  deleteSubscription,
  exportSubscriptions
};
