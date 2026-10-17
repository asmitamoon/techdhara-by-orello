const express = require('express');
const {
  getPendingNodalOrgs,
  getNodalOrgById,
  approveNodalOrg,
  rejectNodalOrg,
  getApprovedNodalOrgs,
  updateNodalOrg,
  getNodalOrgAos,
  getNodalOrgProblems,
  getNodalOrgServiceRequests,
  requestEditNodalOrg
} = require('../controllers/admin/nodalOrgManagementController');
const {
  getApprovedAos,
  getAoById,
  approveAo,
  rejectAo,
  updateAo,
  getAoVles,
  getAoProblems,
  getAoServiceRequests,
  requestEditAo
} = require('../controllers/admin/aoAdminController');
const {
  getApprovedVles,
  getVleDetails,
  updateVle,
  getPendingVles,
  approveVle,
  rejectVle,
  requestEditVle
} = require('../controllers/admin/vleManagementController');
const {
  getApprovedInnovators,
  getInnovatorDetails,
  getInnovatorInnovations,
  updateInnovator,
  getPendingInnovators,
  approveInnovator,
  rejectInnovator,
  requestEditInnovator,
} = require('../controllers/admin/innovatorAdminController');
const {
  getPendingInnovations,
  getInnovationDetails,
  approveInnovation,
  rejectInnovation,
  requestEditInnovation,
  updateInnovation,
  getApprovedInnovations,
  adminDeleteInnovation
} = require('../controllers/admin/innovationApprovalController');
const {
  getProblemDetails,
  approveProblem,
  rejectProblem,
  getAdminProblemsList,
  getSimilarProblems,
  updateProblem,
  requestEditProblem,
  getServiceRequestDetails,
  getAdminServiceRequestsList,
  updateServiceRequest,
  requestEditServiceRequest
} = require('../controllers/admin/problemManagementController');
const {
  getBusinessModelDetails,
  updateBusinessModel,
  getBusinessModelByPilot
} = require('../controllers/admin/businessModelController');
const {
  getAllPipelineInnovators,
  createPipelineInnovator,
  getPipelineInnovatorDetails,
  updatePipelineInnovator,
  deletePipelineInnovator
} = require('../controllers/admin/pipelineInnovatorController');
const {
  getAllContactViews
} = require('../controllers/admin/contactViewMonitoringController');
const {
  createAdmin,
  getAllAdmins,
  getAdminDetails,
  deleteAdmin
} = require('../controllers/admin/adminManagementController');
const {
  getAllSubscriptions,
  deleteSubscription,
  exportSubscriptions
} = require('../controllers/admin/newsletterController');
const {
  getBookkeepingData,
  getBookkeepingEntry,
  updateBookkeepingEntry
} = require('../controllers/admin/bookkeepingAdminController');
const {
  startPilot,
  getPilotById,
  getPilotsByInnovation,
  getAllPilots,
  startPilotTrial,
  markPilotAsImplemented,
  cancelPilot,
  getPilotStats,
  getAdminVlePilotRequests
} = require('../controllers/admin/pilotController');
const {
  getAllFieldReports,
  getFieldReportStats,
  getFieldReportDetails,
  getVleFieldReports,
  getPilotFieldReports,
  getInnovationFieldReports,
  createFieldReportAsAdmin
} = require('../controllers/admin/fieldReportViewController');
const {
  getAllAnalytics,
  getEcosystemAnalytics,
  getProblemAnalytics,
  getInnovationTrendAnalytics,
  getInnovatorTrendAnalytics,
  getVleContactTrendAnalytics,
  getCategoryAnalytics,
  getPipelineAnalytics,
  getStateBreakdownAnalytics,
  exportProblemsReport,
  exportInnovationsReport,
  exportVLEsReport,
  exportAOsReport,
  exportNOsReport,
} = require('../controllers/admin/analyticsController');
const { getAdminOverview } = require('../controllers/admin/overviewController');
const {
  getNotifications,
  markAllAsRead,
  deleteAllNotifications,
  deleteNotification
} = require('../controllers/admin/notificationController');
const { authenticate, restrictTo, requireSuperAdmin } = require('../middlewares/auth');
const { uploadSingle, uploadFields, validateFileSize } = require('../middlewares/upload');
const { validate } = require('../middlewares/validate');
const {
  rejectInnovationSchema,
  rejectProblemSchema,
  rejectUserSchema
} = require('../../validators/adminValidation');
const {
  createAdminSchema
} = require('../../validators/adminManagementValidation');
const {
  getAllSubscriptionsSchema
} = require('../../validators/newsletterValidation');
const {
  getAllPilotsSchema
} = require('../../validators/pilotValidation');
const {
  getBookkeepingSchema
} = require('../../validators/bookkeepingValidation');
const {
  createFieldReportSchema,
  getAllFieldReportsSchema
} = require('../../validators/fieldReportValidation');
const router = express.Router();

