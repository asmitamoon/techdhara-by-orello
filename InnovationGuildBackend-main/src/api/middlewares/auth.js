const { verifyAccessToken } = require('../../utils/jwt');
const { AppError } = require('../../utils/errorHandler');
const catchAsync = require('../../utils/catchAsync');
const User = require('../../models/User');

const authenticate = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired! Please log in again.', 401));
    }
    return next(new AppError('Invalid token. Please log in again!', 401));
  }

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  req.user = currentUser;
  next();
});

// Middleware to restrict access to specific roles
// Accepts an optional options object as last arg: restrictTo('ROLE', { allowPending: true })
const restrictTo = (...args) => {
  const options = typeof args[args.length - 1] === 'object' ? args.pop() : {};
  const roles = args;

  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN' && req.user.status !== 'APPROVED') {
      if (req.user.status === 'PENDING' && !options.allowPending) {
        return next(new AppError('Your account is pending approval. Please wait for admin verification.', 403));
      }
      if (req.user.status === 'REJECTED') {
        return next(new AppError('Your account has been rejected. Please contact admin for more information.', 403));
      }
      if (req.user.status === 'SUSPENDED') {
        return next(new AppError('Your account has been suspended. Please contact admin for details.', 403));
      }
      if (req.user.status === 'BANNED') {
        return next(new AppError('Your account has been permanently banned.', 403));
      }
    }

    next();
  };
};

const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPER_ADMIN') {
    return next(new AppError('Only Super Admins can perform this action', 403));
  }
  next();
};

module.exports = {
  authenticate,
  restrictTo,
  requireSuperAdmin
};