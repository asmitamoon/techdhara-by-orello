const express = require('express');
const { authenticate, restrictTo } = require('../middlewares/auth');
const { resolveOrgScope } = require('../middlewares/resolveOrgScope');
const { getOrgApprovedVles, getOrgVleDetails, getOrgPendingVles, approveOrgVle, rejectOrgVle, updateOrgVle, requestEditOrgVle } = require('../controllers/org/vleManagementController');
const { createProblemForOrgVle, getOrgProblemDetails, approveOrgProblem, rejectOrgProblem, updateOrgProblem, requestEditOrgProblem, getOrgVleSimilarProblems, getOrgProblemView, getOrgProblemsList, getOrgServiceRequestsList, getOrgServiceRequestDetails, updateOrgServiceRequest, createServiceRequestForOrgVle } = require('../controllers/org/problemManagementController');
const { createPilotRequestForVle, getVlePilotRequests, getVlePilotRequestContext } = require('../controllers/org/pilotRequestController');
const { getOrgPilots, getOrgPilotById, startOrgTrial, markOrgPilotAsImplemented, cancelOrgPilot, startOrgPilot } = require('../controllers/org/pilotController');
const { getOrgBusinessModelByPilot, createOrgBusinessModel, updateOrgBusinessModel } = require('../controllers/org/businessModelController');
const { getOrgInnovationById } = require('../controllers/org/innovationController');
const { getOrgFieldReportDetails, getOrgPilotFieldReports, getOrgVleFieldReports } = require('../controllers/org/fieldReportViewController');
const { getOrgVleBookkeepings, getOrgVleBookkeepingById } = require('../controllers/org/bookkeepingController');
const { getOrgOverview } = require('../controllers/org/overviewController');
const { validate, validateFormData } = require('../middlewares/validate');
const { uploadFields, uploadSingle } = require('../middlewares/upload');
const { aoCreateProblemSchema } = require('../../validators/aoProblemValidation');
const { aoCreateServiceRequestSchema } = require('../../validators/serviceRequestValidation');
const { rejectProblemSchema, rejectUserSchema } = require('../../validators/adminValidation');

const router = express.Router();

router.use(authenticate);
router.use(restrictTo('AO', 'NO'));
router.use(resolveOrgScope);

router.get('/overview', getOrgOverview);
router.get('/problems-list', getOrgProblemsList);
router.get('/service-requests', getOrgServiceRequestsList);
router.get('/service-requests/:serviceRequestId', getOrgServiceRequestDetails);
router.post('/service-requests/create-for-vle', validate(aoCreateServiceRequestSchema), createServiceRequestForOrgVle);
router.patch('/service-requests/:serviceRequestId', updateOrgServiceRequest);

// VLE listing and details (same view for AO and NO)
router.get('/vles/approved', getOrgApprovedVles);
router.get('/vles/pending', getOrgPendingVles);
router.get('/vles/:vleId', getOrgVleDetails);
router.patch('/vles/:vleId', uploadSingle('profilePic'), updateOrgVle);
router.patch('/vles/:vleId/approve', approveOrgVle);
router.patch('/vles/:vleId/reject', validate(rejectUserSchema), rejectOrgVle);
router.patch('/vles/:vleId/request-edit', requestEditOrgVle);
router.get('/vles/:vleId/similar-problems', getOrgVleSimilarProblems);
router.get('/vles/:vleId/field-reports', getOrgVleFieldReports);
router.get('/vles/:vleId/bookkeepings', getOrgVleBookkeepings);
router.get('/vles/:vleId/bookkeepings/:bookkeepingId', getOrgVleBookkeepingById);
router.post('/vles/:vleId/pilot-request', createPilotRequestForVle);
router.get('/vles/:vleId/pilot-requests', getVlePilotRequests);
router.get('/vles/:vleId/pilot-request-context', getVlePilotRequestContext);

// Problem management on behalf of VLEs
router.post('/problems/create-for-vle', uploadFields([
  { name: 'cover', maxCount: 1 },
  { name: 'files', maxCount: 10 }
]), validateFormData(aoCreateProblemSchema), createProblemForOrgVle);
router.patch('/problems/:problemId/approve', approveOrgProblem);
router.patch('/problems/:problemId/reject', validate(rejectProblemSchema), rejectOrgProblem);
router.patch('/problems/:problemId/request-edit', requestEditOrgProblem);
router.patch('/problems/:problemId', uploadFields([{ name: 'cover', maxCount: 1 }]), updateOrgProblem);
router.get('/problems/:problemId/view', getOrgProblemView);
router.get('/problems/:problemId', getOrgProblemDetails);

// Innovation details (org-scoped)
router.get('/innovations/:innovationId', getOrgInnovationById);

// Pilot management (org-scoped)
router.get('/pilots', getOrgPilots);
router.get('/pilots/:pilotId/field-reports', getOrgPilotFieldReports);
router.get('/pilots/:pilotId/business-model', getOrgBusinessModelByPilot);
router.post('/pilots/:pilotId/business-model', createOrgBusinessModel);
router.patch('/pilots/:pilotId/business-model', updateOrgBusinessModel);
router.get('/pilots/:pilotId', getOrgPilotById);
router.patch('/pilots/:pilotId/start', startOrgPilot);
router.patch('/pilots/:pilotId/start-trial', startOrgTrial);
router.patch('/pilots/:pilotId/implement', markOrgPilotAsImplemented);
router.delete('/pilots/:pilotId', cancelOrgPilot);

// Field reports (READ-ONLY for both AO and NO via this route)
// AO creates/edits/submits/deletes field reports via /ao routes
router.get('/field-reports/:reportId', getOrgFieldReportDetails);

module.exports = router;
