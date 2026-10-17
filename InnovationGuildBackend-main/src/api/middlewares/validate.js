const { z } = require('zod');

const validate = (schema, source = 'body') => async (req, res, next) => {
  try {
    const data = source === 'query' ? req.query : req.body;
    const validated = await schema.parseAsync(data);
    req[source] = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors
      });
    }
    next(error);
  }
};

const validateFormData = (schema) => async (req, res, next) => {
  try {
    const parsed = { ...req.body };

    // Parse JSON-encoded object fields before the comma-split loop
    const jsonFields = ['sellingPrice', 'category', 'subcategory', 'salesLocation', 'coveredOperations', 'youtubeVideos', 'removedExternalVideoIds', 'mediaOrder',
      'valueChainStages', 'operationsUndertaken', 'machineOperations', 'energySource', 'streamOfWork',
      'otherLivelihoods', 'languages', 'machinesWorkedWith', 'supportAssessment'];
    jsonFields.forEach(field => {
      if (parsed[field] && typeof parsed[field] === 'string') {
        try { parsed[field] = JSON.parse(parsed[field]); } catch (e) {}
      }
    });

    const numberFields = ['yearLaunched', 'age', 'livelihoodExperience', 'yearlyRevenue', 'machineExpYears', 'numberOfUnitsInstalled', 'potentialAoCount', 'experience'];
    numberFields.forEach(field => {
      if (parsed[field] && parsed[field] !== '') {
        parsed[field] = Number(parsed[field]);
      }
    });

    const booleanFields = ['hasMachineExp', 'sparePartsAvailable', 'trainingProvided'];
    booleanFields.forEach(field => {
      if (parsed[field] === 'true') parsed[field] = true;
      if (parsed[field] === 'false') parsed[field] = false;
    });

    const validated = await schema.parseAsync(parsed);
    // Merge: validated supplies Zod transforms; parsed preserves non-schema fields
    // (e.g. imagePositions, videoPositions, removedExternalVideoIds) that Zod strips
    req.body = { ...parsed, ...validated };
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors
      });
    }
    next(error);
  }
};

module.exports = { validate, validateFormData };
