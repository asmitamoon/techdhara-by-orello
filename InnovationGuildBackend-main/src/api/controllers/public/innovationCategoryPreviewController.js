const Innovation = require('../../../models/Innovation');
const User = require('../../../models/User');
const InnovatorProfile = require('../../../models/InnovatorProfile');
const catchAsync = require('../../../utils/catchAsync');
const { findStateCodesByName, findDistrictCodesByName } = require('../../../utils/LocationData/locationData');

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const CATEGORIES = ['agriculture', 'textiles', 'fisheries', 'bamboo', 'poultry', 'dairy', 'others'];

const previewPipeline = [
  { $sort: { createdAt: -1 } },
  { $limit: 3 },
  {
    $lookup: {
      from: 'users',
      localField: 'innovatorId',
      foreignField: '_id',
      as: 'innovatorId',
      pipeline: [{ $project: { fullName: 1 } }],
    },
  },
  { $unwind: { path: '$innovatorId', preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: 'innovatorprofiles',
      localField: 'innovatorId._id',
      foreignField: 'userId',
      as: 'innovatorProfile',
      pipeline: [{ $project: { state: 1, district: 1 } }],
    },
  },
  { $unwind: { path: '$innovatorProfile', preserveNullAndEmptyArrays: true } },
  {
    $project: {
      innovationName: 1,
      description: 1,
      category: 1,
      thumbnail: { $arrayElemAt: ['$media.images.url', 0] },
      innovatorId: 1,
      state: { $ifNull: ['$innovatorProfile.state', ''] },
      district: { $ifNull: ['$innovatorProfile.district', ''] },
    },
  },
];

const getCategoryPreview = catchAsync(async (req, res) => {
  const { search, subCategory, state, operation } = req.query;

  const baseMatch = { status: 'PUBLISHED' };
  if (subCategory) {
    if (subCategory === 'others') {
      baseMatch.subcategoryOther = { $exists: true, $ne: '' };
    } else {
      baseMatch.subcategory = subCategory;
    }
  }
  if (state) baseMatch.salesLocation = state;
  if (operation) baseMatch.coveredOperations = operation;
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    const stateCodes = findStateCodesByName(search);
    const distCodes = findDistrictCodesByName(search);

    const nameIds = (await User.find({ role: 'INNOVATOR', fullName: rx }).select('_id').lean()).map(u => u._id);
    let locIds = [];
    if (stateCodes.length || distCodes.length) {
      const locOr = [];
      if (stateCodes.length) locOr.push({ state: { $in: stateCodes } });
      if (distCodes.length) locOr.push({ district: { $in: distCodes } });
      locIds = (await InnovatorProfile.find({ $or: locOr }).select('userId').lean()).map(p => p.userId);
    }
    const innovatorIds = [...nameIds, ...locIds];

    baseMatch.$or = [
      { innovationName: rx },
      { description: rx },
      { keywords: rx },
      { manufacturingLocation: rx },
      ...(stateCodes.length ? [{ salesLocation: { $in: stateCodes } }] : []),
      ...(innovatorIds.length ? [{ innovatorId: { $in: innovatorIds } }] : []),
    ];
  }

  const results = await Promise.all(
    CATEGORIES.map(cat => {
      const categoryMatch = cat === 'others'
        ? { ...baseMatch, categoryOther: { $exists: true, $ne: '' } }
        : { ...baseMatch, category: cat };
      return Innovation.aggregate([
        { $match: categoryMatch },
        ...previewPipeline,
      ]);
    })
  );

  const preview = CATEGORIES.reduce((acc, cat, idx) => {
    if (results[idx].length > 0) acc[cat] = results[idx];
    return acc;
  }, {});

  res.status(200).json({ status: 'success', data: { preview } });
});

module.exports = { getCategoryPreview };
