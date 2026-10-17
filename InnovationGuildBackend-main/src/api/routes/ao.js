const express = require('express');
const { authenticate, restrictTo } = require('../middlewares/auth');
const {
  initiateVleRegistration,
  resendVleOTP,
  registerVle
} = require('../controllers/ao/vleManagementController');
const {
  createFieldReport,
  deleteFieldReport
} = require('../controllers/ao/fieldReportController');
const { validate, validateFormData } = require('../middlewares/validate');
const { uploadSingle } = require('../middlewares/upload');
const { aoInitiateVleRegistrationSchema, aoResendVleOtpSchema, aoVleRegistrationSchema } = require('../../validators/userValidation');
const { createFieldReportSchema } = require('../../validators/fieldReportValidation');

const router = express.Router();

router.use(authenticate);
router.use(restrictTo('AO'));

// affiliated organization vle registration
router.post('/initiate-vle-registration', validate(aoInitiateVleRegistrationSchema), initiateVleRegistration);
router.post('/resend-vle-otp', validate(aoResendVleOtpSchema), resendVleOTP);
router.post('/register-vle', uploadSingle('profilePic'), validateFormData(aoVleRegistrationSchema), registerVle);

// Field report write operations (AO-only — reading field reports is via /org/field-reports)
router.post('/pilots/:pilotId/field-reports', validate(createFieldReportSchema), createFieldReport);
router.delete('/field-reports/:reportId', deleteFieldReport);

module.exports = router;
