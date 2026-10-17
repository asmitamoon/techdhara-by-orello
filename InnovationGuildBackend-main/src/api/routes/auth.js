const express = require('express');
const {
  googleLogin,
  googleCallback,
} = require('../controllers/auth/googleController');
const {
  register,
  verifyEmail,
  login,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  resendOTP
} = require('../controllers/auth/emailController');
const {
  mobileLogin,
  verifyMobile,
  resendMobileOTP
} = require('../controllers/auth/mobileController');
const {
  refreshToken,
  logout,
  logoutAll
} = require('../controllers/auth/refreshController');
const { getMe } = require('../controllers/auth/meController');
const {
  completeVleRegistration,
  getVleProfile
} = require('../controllers/auth/vleRegistrationController');
const {
  completeAoRegistration,
  getAoProfile
} = require('../controllers/auth/aoRegistrationController');
const {
  completeInnovatorRegistration,
  getInnovatorProfile
} = require('../controllers/auth/innovatorRegistrationController');
const {
  completeNodalOrgRegistration,
  getNodalOrgProfile
} = require('../controllers/auth/nodalOrgRegistrationController');
const {
  completeGeneralUserRegistration,
  getGeneralUserProfile
} = require('../controllers/auth/generalUserRegistrationController');
const {
  uploadProfileImage,
  deleteProfileImage,
  getProfileImage
} = require('../controllers/auth/profileImageController');
const { authenticate } = require('../middlewares/auth');
const { otpSendLimiter, otpVerifyLimiter, loginLimiter } = require('../middlewares/rateLimiter');
const { uploadSingle } = require('../middlewares/upload');
const { validate, validateFormData } = require('../middlewares/validate');
const {
  registerSchema,
  loginSchema,
  mobileLoginSchema,
  verifyOTPSchema,
  verifyResetOTPSchema,
  mobileVerifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendOTPSchema
} = require('../../validators/authValidation');
const {
  vleRegistrationSchema,
  aoRegistrationSchema,
  innovatorRegistrationSchema,
  nodalOrgRegistrationSchema,
  generalUserRegistrationSchema
} = require('../../validators/userValidation');

const router = express.Router();

//Email auth routes
router.post('/register', otpSendLimiter, validate(registerSchema), register);
router.post('/verify-email', otpVerifyLimiter, validate(verifyOTPSchema), verifyEmail);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/forgot-password', otpSendLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/verify-reset-otp', otpVerifyLimiter, validate(verifyResetOTPSchema), verifyResetOTP);
router.post('/reset-password', otpVerifyLimiter, validate(resetPasswordSchema), resetPassword);
router.post('/resend-otp', otpSendLimiter, validate(resendOTPSchema), resendOTP);

// Mobile auth routes
router.post('/mobile-login', otpSendLimiter, validate(mobileLoginSchema), mobileLogin);
router.post('/mobile-verify', otpVerifyLimiter, validate(mobileVerifySchema), verifyMobile);
router.post('/resend-mobile-otp', otpSendLimiter, validate(resendOTPSchema), resendMobileOTP);

// Token management routes
router.get('/me', authenticate, getMe);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/logout-all', logoutAll);

// Google OAuth routes
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

// VLE registration routes
router.post('/vle/complete-registration', authenticate, validateFormData(vleRegistrationSchema), completeVleRegistration);
router.get('/vle/profile', authenticate, getVleProfile);

// AO registration routes
router.post('/ao/complete-registration', authenticate, validateFormData(aoRegistrationSchema), completeAoRegistration);
router.get('/ao/profile', authenticate, getAoProfile);

// Innovator registration routes
router.post('/innovator/complete-registration', authenticate, validateFormData(innovatorRegistrationSchema), completeInnovatorRegistration);
router.get('/innovator/profile', authenticate, getInnovatorProfile);

// Nodal Organization registration routes
router.post('/nodal-org/complete-registration', authenticate, validateFormData(nodalOrgRegistrationSchema), completeNodalOrgRegistration);
router.get('/nodal-org/profile', authenticate, getNodalOrgProfile);

// General User registration routes
router.post('/general-user/complete-registration', authenticate, validate(generalUserRegistrationSchema), completeGeneralUserRegistration);
router.get('/general-user/profile', authenticate, getGeneralUserProfile);

// Profile image management routes (all authenticated users)
router.post('/profile-image', authenticate, uploadSingle('profileImage'), uploadProfileImage);
router.delete('/profile-image', authenticate, deleteProfileImage);
router.get('/profile-image', authenticate, getProfileImage);

module.exports = router;