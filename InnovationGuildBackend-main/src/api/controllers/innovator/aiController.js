const catchAsync = require('../../../utils/catchAsync');
const { AppError } = require('../../../utils/errorHandler');
const { extractProductsFromUrl } = require('../../../services/ai/aiService');
const Innovation = require('../../../models/Innovation');
const redisClient = require('../../../services/cache/redisClient');
const { generateAiImportRateLimitKey } = require('../../../services/cache/cacheKeys');

const AI_IMPORT_DAILY_LIMIT = 5;
const AI_IMPORT_TTL = 86400; // 24 hours

const parseSelling = (raw) => {
  if (!raw) return undefined;
  const parts = String(raw).replace(/[^0-9-]/g, '').split('-').map(Number).filter(n => n > 0);
  if (parts.length >= 2) return { min: parts[0], max: parts[1] };
  if (parts.length === 1) return { min: parts[0], max: parts[0] };
  return undefined;
};

const importFromWebsite = catchAsync(async (req, res, next) => {
  // Rate limiting — fail open if Redis is unavailable
  const count = await redisClient.increment(
    generateAiImportRateLimitKey(req.user._id),
    AI_IMPORT_TTL
  );
  if (count !== null && count > AI_IMPORT_DAILY_LIMIT) {
    return next(new AppError('You have reached your daily import limit of 5. Please try again tomorrow.', 429));
  }

  const { url } = req.body;

  if (!url || typeof url !== 'string' || !url.trim()) {
    return next(new AppError('Please provide a URL.', 400));
  }

  try {
    new URL(url.trim());
  } catch {
    return next(new AppError('Invalid URL format.', 400));
  }

  const products = await extractProductsFromUrl(url.trim());

  if (!products.length) {
    return next(new AppError('No products could be extracted from the given URL.', 404));
  }

  const innovations = products.map((p) => ({
    innovatorId: req.user._id,
    status: 'DRAFT',
    media: { images: [], videos: [] },
    downloadableResources: [],
    innovationName:        p.innovationName,
    description:           p.description,
    category:              p.category ?? [],
    subcategory:           p.subcategory ?? [],
    innovationStage:       p.innovationStage ?? 'idea',
    yearLaunched:          p.yearLaunched ?? undefined,
    manufacturingLocation: p.manufacturingLocation ?? undefined,
    powerSource:           p.powerSource ?? undefined,
    renewableType:         p.renewableType ?? undefined,
    coveredOperations:     p.coveredOperations ?? [],
    suitableCrops:         p.suitableCrops ?? undefined,
    suitableTerrains:      p.suitableTerrains ?? undefined,
    dimensions:            p.dimensions ?? undefined,
    weight:                p.weight ?? undefined,
    performanceParams:     p.performanceParams ?? undefined,
    sellingPrice:          parseSelling(p.sellingPrice),
  }));

  // Deduplication — skip innovations whose name already exists for this innovator
  const extractedNames = innovations.map(i => i.innovationName);
  const existingNames = await Innovation.find({
    innovatorId: req.user._id,
    innovationName: { $in: extractedNames },
  }).distinct('innovationName');

  const existingNamesLower = new Set(existingNames.map(n => n.toLowerCase()));
  const toInsert = innovations.filter(i => !existingNamesLower.has(i.innovationName.toLowerCase()));
  const skippedCount = innovations.length - toInsert.length;

  const saved = toInsert.length > 0 ? await Innovation.insertMany(toInsert) : [];

  res.status(saved.length > 0 ? 201 : 200).json({
    status: 'success',
    data: {
      savedCount: saved.length,
      skippedCount,
      innovations: saved.map((i) => ({ _id: i._id, innovationName: i.innovationName })),
    },
  });
});

module.exports = { importFromWebsite };