router.use(authenticate);
router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

// Dashboard overview endpoint
router.get('/overview', getAdminOverview);

// Nodal Organization management endpoints
router.get('/nodal-orgs/pending', getPendingNodalOrgs);
router.get('/nodal-orgs/approved', getApprovedNodalOrgs);
router.get('/nodal-orgs/:nodalOrgId', getNodalOrgById);
router.patch('/nodal-orgs/:nodalOrgId/approve', approveNodalOrg);
router.patch('/nodal-orgs/:nodalOrgId/reject', validate(rejectUserSchema), rejectNodalOrg);
router.patch('/nodal-orgs/:nodalOrgId/request-edit', requestEditNodalOrg);
router.patch('/nodal-orgs/:nodalOrgId', uploadSingle('logo'), updateNodalOrg);
router.get('/nodal-orgs/:nodalOrgId/affiliated-orgs', getNodalOrgAos);
router.get('/nodal-orgs/:nodalOrgId/problems', getNodalOrgProblems);
router.get('/nodal-orgs/:nodalOrgId/service-requests', getNodalOrgServiceRequests);

// Affiliated Organization (AO) management endpoints
router.get('/affiliated-orgs/approved', getApprovedAos);
router.get('/affiliated-orgs/:aoId/vles', getAoVles);
router.get('/affiliated-orgs/:aoId', getAoById);
router.patch('/affiliated-orgs/:aoId/approve', approveAo);
router.patch('/affiliated-orgs/:aoId/reject', validate(rejectUserSchema), rejectAo);
router.patch('/affiliated-orgs/:aoId/request-edit', requestEditAo);
router.patch('/affiliated-orgs/:aoId', uploadSingle('logo'), updateAo);
router.get('/affiliated-orgs/:aoId/problems', getAoProblems);
router.get('/affiliated-orgs/:aoId/service-requests', getAoServiceRequests);

// VLE management endpoints
router.get('/vles/pending', getPendingVles);
router.get('/vles/approved', getApprovedVles);
router.get('/vles/:vleId', getVleDetails);
router.patch('/vles/:vleId/approve', approveVle);
router.patch('/vles/:vleId/reject', validate(rejectUserSchema), rejectVle);
router.patch('/vles/:vleId/request-edit', requestEditVle);
router.patch('/vles/:vleId', uploadSingle('profilePic'), updateVle);
router.get('/vles/:vleId/field-reports', validate(getAllFieldReportsSchema, 'query'), getVleFieldReports);
router.get('/vles/:vleId/similar-problems', getSimilarProblems);
router.get('/vles/:vleId/pilot-requests', getAdminVlePilotRequests);

// Innovator management endpoints
router.get('/innovators/pending', getPendingInnovators);
router.get('/innovators/approved', getApprovedInnovators);
router.get('/innovators/:innovatorId', getInnovatorDetails);
router.get('/innovators/:innovatorId/innovations', getInnovatorInnovations);
router.patch('/innovators/:innovatorId/approve', approveInnovator);
router.patch('/innovators/:innovatorId/reject', validate(rejectUserSchema), rejectInnovator);
router.patch('/innovators/:innovatorId/request-edit', requestEditInnovator);
router.patch('/innovators/:innovatorId', uploadSingle('profilePic'), updateInnovator);

// Pipeline innovator management endpoints
router.get('/pipeline-innovators', getAllPipelineInnovators);
router.post('/pipeline-innovators', createPipelineInnovator);
router.get('/pipeline-innovators/:innovatorId', getPipelineInnovatorDetails);
router.patch('/pipeline-innovators/:innovatorId', updatePipelineInnovator);
router.delete('/pipeline-innovators/:innovatorId', deletePipelineInnovator);

// Innovation management endpoints
router.get('/innovations/pending', getPendingInnovations);
router.get('/innovations/approved', getApprovedInnovations);
router.get('/innovations/:innovationId', getInnovationDetails);
router.patch('/innovations/:innovationId/approve', approveInnovation);
router.patch('/innovations/:innovationId/reject', validate(rejectInnovationSchema), rejectInnovation);
router.patch('/innovations/:innovationId/request-edit', requestEditInnovation);
router.patch('/innovations/:innovationId', uploadFields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 2 },
  { name: 'documents', maxCount: 10 },
]), validateFileSize(), updateInnovation);
router.delete('/innovations/:innovationId', requireSuperAdmin, adminDeleteInnovation);


