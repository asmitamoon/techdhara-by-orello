const User = require('../../../models/User');
const RefreshToken = require('../../../models/RefreshToken');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');

const createAdmin = catchAsync(async (req, res, next) => {
  const { email, password, fullName } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  const adminUser = new User({
    email,
    passwordHash: password,
    isEmailUser: true,
    isEmailVerified: true,
    role: 'ADMIN',
    status: 'APPROVED',
    approvedAt: new Date(),
    fullName,
    registrationComplete: true
  });

  await adminUser.save();

  res.status(201).json({
    status: 'success',
    message: 'Admin user created successfully',
    data: {
      admin: {
        _id: adminUser._id,
        email: adminUser.email,
        fullName: adminUser.fullName,
        role: adminUser.role,
        status: adminUser.status,
        createdAt: adminUser.createdAt
      }
    }
  });
});

const getAllAdmins = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, search } = req.query;
  const skip = (page - 1) * limit;

  const filter = { role: 'ADMIN' };

  if (search) {
    filter.$or = [
      { email: { $regex: search, $options: 'i' } },
      { fullName: { $regex: search, $options: 'i' } }
    ];
  }

  const totalAdmins = await User.countDocuments(filter);

  const admins = await User.find(filter)
    .select('_id email fullName status createdAt lastLogin')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    status: 'success',
    results: admins.length,
    data: {
      admins,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalAdmins / limit),
        totalAdmins,
        limit: parseInt(limit)
      }
    }
  });
});

const getAdminDetails = catchAsync(async (req, res, next) => {
  const { adminId } = req.params;

  const admin = await User.findOne({ _id: adminId, role: 'ADMIN' })
    .select('_id email fullName status createdAt lastLogin updatedAt');

  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      admin: {
        _id: admin._id,
        email: admin.email,
        fullName: admin.fullName,
        status: admin.status,
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin,
        updatedAt: admin.updatedAt
      }
    }
  });
});

const deleteAdmin = catchAsync(async (req, res, next) => {
  const { adminId } = req.params;

  const admin = await User.findOne({ _id: adminId, role: 'ADMIN' });

  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }

  await RefreshToken.deleteMany({ userId: adminId });
  await User.findByIdAndDelete(adminId);

  res.status(200).json({
    status: 'success',
    message: 'Admin user deleted successfully',
    data: {
      deletedAdminId: adminId,
      deletedAt: new Date()
    }
  });
});

module.exports = {
  createAdmin,
  getAllAdmins,
  getAdminDetails,
  deleteAdmin
};
