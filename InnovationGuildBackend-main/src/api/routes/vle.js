const express = require('express');
const { authenticate, restrictTo } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const {
  createBookkeepingEntry,
  getBookkeepingEntries,
  getBookkeepingEntryById,
  updateBookkeepingEntry,
  deleteBookkeepingEntry,
  getBookkeepingContext
} = require('../controllers/vle/bookkeepingController');
const {
  createBookkeepingSchema,
  updateBookkeepingSchema,
  getBookkeepingSchema
} = require('../../validators/bookkeepingValidation');
const {
  createPilotRequest,
  getMyPilotRequests,
  cancelPilotRequest,
  getMyPilotRequestContext,
  getPilotRequestProblems
} = require('../controllers/vle/pilotRequestController');
const {
  toggleFacingSimilar,
  getMyFacingSimilarProblems
} = require('../controllers/vle/facingSimilarProblemController');
const {
  createMyBusinessModel,
  getMyBusinessModels,
  getMyBusinessModelById
} = require('../controllers/vle/businessModelController');
const {
  createBusinessModelSchema,
  getBusinessModelsSchema
} = require('../../validators/businessModelValidation');

const router = express.Router();

router.use(authenticate);
router.use(restrictTo('VLE'));

router.post('/innovations/:innovationId/pilot-request', createPilotRequest);
router.get('/pilot-requests', getMyPilotRequests);
router.delete('/pilot-requests/:requestId', cancelPilotRequest);
router.get('/pilot-request-context', getMyPilotRequestContext);
router.get('/pilot-request-problems', getPilotRequestProblems);

router.post('/problems/:problemId/facing-similar', toggleFacingSimilar);
router.get('/problems/facing-similar', getMyFacingSimilarProblems);

router.post('/bookkeeping', validate(createBookkeepingSchema), createBookkeepingEntry);
router.get('/bookkeeping', validate(getBookkeepingSchema, 'query'), getBookkeepingEntries);
router.get('/bookkeeping/context/:pilotId', getBookkeepingContext);
router.get('/bookkeeping/:entryId', getBookkeepingEntryById);
router.patch('/bookkeeping/:entryId', validate(updateBookkeepingSchema), updateBookkeepingEntry);
router.delete('/bookkeeping/:entryId', deleteBookkeepingEntry);

router.post('/business-models', validate(createBusinessModelSchema), createMyBusinessModel);
router.get('/business-models', validate(getBusinessModelsSchema, 'query'), getMyBusinessModels);
router.get('/business-models/:businessModelId', getMyBusinessModelById);

module.exports = router;
