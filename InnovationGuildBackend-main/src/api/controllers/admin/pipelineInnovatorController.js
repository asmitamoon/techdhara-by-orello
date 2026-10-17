const PipelineInnovator = require('../../../models/PipelineInnovator');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');

const getAllPipelineInnovators = catchAsync(async (req, res, next) => {
  const { search, state, district, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;

  const filter = {};
  if (state) filter.state = { $regex: state, $options: 'i' };
  if (district) filter.district = { $regex: district, $options: 'i' };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { enterprise: { $regex: search, $options: 'i' } },
      { emailId: { $regex: search, $options: 'i' } },
      { district: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const [innovators, total] = await Promise.all([
    PipelineInnovator.find(filter)
      .populate('addedBy', 'fullName email role')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    PipelineInnovator.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      innovators,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const createPipelineInnovator = catchAsync(async (req, res, next) => {
  const { name, enterprise, emailId, mobile, state, district, link } = req.body;

  if (!name || !enterprise || !emailId || !mobile || !state || !district) {
    return next(new AppError('name, enterprise, emailId, mobile, state, and district are required', 400));
  }

  const innovator = await PipelineInnovator.create({
    name,
    enterprise,
    emailId,
    mobile,
    state,
    district,
    link: link || '',
    addedBy: req.user._id
  });

  res.status(201).json({
    status: 'success',
    message: 'Pipeline innovator added successfully',
    data: {
      innovator
    }
  });
});

const getPipelineInnovatorDetails = catchAsync(async (req, res, next) => {
  const { innovatorId } = req.params;

  const innovator = await PipelineInnovator.findById(innovatorId)
    .populate('addedBy', 'fullName email role')
    .lean();

  if (!innovator) {
    return next(new AppError('Pipeline innovator not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      innovator
    }
  });
});

const updatePipelineInnovator = catchAsync(async (req, res, next) => {
  const { innovatorId } = req.params;

  const innovator = await PipelineInnovator.findById(innovatorId);

  if (!innovator) {
    return next(new AppError('Pipeline innovator not found', 404));
  }

  const allowedUpdates = ['name', 'enterprise', 'emailId', 'mobile', 'state', 'district', 'link'];
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      innovator[field] = req.body[field];
    }
  });

  await innovator.save();

  res.status(200).json({
    status: 'success',
    message: 'Pipeline innovator updated successfully',
    data: {
      innovator
    }
  });
});

const deletePipelineInnovator = catchAsync(async (req, res, next) => {
  const { innovatorId } = req.params;

  const innovator = await PipelineInnovator.findByIdAndDelete(innovatorId);

  if (!innovator) {
    return next(new AppError('Pipeline innovator not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Pipeline innovator deleted successfully',
    data: null
  });
});

module.exports = {
  getAllPipelineInnovators,
  createPipelineInnovator,
  getPipelineInnovatorDetails,
  updatePipelineInnovator,
  deletePipelineInnovator
};
