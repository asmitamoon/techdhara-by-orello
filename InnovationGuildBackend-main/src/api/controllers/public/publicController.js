const Innovation = require('../../../models/Innovation');
const InnovationRequest = require('../../../models/InnovationRequest');
const Match = require('../../../models/Match');
const User = require('../../../models/User');
const NodalOrgProfile = require('../../../models/NodalOrgProfile');
const AoProfile = require('../../../models/AoProfile');
const InnovatorProfile = require('../../../models/InnovatorProfile');
const VleProfile = require('../../../models/VleProfile');
const { AppError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { getCachedInnovationsList, getCachedInnovationDetail, getCachedProblemsList, getCachedProblemDetail } = require('../../../services/cache/publicContentCache');
const { getCachedProblemMatches, getCachedInnovationMatches } = require('../../../services/cache/matchCache');
const redisClient = require('../../../services/cache/redisClient');
const { generateViewKey } = require('../../../services/cache/cacheKeys');
const { findStateCodesByName, findDistrictCodesByName } = require('../../../utils/LocationData/locationData');

// Escape user input before using it in a RegExp so special chars can't crash the query
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getPublishedInnovations = catchAsync(async (req, res, next) => {
  const {
    category,
    subCategory,
    stage,
    operation,
    state,
    search,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    order = 'desc'
  } = req.query;

  const matchStage = { status: 'PUBLISHED' };

  if (category) {
    if (category === 'others') {
      matchStage.categoryOther = { $exists: true, $ne: '' };
    } else {
      matchStage.category = category;
    }
  }

  if (subCategory) {
    if (subCategory === 'others') {
      matchStage.subcategoryOther = { $exists: true, $ne: '' };
    } else {
      matchStage.subcategory = subCategory;
    }
  }

  if (stage) {
    matchStage.innovationStage = stage.toUpperCase();
  }

  if (operation) {
    matchStage.coveredOperations = operation;
  }

  if (state) {
    matchStage.salesLocation = state;
  }

  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    const stateCodes = findStateCodesByName(search);
    const distCodes = findDistrictCodesByName(search);

    // Innovators matching by name, plus innovators whose profile is in the searched location
    const nameIds = (await User.find({ role: 'INNOVATOR', fullName: rx }).select('_id').lean()).map(u => u._id);
    let locIds = [];
    if (stateCodes.length || distCodes.length) {
      const locOr = [];
      if (stateCodes.length) locOr.push({ state: { $in: stateCodes } });
      if (distCodes.length) locOr.push({ district: { $in: distCodes } });
      locIds = (await InnovatorProfile.find({ $or: locOr }).select('userId').lean()).map(p => p.userId);
    }
    const innovatorIds = [...nameIds, ...locIds];

    matchStage.$or = [
      { innovationName: rx },
      { description: rx },
      { keywords: rx },
      { manufacturingLocation: rx },
      ...(stateCodes.length ? [{ salesLocation: { $in: stateCodes } }] : []),
      ...(innovatorIds.length ? [{ innovatorId: { $in: innovatorIds } }] : []),
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const sortStage = { [sortBy]: sortOrder };

  const pipeline = [
    { $match: matchStage },
    { $sort: sortStage },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $skip: skip },
          { $limit: parseInt(limit) },
          {
            $lookup: {
              from: 'users',
              localField: 'innovatorId',
              foreignField: '_id',
              as: 'innovatorId',
              pipeline: [
                { $project: { fullName: 1, profilePicture: 1 } }
              ]
            }
          },
          { $unwind: '$innovatorId' },
          {
            $lookup: {
              from: 'innovatorprofiles',
              localField: 'innovatorId._id',
              foreignField: 'userId',
              as: 'innovatorProfile',
              pipeline: [{ $project: { state: 1, district: 1 } }]
            }
          },
          { $unwind: { path: '$innovatorProfile', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              innovationName: 1,
              description: 1,
              category: 1,
              innovationStage: 1,
              thumbnail: { $arrayElemAt: ['$media.images.url', 0] },
              sellingPrice: 1,
              yearLaunched: 1,
              innovatorId: 1,
              state: { $ifNull: ['$innovatorProfile.state', ''] },
              district: { $ifNull: ['$innovatorProfile.district', ''] },
              createdAt: 1
            }
          }
        ]
      }
    }
  ];

  const filters = { category, subCategory, stage, operation, state, search, page, limit, sortBy, order };
  const result = await getCachedInnovationsList(filters, pipeline);

  const total = result[0]?.metadata[0]?.total || 0;
  const innovations = result[0]?.data || [];

  res.status(200).json({
    status: 'success',
    data: {
      innovations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const getInnovationById = catchAsync(async (req, res, next) => {
  const { innovationId } = req.params;

  const query = Innovation.findOne({
    _id: innovationId,
    status: 'PUBLISHED'
  })
    .populate('innovatorId', 'fullName email profilePicture')
    .select('-rejectionReason')
    .lean();

  const innovation = await getCachedInnovationDetail(innovationId, query);

  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }

  // Get innovator's state/district from InnovatorProfile
  const innovatorProfile = await InnovatorProfile.findOne(
    { userId: innovation.innovatorId._id },
    { state: 1, district: 1, description: 1 }
  ).lean();

  // IP-based view deduplication (YouTube-style) — non-blocking
  const VIEW_TTL = 4 * 60 * 60; // 4 hours
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
  const viewKey = generateViewKey(innovationId, ip);
  redisClient.get(viewKey).then(alreadyViewed => {
    if (!alreadyViewed) {
      Innovation.findByIdAndUpdate(innovationId, { $inc: { views: 1 } }).exec();
      redisClient.set(viewKey, '1', VIEW_TTL);
    }
  }).catch(() => {
    Innovation.findByIdAndUpdate(innovationId, { $inc: { views: 1 } }).exec();
  });

  res.status(200).json({
    status: 'success',
    data: {
      innovation: {
        ...innovation,
        state: innovatorProfile?.state || '',
        district: innovatorProfile?.district || '',
        innovatorDescription: innovatorProfile?.description || '',
      }
    }
  });
});

const getPublishedProblems = catchAsync(async (req, res, next) => {
  const {
    category,
    subCategory,
    search,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    order = 'desc'
  } = req.query;

  const matchStage = { status: 'PUBLISHED' };

  if (category) {
    matchStage.category = category;
  }

  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    const stateCodes = findStateCodesByName(search);
    const distCodes = findDistrictCodesByName(search);

    // Posters (VLE/AO/NO) matching by name
    const posterIds = (await User.find({ role: { $in: ['VLE', 'AO', 'NO'] }, fullName: rx }).select('_id').lean()).map(u => u._id);

    matchStage.$or = [
      { problemTitle: rx },
      { problemDescription: rx },
      { keywords: rx },
      { regionVillage: rx },
      ...(stateCodes.length ? [{ regionState: { $in: stateCodes } }] : []),
      ...(distCodes.length ? [{ regionDistrict: { $in: distCodes } }] : []),
      ...(posterIds.length ? [{ postedBy: { $in: posterIds } }] : []),
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;
  const sortStage = { [sortBy]: sortOrder };

  const pipeline = [
    { $match: matchStage },
    { $sort: sortStage },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $skip: skip },
          { $limit: parseInt(limit) },
          {
            $lookup: {
              from: 'users',
              localField: 'postedBy',
              foreignField: '_id',
              as: 'postedBy',
              pipeline: [
                { $project: { fullName: 1, role: 1, profilePicture: 1 } }
              ]
            }
          },
          { $unwind: '$postedBy' },
          {
            $project: {
              problemTitle: 1,
              problemDescription: 1,
              category: 1,
              coverImage: 1,
              upvotes: 1,
              postedBy: 1,
              regionState: 1,
              regionDistrict: 1,
              createdAt: 1
            }
          }
        ]
      }
    }
  ];

  const filters = { category, subCategory, search, page, limit, sortBy, order };
  const result = await getCachedProblemsList(filters, pipeline);

  const total = result[0]?.metadata[0]?.total || 0;
  const problems = result[0]?.data || [];

  res.status(200).json({
    status: 'success',
    data: {
      problems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const getProblemById = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;

  const query = InnovationRequest.findOne({
    _id: problemId,
    status: 'PUBLISHED'
  })
    .populate('postedBy', 'fullName role')
    .select('-rejectionReason')
    .lean();

  const problem = await getCachedProblemDetail(problemId, query);

  if (!problem) {
    return next(new AppError('Problem not found', 404));
  }

  // Fetch poster's location from their profile
  let postedByLocation = null;
  if (problem.postedBy) {
    const posterId = problem.postedBy._id;
    const role = problem.postedBy.role;
    if (role === 'VLE') {
      const p = await VleProfile.findOne({ userId: posterId }).select('state district').lean();
      if (p) postedByLocation = { state: p.state ?? null, district: p.district ?? null };
    } else if (role === 'AO') {
      const p = await AoProfile.findOne({ userId: posterId }).select('state district').lean();
      if (p) postedByLocation = { state: p.state ?? null, district: p.district ?? null };
    } else if (role === 'NO') {
      const p = await NodalOrgProfile.findOne({ userId: posterId }).select('hqState').lean();
      if (p) postedByLocation = { state: p.hqState ?? null, district: null };
    }
  }

  const { role: _role, ...postedByCore } = problem.postedBy ?? {};
  const mergedPostedBy = problem.postedBy
    ? { ...postedByCore, state: postedByLocation?.state ?? null, district: postedByLocation?.district ?? null }
    : null;

  res.status(200).json({
    status: 'success',
    data: { problem: { ...problem, postedBy: mergedPostedBy } }
  });
});

const getProblemMatches = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const problem = await InnovationRequest.findById(problemId);
  if (!problem) {
    return next(new AppError('Problem not found', 404));
  }

  if (problem.status !== 'PUBLISHED') {
    return next(new AppError('Matches are only available for published problems', 404));
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = (async () => {
    const rawMatches = await Match.find({ problemId })
      .populate('innovationId', 'innovationName description category status innovationStage media.images innovatorId')
      .sort({ matchScore: -1 });

    const validMatches = rawMatches.filter(m => m.innovationId && m.innovationId.status === 'PUBLISHED');
    const totalCount = validMatches.length;
    const matches = validMatches.slice(skip, skip + parseInt(limit));

    return {
      matches,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      }
    };
  })();

  const filters = { page, limit };
  const result = await getCachedProblemMatches(problemId, filters, query);

  res.status(200).json({
    status: 'success',
    data: result
  });
});