// Problem management endpoints
router.get('/problems', getAdminProblemsList);
router.get('/problems/:problemId', getProblemDetails);
router.patch('/problems/:problemId/approve', approveProblem);
router.patch('/problems/:problemId/reject', validate(rejectProblemSchema), rejectProblem);
router.patch('/problems/:problemId/request-edit', requestEditProblem);
router.patch('/problems/:problemId', uploadFields([{ name: 'cover', maxCount: 1 }]), updateProblem);


// Service request management endpoints
router.get('/service-requests', getAdminServiceRequestsList);
router.get('/service-requests/:serviceRequestId', getServiceRequestDetails);
router.patch('/service-requests/:serviceRequestId/request-edit', requestEditServiceRequest);
router.patch('/service-requests/:serviceRequestId', updateServiceRequest);

// Business model management endpoints
router.get('/business-models/:businessModelId', getBusinessModelDetails);
router.patch('/business-models/:businessModelId', updateBusinessModel);
router.get('/pilots/:pilotId/business-model', getBusinessModelByPilot);

// Contact view monitoring endpoints
router.get('/contact-views', getAllContactViews);

// Admin management endpoints (SUPER_ADMIN only)
router.post('/admins/create', requireSuperAdmin, validate(createAdminSchema), createAdmin);
router.get('/admins', requireSuperAdmin, getAllAdmins);
router.get('/admins/:adminId', requireSuperAdmin, getAdminDetails);
router.delete('/admins/:adminId', requireSuperAdmin, deleteAdmin);

// Newsletter management endpoints
router.get('/newsletter/subscriptions', validate(getAllSubscriptionsSchema, 'query'), getAllSubscriptions);
router.delete('/newsletter/subscriptions/:subscriptionId', deleteSubscription);
router.get('/newsletter/export', exportSubscriptions);

// VLE Bookkeeping monitoring endpoints
router.get('/bookkeeping', validate(getBookkeepingSchema, 'query'), getBookkeepingData);
router.get('/bookkeeping/:entryId', getBookkeepingEntry);
router.patch('/bookkeeping/:entryId', updateBookkeepingEntry);

// Pilot program management endpoints
router.get('/innovations/:innovationId/pilots', getPilotsByInnovation);
router.get('/pilots', validate(getAllPilotsSchema, 'query'), getAllPilots);
router.get('/pilots/stats', getPilotStats);
router.get('/pilots/:pilotId', getPilotById);
router.patch('/pilots/:pilotId/start', startPilot);
router.patch('/pilots/:pilotId/start-trial', startPilotTrial);
router.patch('/pilots/:pilotId/implement', markPilotAsImplemented);
router.delete('/pilots/:pilotId', cancelPilot);

// Field report monitoring endpoints
router.post('/pilots/:pilotId/field-reports', validate(createFieldReportSchema), createFieldReportAsAdmin);
router.get('/field-reports', validate(getAllFieldReportsSchema, 'query'), getAllFieldReports);
router.get('/field-reports/stats', getFieldReportStats);
router.get('/field-reports/:reportId', getFieldReportDetails);
router.get('/pilots/:pilotId/field-reports', validate(getAllFieldReportsSchema, 'query'), getPilotFieldReports);
router.get('/innovations/:innovationId/field-reports', validate(getAllFieldReportsSchema, 'query'), getInnovationFieldReports);

// Analytics endpoints
router.get('/analytics/all', getAllAnalytics);
router.get('/analytics/ecosystem', getEcosystemAnalytics);
router.get('/analytics/problems', getProblemAnalytics);
router.get('/analytics/innovation-trend', getInnovationTrendAnalytics);
router.get('/analytics/innovator-trend', getInnovatorTrendAnalytics);
router.get('/analytics/vle-contact-trend', getVleContactTrendAnalytics);
router.get('/analytics/categories', getCategoryAnalytics);
router.get('/analytics/pipeline', getPipelineAnalytics);
router.get('/analytics/state-breakdown', getStateBreakdownAnalytics);
router.get('/analytics/export/problems', exportProblemsReport);
router.get('/analytics/export/innovations', exportInnovationsReport);
router.get('/analytics/export/vles', exportVLEsReport);
router.get('/analytics/export/aos', exportAOsReport);
router.get('/analytics/export/nos', exportNOsReport);

// Admin notification endpoints
router.get('/notifications', getNotifications);
router.patch('/notifications/read-all', markAllAsRead);
router.delete('/notifications', deleteAllNotifications);
router.delete('/notifications/:notificationId', deleteNotification);

module.exports = router;
