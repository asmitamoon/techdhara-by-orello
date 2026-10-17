const express = require('express');
const router = express.Router();
const { authenticate, restrictTo } = require('../middlewares/auth');
const {createProblem,getMyProblems,getProblemDetails,updateProblem,deleteProblem,submitForApproval} = require('../controllers/common/problemController');
const {createServiceRequest,getMyServiceRequests,getServiceRequestDetails,updateServiceRequest,deleteServiceRequest,submitForApproval: submitServiceRequest} = require('../controllers/common/serviceRequestController');
const {uploadProblemFiles,deleteProblemFile} = require('../controllers/common/problemFileUploadController');
const {createCommentOnInnovation,createCommentOnProblem,deleteComment,getMyComments} = require('../controllers/common/commentController');
const {viewContact} = require('../controllers/common/contactViewController');
const {saveInnovation,unsaveInnovation,getMySavedInnovations} = require('../controllers/common/savedInnovationController');
const {saveProfile,unsaveProfile,getMySavedProfiles} = require('../controllers/common/savedProfileController');
const { getMyProfile, updateMyProfile, submitProfileForApproval } = require('../controllers/common/myProfileController');
const {saveProblem,unsaveProblem,getMySavedProblems} = require('../controllers/common/savedProblemController');
const {getMyNotifications,markMyNotificationsAsRead,deleteMyNotification,clearMyNotifications} = require('../controllers/common/notificationController');
const {streamVideo} = require('../controllers/common/videoStreamController');
const { getUserById, getUserInnovations, getUserProblems } = require('../controllers/common/userController');
const { uploadSingle, uploadFields } = require('../middlewares/upload');
const { validate, validateFormData } = require('../middlewares/validate');
const { createInnovationRequestSchema, updateInnovationRequestSchema } = require('../../validators/innovationRequestValidation');
const { createServiceRequestSchema, updateServiceRequestSchema } = require('../../validators/serviceRequestValidation');
const { createCommentSchema } = require('../../validators/commentValidation');
const { viewContactSchema } = require('../../validators/contactViewValidation');
const { getSavedInnovationsSchema } = require('../../validators/savedInnovationValidation');
const { getSavedProfilesSchema } = require('../../validators/savedProfileValidation');
const { getSavedProblemsSchema } = require('../../validators/savedProblemValidation');

router.use(authenticate);
router.get('/profiles/:userId', restrictTo('VLE', 'INNOVATOR', 'AO', 'NO', 'GENERAL_USER', 'ADMIN', 'SUPER_ADMIN', { allowPending: true }), getUserById);
router.get('/profiles/:userId/innovations', restrictTo('VLE', 'INNOVATOR', 'AO', 'NO', 'GENERAL_USER', 'ADMIN', 'SUPER_ADMIN', { allowPending: true }), getUserInnovations);
router.get('/profiles/:userId/problems', restrictTo('VLE', 'INNOVATOR', 'AO', 'NO', 'GENERAL_USER', 'ADMIN', 'SUPER_ADMIN', { allowPending: true }), getUserProblems);
router.post('/contacts/view', restrictTo('VLE', 'INNOVATOR', 'AO', 'NO', 'GENERAL_USER', 'ADMIN', 'SUPER_ADMIN'), validate(viewContactSchema), viewContact);
router.get('/notifications', restrictTo('VLE', 'INNOVATOR', 'AO', 'NO', 'GENERAL_USER', { allowPending: true }), getMyNotifications);
router.patch('/notifications/read-all', restrictTo('VLE', 'INNOVATOR', 'AO', 'NO', 'GENERAL_USER', { allowPending: true }), markMyNotificationsAsRead);
router.delete('/notifications', restrictTo('VLE', 'INNOVATOR', 'AO', 'NO', 'GENERAL_USER', { allowPending: true }), clearMyNotifications);
router.delete('/notifications/:notificationId', restrictTo('VLE', 'INNOVATOR', 'AO', 'NO', 'GENERAL_USER', { allowPending: true }), deleteMyNotification);

router.get('/my-profile', restrictTo('VLE', 'INNOVATOR', 'AO', 'NO', 'GENERAL_USER', { allowPending: true }), getMyProfile);
router.patch('/my-profile/submit', restrictTo('VLE', 'INNOVATOR', 'AO', 'NO', 'GENERAL_USER', { allowPending: true }), submitProfileForApproval);
router.patch('/my-profile', restrictTo('VLE', 'INNOVATOR', 'AO', 'NO', 'GENERAL_USER', { allowPending: true }), uploadSingle('profilePic'), updateMyProfile);

router.use(restrictTo('VLE', 'INNOVATOR', 'AO', 'NO', 'GENERAL_USER'));

router.post('/problems', restrictTo('VLE', 'INNOVATOR', 'AO', 'NO'), uploadFields([
  { name: 'cover', maxCount: 1 },
  { name: 'files', maxCount: 10 }
]), validateFormData(createInnovationRequestSchema), createProblem);
router.get('/problems', getMyProblems);
router.get('/problems/:problemId', getProblemDetails);
router.patch('/problems/:problemId', restrictTo('VLE', 'AO', 'NO'), uploadFields([{ name: 'cover', maxCount: 1 }]), validateFormData(updateInnovationRequestSchema), updateProblem);
router.delete('/problems/:problemId', restrictTo('VLE', 'AO', 'NO'), deleteProblem);
router.patch('/problems/:problemId/submit', restrictTo('VLE', 'AO', 'NO'), submitForApproval);

router.post('/problems/:problemId/upload', restrictTo('VLE', 'AO', 'NO'), uploadSingle('image'), uploadProblemFiles);
router.delete('/problems/:problemId/files/:fileId', restrictTo('VLE', 'AO', 'NO'), deleteProblemFile);

router.post('/service-requests', restrictTo('VLE', 'AO', 'NO'), validate(createServiceRequestSchema), createServiceRequest);
router.get('/service-requests', getMyServiceRequests);
router.get('/service-requests/:serviceRequestId', getServiceRequestDetails);
router.patch('/service-requests/:serviceRequestId', restrictTo('VLE', 'AO', 'NO'), validate(updateServiceRequestSchema), updateServiceRequest);
router.delete('/service-requests/:serviceRequestId', restrictTo('VLE', 'AO', 'NO'), deleteServiceRequest);
router.patch('/service-requests/:serviceRequestId/submit', restrictTo('VLE', 'AO', 'NO'), submitServiceRequest);

router.post('/innovations/:innovationId/comments', validate(createCommentSchema), createCommentOnInnovation);
router.post('/problems/:problemId/comments', validate(createCommentSchema), createCommentOnProblem);
router.delete('/comments/:commentId', deleteComment);
router.get('/my-comments', getMyComments);

router.post('/innovations/:innovationId/save', saveInnovation);
router.delete('/innovations/:innovationId/save', unsaveInnovation);
router.get('/saved/innovations', validate(getSavedInnovationsSchema, 'query'), getMySavedInnovations);

router.post('/profiles/:userId/save', saveProfile);
router.delete('/profiles/:userId/save', unsaveProfile);
router.get('/saved/profiles', validate(getSavedProfilesSchema, 'query'), getMySavedProfiles);

router.post('/problems/:problemId/save', saveProblem);
router.delete('/problems/:problemId/save', unsaveProblem);
router.get('/saved/problems', validate(getSavedProblemsSchema, 'query'), getMySavedProblems);

router.get('/videos/stream/:innovationId/:videoIndex', streamVideo);

module.exports = router;
