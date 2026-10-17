const express = require('express');
const { authenticate, restrictTo } = require('../middlewares/auth');
const {
  initiateAoRegistration,
  resendAoOTP,
  registerAo
} = require('../controllers/nodalOrg/aoRegistrationController');
const {
  getPendingAos,
  approveAo,
  rejectAo,
  requestEditAo
} = require('../controllers/nodalOrg/aoApprovalController');
const { getApprovedAos, getAoById, updateAo, getAoVles, getAoProblems, getAoServiceRequests } = require('../controllers/nodalOrg/aoManagementController');
const { validate, validateFormData } = require('../middlewares/validate');
const { uploadSingle } = require('../middlewares/upload');
const {
  nodalOrgInitiateAoRegistrationSchema,
  nodalOrgResendAoOtpSchema,
  nodalOrgAoRegistrationSchema,
  approveAoSchema,
  rejectAoSchema
} = require('../../validators/nodalOrgValidation');

const router = express.Router();

router.use(authenticate);
router.use(restrictTo('NO'));

// Nodal Org-Assisted AO Registration
router.post('/initiate-ao-registration', validate(nodalOrgInitiateAoRegistrationSchema), initiateAoRegistration);
router.post('/resend-ao-otp', validate(nodalOrgResendAoOtpSchema), resendAoOTP);
router.post('/register-ao', uploadSingle('logo'), validateFormData(nodalOrgAoRegistrationSchema), registerAo);

// AO management (NO-scoped)
router.get('/aos/approved', getApprovedAos);
router.get('/aos/pending', getPendingAos);
router.get('/aos/:aoId/vles', getAoVles);
router.get('/aos/:aoId/problems', getAoProblems);
router.get('/aos/:aoId/service-requests', getAoServiceRequests);
router.get('/aos/:aoId', getAoById);
router.patch('/aos/:aoId/approve', validate(approveAoSchema), approveAo);
router.patch('/aos/:aoId/reject', validate(rejectAoSchema), rejectAo);
router.patch('/aos/:aoId/request-edit', requestEditAo);
router.patch('/aos/:aoId', uploadSingle('logo'), updateAo);

module.exports = router;
