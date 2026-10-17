const ServiceRequest = require('../../../models/ServiceRequest');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { sendServiceRequestSubmitted } = require('../../../services/notification/admin/serviceRequestNotification');

const createServiceRequest = catchAsync(async (req, res, next) => {
  const serviceRequest = new ServiceRequest({
    ...req.body,
    postedBy: req.user._id,
    status: 'DRAFT'
  });

  await serviceRequest.save();

  res.status(201).json({
    status: 'success',
    message: 'Service request created successfully as DRAFT',
    data: {
      serviceRequest
    }
  });
});

const getMyServiceRequests = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;

  const filter = { postedBy: req.user._id };
  if (status) {
    filter.status = status.toUpperCase();
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const serviceRequests = await ServiceRequest.find(filter)
    .sort({ [sortBy]: sortOrder })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await ServiceRequest.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      serviceRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const getServiceRequestDetails = catchAsync(async (req, res, next) => {
  const { serviceRequestId } = req.params;

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);

  if (!serviceRequest) {
    return next(new AppError('Service request not found', 404));
  }

  if (serviceRequest.postedBy.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only view your own service requests', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      serviceRequest
    }
  });
});

const updateServiceRequest = catchAsync(async (req, res, next) => {
  const { serviceRequestId } = req.params;

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);

  if (!serviceRequest) {
    return next(new AppError('Service request not found', 404));
  }

  if (serviceRequest.postedBy.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only update your own service requests', 403));
  }

  if (serviceRequest.status === 'PUBLISHED') {
    return next(new AppError('Cannot edit published service requests. Please contact admin.', 400));
  }

  const allowedUpdates = [
    'unitType', 'techName', 'techSpecs', 'techCompany', 'cost',
    'ownership', 'individualBusinessPlan', 'challenges', 'photosLink'
  ];

  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      serviceRequest[key] = req.body[key];
    }
  });

  await serviceRequest.save();

  res.status(200).json({
    status: 'success',
    message: 'Service request updated successfully',
    data: {
      serviceRequest
    }
  });
});

const deleteServiceRequest = catchAsync(async (req, res, next) => {
  const { serviceRequestId } = req.params;

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);

  if (!serviceRequest) {
    return next(new AppError('Service request not found', 404));
  }

  if (serviceRequest.postedBy.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only delete your own service requests', 403));
  }

  if (serviceRequest.status === 'PUBLISHED') {
    return next(new AppError('Cannot delete published service requests. Please contact admin.', 400));
  }

  await ServiceRequest.findByIdAndDelete(serviceRequestId);

  res.status(200).json({
    status: 'success',
    message: 'Service request deleted successfully'
  });
});

const submitForApproval = catchAsync(async (req, res, next) => {
  const { serviceRequestId } = req.params;

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);

  if (!serviceRequest) {
    return next(new AppError('Service request not found', 404));
  }

  if (serviceRequest.postedBy.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only submit your own service requests', 403));
  }

  if (serviceRequest.status !== 'DRAFT') {
    return next(new AppError(`Cannot submit service request with status ${serviceRequest.status}`, 400));
  }

  serviceRequest.status = 'PUBLISHED';
  await serviceRequest.save();

  sendServiceRequestSubmitted(req.user, serviceRequest).catch(() => {});

  res.status(200).json({
    status: 'success',
    message: 'Service request published',
    data: {
      serviceRequest
    }
  });
});

module.exports = {
  createServiceRequest,
  getMyServiceRequests,
  getServiceRequestDetails,
  updateServiceRequest,
  deleteServiceRequest,
  submitForApproval
};
