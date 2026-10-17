const express = require('express');
const {
  getPublishedInnovations,
  getInnovationById,
  getInnovationFacets,
  getPublishedProblems,
  getProblemById,
  getProblemMatches,
  getInnovationMatches,
  getApprovedNodalOrgs,
  getApprovedAos,
  getSimilarInnovations,
  getPublishedVles
} = require('../controllers/public/publicController');
const { getInnovationComments, getProblemComments } = require('../controllers/common/commentController');
const { subscribeToNewsletter } = require('../controllers/public/newsletterController');
const { getOperations } = require('../controllers/public/operationsController');
const { getVillages } = require('../controllers/public/villagesController');
const { submitContactForm } = require('../controllers/public/contactFormController');
const { streamPublicVideo } = require('../controllers/public/publicVideoStreamController');
const { getCategoryPreview } = require('../controllers/public/innovationCategoryPreviewController');
const { getVleStats } = require('../controllers/public/vleStatsController');
const { getImpactStats } = require('../controllers/public/impactStatsController');
const { validate } = require('../middlewares/validate');
const {
  getPublishedInnovationsSchema,
  getPublishedProblemsSchema
} = require('../../validators/publicValidation');
const { subscribeNewsletterSchema } = require('../../validators/newsletterValidation');
const { submitContactFormSchema } = require('../../validators/contactFormValidation');

const router = express.Router();

router.get('/innovations', validate(getPublishedInnovationsSchema, 'query'), getPublishedInnovations);
router.get('/innovations/facets', getInnovationFacets);
router.get('/innovations/category-preview', getCategoryPreview);
router.get('/innovations/:innovationId', getInnovationById);
router.get('/problems', validate(getPublishedProblemsSchema, 'query'), getPublishedProblems);
router.get('/problems/:problemId', getProblemById);

router.get('/problems/:problemId/matches', getProblemMatches);
router.get('/innovations/:innovationId/matches', getInnovationMatches);
router.get('/innovations/:innovationId/similar', getSimilarInnovations);
router.get('/innovations/:innovationId/comments', getInnovationComments);
router.get('/problems/:problemId/comments', getProblemComments);

router.post('/newsletter/subscribe', validate(subscribeNewsletterSchema), subscribeToNewsletter);

router.post('/contact', validate(submitContactFormSchema), submitContactForm);

router.get('/videos/stream/:innovationId/:videoIndex', streamPublicVideo);

router.get('/operations', getOperations);
router.get('/villages', getVillages);
router.get('/nodal-orgs', getApprovedNodalOrgs);
router.get('/approved-aos', getApprovedAos);
router.get('/vles/stats', getVleStats);
router.get('/vles', getPublishedVles);
router.get('/impact-stats', getImpactStats);

module.exports = router;