const getInnovationMatches = catchAsync(async (req, res, next) => {
  const { innovationId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const innovation = await Innovation.findById(innovationId);
  if (!innovation) {
    return next(new AppError('Innovation not found', 404));
  }

  if (innovation.status !== 'PUBLISHED') {
    return next(new AppError('Matches are only available for published innovations', 404));
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = (async () => {
    const rawMatches = await Match.find({ innovationId })
      .populate('problemId', 'problemTitle problemDescription category status postedBy coverImage')
      .sort({ matchScore: -1 });

    const validMatches = rawMatches.filter(m => m.problemId && m.problemId.status === 'PUBLISHED');
    const totalCount = validMatches.length;
    const matches = validMatches.slice(skip, skip + parseInt(limit));

    return {
      matches,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      }
    };
  })();

  const filters = { page, limit };
  const result = await getCachedInnovationMatches(innovationId, filters, query);

  res.status(200).json({
    status: 'success',
    data: result
  });
});

const getApprovedNodalOrgs = catchAsync(async (req, res, next) => {
  const nodalOrgs = await User.find({
    role: 'NO',
    status: 'APPROVED'
  })
    .select('_id fullName')
    .lean();

  const nodalOrgProfiles = await NodalOrgProfile.find({
    userId: { $in: nodalOrgs.map(org => org._id) }
  })
    .select('userId orgName orgType hqState')
    .lean();

  const profileMap = new Map(nodalOrgProfiles.map(p => [p.userId.toString(), p]));

  const result = nodalOrgs.map(org => {
    const profile = profileMap.get(org._id.toString());
    return {
      id: org._id,
      organizationName: profile?.orgName || org.fullName,
      orgType: profile?.orgType,
      hqState: profile?.hqState
    };
  }).sort((a, b) => a.organizationName.localeCompare(b.organizationName));

  res.status(200).json({
    status: 'success',
    data: {
      nodalOrganizations: result
    }
  });
});

const getApprovedAos = catchAsync(async (req, res, next) => {
  const aoUsers = await User.find({ role: 'AO', status: 'APPROVED' })
    .select('_id fullName')
    .lean();

  const aoProfiles = await AoProfile.find({
    userId: { $in: aoUsers.map(ao => ao._id) }
  })
    .select('userId orgName orgType state')
    .lean();

  const profileMap = new Map(aoProfiles.map(p => [p.userId.toString(), p]));

  const result = aoUsers.map(ao => {
    const profile = profileMap.get(ao._id.toString());
    return {
      id: ao._id,
      organizationName: profile?.orgName || ao.fullName,
      orgType: profile?.orgType,
      state: profile?.state
    };
  }).sort((a, b) => a.organizationName.localeCompare(b.organizationName));

  res.status(200).json({
    status: 'success',
    data: { affiliatedOrganizations: result }
  });
});

const getInnovationFacets = catchAsync(async (req, res, next) => {
  const { category } = req.query;

  const matchStage = { status: 'PUBLISHED' };
  if (category) {
    if (category === 'others') {
      matchStage.categoryOther = { $exists: true, $ne: '' };
    } else {
      matchStage.category = category;
    }
  }

  const pipeline = [
    { $match: matchStage },
    {
      $facet: {
        subCategories: [
          { $unwind: '$subcategory' },
          { $group: { _id: '$subcategory' } },
          { $sort: { _id: 1 } }
        ],
        operations: [
          { $unwind: '$coveredOperations' },
          { $group: { _id: '$coveredOperations' } },
          { $sort: { _id: 1 } }
        ],
        states: [
          { $unwind: '$salesLocation' },
          { $group: { _id: '$salesLocation' } },
          { $sort: { _id: 1 } }
        ],
        hasSubcategoryOther: [
          { $match: { subcategoryOther: { $exists: true, $ne: '' } } },
          { $count: 'count' }
        ]
      }
    }
  ];

  const result = await Innovation.aggregate(pipeline);
  const data = result[0] || { subCategories: [], operations: [], states: [], hasSubcategoryOther: [] };

  const subCategories = data.subCategories.map(d => d._id).filter(Boolean);
  if (data.hasSubcategoryOther?.[0]?.count > 0 && !subCategories.includes('others')) {
    subCategories.push('others');
  }

  res.status(200).json({
    status: 'success',
    data: {
      subCategories,
      operations: data.operations.map(d => d._id).filter(Boolean),
      states: data.states.map(d => d._id).filter(Boolean),
    }
  });
});

const getSimilarInnovations = catchAsync(async (req, res, next) => {
  const { innovationId } = req.params;

  const innovation = await Innovation.findById(innovationId)
    .select('category subcategory coveredOperations status');

  if (!innovation) return next(new AppError('Innovation not found', 404));
  if (innovation.status !== 'PUBLISHED')
    return next(new AppError('Only available for published innovations', 404));

  const categories    = innovation.category         ?? [];
  const subcategories = innovation.subcategory      ?? [];
  const operations    = innovation.coveredOperations ?? [];

  const orConditions = [
    ...(categories.length    ? [{ category:         { $in: categories    } }] : []),
    ...(subcategories.length ? [{ subcategory:       { $in: subcategories } }] : []),
    ...(operations.length    ? [{ coveredOperations: { $in: operations    } }] : []),
  ];

  if (orConditions.length === 0) {
    return res.status(200).json({ status: 'success', data: { innovations: [] } });
  }

  const similar = await Innovation.aggregate([
    {
      $match: {
        _id: { $ne: innovation._id },
        status: 'PUBLISHED',
        $or: orConditions
      }
    },
    {
      $addFields: {
        relevanceScore: {
          $add: [
            { $multiply: [3, { $size: { $ifNull: [{ $setIntersection: ['$category',         categories    ] }, []] } }] },
            { $multiply: [2, { $size: { $ifNull: [{ $setIntersection: ['$subcategory',       subcategories ] }, []] } }] },
            { $multiply: [1, { $size: { $ifNull: [{ $setIntersection: ['$coveredOperations', operations    ] }, []] } }] },
          ]
        },
        thumbnail: { $arrayElemAt: ['$media.images.url', 0] }
      }
    },
    { $sort: { relevanceScore: -1 } },
    { $limit: 3 },
    { $project: { innovationName: 1, description: 1, thumbnail: 1, category: 1, relevanceScore: 1 } }
  ]);

  res.status(200).json({
    status: 'success',
    data: { innovations: similar }
  });
});

const getPublishedVles = catchAsync(async (req, res, next) => {
  const { search, state, gender, persona, category, vleStatus, page = 1, limit = 9 } = req.query;

  // Step 1: filter on VleProfile fields
  const profileFilter = {};
  if (state) profileFilter.state = state;
  if (gender) profileFilter.gender = gender;
  if (persona) profileFilter.interestedPersonas = { $in: [persona] };
  if (category) profileFilter.vleCategory = category;
  profileFilter.vleStatus = vleStatus ? vleStatus : { $in: ['active', 'commercial'] };

  const profiles = await VleProfile.find(profileFilter).select('userId').lean();
  const userIdFilter = profiles.map(p => p.userId);

  // Step 2: filter Users
  const userFilter = { role: 'VLE', status: 'APPROVED', _id: { $in: userIdFilter } };
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    const stateCodes = findStateCodesByName(search);
    const distCodes = findDistrictCodesByName(search);

    // VLEs (within the structured candidate set) whose location matches the search term
    const locOr = [{ village: rx }];
    if (stateCodes.length) locOr.push({ state: { $in: stateCodes } });
    if (distCodes.length) locOr.push({ district: { $in: distCodes } });
    const locUserIds = (await VleProfile.find({ ...profileFilter, $or: locOr }).select('userId').lean())
      .map(p => p.userId);

    userFilter.$or = [
      { fullName: rx },
      { email: rx },
      ...(locUserIds.length ? [{ _id: { $in: locUserIds } }] : []),
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(userFilter)
      .select('fullName profilePicture')
      .sort({ signUpDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments(userFilter)
  ]);

  // Step 3: attach profiles
  const vleProfiles = await VleProfile.find({ userId: { $in: users.map(u => u._id) } })
    .select('userId village district state languages mainLivelihood vleCategory')
    .lean();
  const profileMap = new Map(vleProfiles.map(p => [p.userId.toString(), p]));
  const vles = users.map(u => ({ ...u, profile: profileMap.get(u._id.toString()) || null }));

  res.status(200).json({
    status: 'success',
    data: {
      vles,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    }
  });
});

module.exports = {
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
};
