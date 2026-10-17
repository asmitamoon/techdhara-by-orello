const express = require('express');
const {
  createInnovation,
  getMyInnovations,
  getInnovationDetails,
  updateInnovation,
  deleteInnovation,
  submitForApproval
} = require('../controllers/innovator/innovationController');
const { importFromWebsite } = require('../controllers/innovator/aiController');
const {
  uploadInnovationFiles,
  deleteInnovationFile,
  uploadCoverImage
} = require('../controllers/innovator/fileUploadController');
const { authenticate, restrictTo } = require('../middlewares/auth');
const { uploadMultiple, uploadSingle, uploadFields, validateFileSize } = require('../middlewares/upload');
const { validateFormData } = require('../middlewares/validate');
const { createInnovationSchema, updateInnovationSchema } = require('../../validators/innovationValidation');

const router = express.Router();

router.use(authenticate);
router.use(restrictTo('INNOVATOR', { allowPending: true }));

router.post('/ai/import-from-website', importFromWebsite);

router.post('/innovations', uploadFields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 2 },
  { name: 'documents', maxCount: 10 }
]), validateFileSize(), validateFormData(createInnovationSchema), createInnovation);
router.get('/innovations', getMyInnovations);
router.get('/innovations/:innovationId', getInnovationDetails);
router.patch('/innovations/:innovationId', uploadFields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 2 },
  { name: 'documents', maxCount: 10 }
]), validateFileSize(), validateFormData(updateInnovationSchema), updateInnovation);
router.delete('/innovations/:innovationId', deleteInnovation);
router.patch('/innovations/:innovationId/submit', submitForApproval);

router.post('/innovations/:innovationId/upload', uploadMultiple('files', 10), uploadInnovationFiles);
router.post('/innovations/:innovationId/cover', uploadSingle('cover'), uploadCoverImage);
router.delete('/innovations/:innovationId/files/:fileId', deleteInnovationFile);

module.exports = router;
