const catchAsync = require('../../../utils/catchAsync');
const { getStateName, getDistrictName } = require('../../../utils/LocationData/locationData');
const User = require('../../../models/User');
const VleProfile = require('../../../models/VleProfile');
const AoProfile = require('../../../models/AoProfile');
const NodalOrgProfile = require('../../../models/NodalOrgProfile');
const InnovatorProfile = require('../../../models/InnovatorProfile');
const Innovation = require('../../../models/Innovation');
const InnovationRequest = require('../../../models/InnovationRequest');
const Match = require('../../../models/Match');
const ContactView = require('../../../models/ContactView');
const Pilot = require('../../../models/Pilot');

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// ISO week key helper — "YYYY-Www" (shared by analytics controllers)
function isoWeekKey(d) {
  const tmp = new Date(d);
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() + 3 - (tmp.getDay() + 6) % 7);
  const jan4 = new Date(tmp.getFullYear(), 0, 4);
  const wk = 1 + Math.round(((tmp - jan4) / 86400000 - 3 + (jan4.getDay() + 6) % 7) / 7);
  return `${tmp.getFullYear()}-W${String(wk).padStart(2, '0')}`;
}

// Build 4-week bounds array: Week 1 (oldest) → Week 4 (most recent)
function buildWeekBounds() {
  const now = Date.now();
  return [0, 1, 2, 3].map(i => ({
    label: `Week ${i + 1}`,
    start: new Date(now - (4 - i) * WEEK_MS),
    end:   new Date(now - (3 - i) * WEEK_MS),
  }));
}

// ─── Summary Stats ────────────────────────────────────────────────────────────

const getSummaryStats = async () => {
  const [
    totalNOs,
    totalAOs,
    registeredVLEs,
    innovators,
    activeVLEs,
    commercialVLEs,
    villages,
    innovationsLive,
    problemsRegistered,
    resolvedProblemIds,
  ] = await Promise.all([
    User.countDocuments({ role: 'NO', status: 'APPROVED' }),
    User.countDocuments({ role: 'AO', status: 'APPROVED' }),
    User.countDocuments({ role: 'VLE', status: 'APPROVED' }),
    User.countDocuments({ role: 'INNOVATOR', status: 'APPROVED' }),
    VleProfile.countDocuments({ vleStatus: 'active' }),
    VleProfile.countDocuments({ vleStatus: 'commercial' }),
    VleProfile.distinct('village'),
    Innovation.countDocuments({ status: 'PUBLISHED' }),
    InnovationRequest.countDocuments({ status: 'PUBLISHED' }),
    Pilot.distinct('problemId', { status: 'IMPLEMENTED', problemId: { $ne: null } }),
  ]);

  return {
    totalNOs,
    totalAOs,
    registeredVLEs,
    innovators,
    activeVLEs,
    commercialVLEs,
    villagesCovered: villages.filter(Boolean).length,
    innovationsLive,
    problemsRegistered,
    problemsResolved: resolvedProblemIds.length,
  };
};

// ─── Problem Trend (last 4 weeks: registered vs resolved) ────────────────────

const getProblemTrend = async (weekBounds) => {
  const results = await Promise.all(
    weekBounds.flatMap(w => [
      InnovationRequest.countDocuments({ createdAt: { $gte: w.start, $lt: w.end } }),
      Pilot.countDocuments({ status: 'IMPLEMENTED', implementedAt: { $gte: w.start, $lt: w.end } }),
    ])
  );

  return weekBounds.map((w, i) => ({
    week: w.label,
    registered: results[i * 2],
    resolved: results[i * 2 + 1],
  }));
};

// ─── Innovation & Innovator Trend (last 4 weeks) ──────────────────────────────

const getInnovationTrend = async (weekBounds) => {
  const results = await Promise.all(
    weekBounds.flatMap(w => [
      Innovation.countDocuments({ createdAt: { $gte: w.start, $lt: w.end } }),
      User.countDocuments({ role: 'INNOVATOR', createdAt: { $gte: w.start, $lt: w.end } }),
    ])
  );

  return weekBounds.map((w, i) => ({
    week: w.label,
    innovations: results[i * 2],
    innovators: results[i * 2 + 1],
  }));
};

// ─── VLE-Innovator Contact Trend (last 4 weeks) ───────────────────────────────

const getVleInnovatorTrend = async (weekBounds) => {
  const results = await Promise.all(
    weekBounds.map(w => ContactView.countDocuments({ createdAt: { $gte: w.start, $lt: w.end } }))
  );

  return weekBounds.map((w, i) => ({ week: w.label, contacts: results[i] }));
};

// ─── Category Stats ───────────────────────────────────────────────────────────

const CATEGORIES = ['agriculture', 'textiles', 'fisheries', 'bamboo', 'poultry', 'dairy'];

const getCategoryStats = async () => {
  const [
    innovationsByCat,
    problemsByCat,
    resolvedByCat,
    otherInnovations,
    otherProblems,
    otherResolvedResult,
  ] = await Promise.all([
    // Innovation.category is an array — must $unwind before grouping
    Innovation.aggregate([
      { $match: { status: 'PUBLISHED' } },
      { $unwind: '$category' },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
    InnovationRequest.aggregate([
      { $match: { status: 'PUBLISHED' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
    Pilot.aggregate([
      { $match: { status: 'IMPLEMENTED', problemId: { $ne: null } } },
      {
        $lookup: {
          from: 'innovationrequests',
          localField: 'problemId',
          foreignField: '_id',
          as: 'problem',
        },
      },
      { $unwind: '$problem' },
      { $group: { _id: '$problem.category', count: { $sum: 1 } } },
    ]),
    // "Other" category — identified explicitly by categoryOther field being present
    Innovation.countDocuments({ status: 'PUBLISHED', categoryOther: { $exists: true, $ne: null } }),
    InnovationRequest.countDocuments({ status: 'PUBLISHED', categoryOther: { $exists: true, $ne: null } }),
    Pilot.aggregate([
      { $match: { status: 'IMPLEMENTED', problemId: { $ne: null } } },
      {
        $lookup: {
          from: 'innovationrequests',
          localField: 'problemId',
          foreignField: '_id',
          as: 'problem',
        },
      },
      { $unwind: '$problem' },
      { $match: { 'problem.categoryOther': { $exists: true, $ne: null } } },
      { $count: 'total' },
    ]),
  ]);

  const result = {};
  CATEGORIES.forEach(cat => { result[cat] = { problems: 0, innovations: 0, resolved: 0 }; });
  innovationsByCat.forEach(r => { if (result[r._id]) result[r._id].innovations = r.count; });
  problemsByCat.forEach(r => { if (result[r._id]) result[r._id].problems = r.count; });
  resolvedByCat.forEach(r => { if (result[r._id]) result[r._id].resolved = r.count; });
  result['other'] = {
    innovations: otherInnovations,
    problems:    otherProblems,
    resolved:    otherResolvedResult[0]?.total ?? 0,
  };

  return result;
};

// ─── Pipeline Stats ───────────────────────────────────────────────────────────

const getPipelineStats = async () => {
  const [registered, mappedIds, trialIds, implementedIds] = await Promise.all([
    Innovation.countDocuments({ status: 'PUBLISHED' }),
    Pilot.distinct('innovationId', { status: 'PILOT_STARTED' }),
    Pilot.distinct('innovationId', { status: 'TRIAL_STARTED' }),
    Pilot.distinct('innovationId', { status: 'IMPLEMENTED' }),
  ]);

  // noActivity: PUBLISHED innovations not in any of the 3 active stages
  const activeSet = new Set([...mappedIds, ...trialIds, ...implementedIds].map(String));
  const allPublishedIds = await Innovation.distinct('_id', { status: 'PUBLISHED' });
  const noActivity = allPublishedIds.filter(id => !activeSet.has(String(id))).length;

  return {
    registered,
    mappedToProblems: mappedIds.length,
    underTrial: trialIds.length,
    implemented: implementedIds.length,
    noActivity,
  };
};

// ─── Ecosystem Analytics (filtered, with date range + location) ──────────────

const getEcosystemAnalytics = catchAsync(async (req, res) => {
  const { startDate, endDate, state } = req.query;

  // Date bounds — default: first day of 5 months ago → now
  const end = endDate ? new Date(endDate) : new Date();
  const defaultStart = new Date();
  defaultStart.setMonth(defaultStart.getMonth() - 5);
  defaultStart.setDate(1);
  defaultStart.setHours(0, 0, 0, 0);
  const start = startDate ? new Date(startDate) : defaultStart;

  // Granularity: daily ≤14d, weekly ≤90d, monthly ≤730d (~2yr), yearly otherwise
  const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
  const isDaily  = daysDiff <= 14;
  const isWeekly = !isDaily && daysDiff <= 90;
  const isYearly = !isDaily && !isWeekly && daysDiff > 730;

  // Location filtering — per-role user ID sets from their respective profile models
  let vleIdFilter = {}, aoIdFilter = {}, noIdFilter = {};
  if (state) {
    const profileFilter = { state };
    const [vleIds, aoIds, noIds] = await Promise.all([
      VleProfile.distinct('userId', profileFilter),
      AoProfile.distinct('userId', profileFilter),
      NodalOrgProfile.distinct('userId', { hqState: state }), // NO uses hqState, no district filter
    ]);
    vleIdFilter = { _id: { $in: vleIds } };
    aoIdFilter  = { _id: { $in: aoIds } };
    noIdFilter  = { _id: { $in: noIds } };
  }

  // 3 parallel aggregations — one per role with its own ID filter
  const makeAgg = (role, idFilter) => User.aggregate([
    { $match: { role, status: 'APPROVED', createdAt: { $gte: start, $lte: end }, ...idFilter } },
    {
      $group: {
        _id: isWeekly
          ? { year: { $isoWeekYear: '$createdAt' }, week: { $isoWeek: '$createdAt' } }
          : { $dateToString: { format: isDaily ? '%Y-%m-%d' : isYearly ? '%Y' : '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const [vleRows, aoRows, noRows] = await Promise.all([
    makeAgg('VLE', vleIdFilter),
    makeAgg('AO',  aoIdFilter),
    makeAgg('NO',  noIdFilter),
  ]);

  // Build scaffold — every time bucket between start and end, defaulting to 0
  const scaffold = {};
  if (isDaily) {
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);
    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10);
      scaffold[key] = { label: `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getDate()}`, VLE: 0, AO: 0, NO: 0 };
      cursor.setDate(cursor.getDate() + 1);
    }
  } else if (isWeekly) {
    // Align cursor to Monday of the week containing `start`
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);
    const dow = cursor.getDay();
    cursor.setDate(cursor.getDate() - (dow === 0 ? 6 : dow - 1));
    while (cursor <= end) {
      const key = isoWeekKey(cursor);
      scaffold[key] = { label: `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getDate()}`, VLE: 0, AO: 0, NO: 0 };
      cursor.setDate(cursor.getDate() + 7);
    }
  } else if (isYearly) {
    for (let yr = start.getFullYear(); yr <= end.getFullYear(); yr++) {
      const key = String(yr);
      scaffold[key] = { label: key, VLE: 0, AO: 0, NO: 0 };
    }
  } else {
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMark = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cursor <= endMark) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      scaffold[key] = { label: `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`, VLE: 0, AO: 0, NO: 0 };
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  if (isWeekly) {
    const wKey = (r) => `${r._id.year}-W${String(r._id.week).padStart(2, '0')}`;
    vleRows.forEach(r => { if (scaffold[wKey(r)]) scaffold[wKey(r)].VLE = r.count; });
    aoRows.forEach(r  => { if (scaffold[wKey(r)]) scaffold[wKey(r)].AO  = r.count; });
    noRows.forEach(r  => { if (scaffold[wKey(r)]) scaffold[wKey(r)].NO  = r.count; });
  } else {
    vleRows.forEach(r => { if (scaffold[r._id]) scaffold[r._id].VLE = r.count; });
    aoRows.forEach(r  => { if (scaffold[r._id]) scaffold[r._id].AO  = r.count; });
    noRows.forEach(r  => { if (scaffold[r._id]) scaffold[r._id].NO  = r.count; });
  }

  res.status(200).json({
    status: 'success',
    data: { granularity: isDaily ? 'day' : isWeekly ? 'week' : isYearly ? 'year' : 'month', items: Object.values(scaffold) },
  });
});

// ─── Main Controller ──────────────────────────────────────────────────────────

const getAllAnalytics = catchAsync(async (req, res) => {
  const weekBounds = buildWeekBounds();

  const [
    summary,
    problemTrend,
    innovationTrend,
    vleInnovatorTrend,
    categoryStats,
    pipeline,
  ] = await Promise.all([
    getSummaryStats(),
    getProblemTrend(weekBounds),
    getInnovationTrend(weekBounds),
    getVleInnovatorTrend(weekBounds),
    getCategoryStats(),
    getPipelineStats(),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      summary,
      problemTrend,
      innovationTrend,
      vleInnovatorTrend,
      categoryStats,
      pipeline,
    },
  });
});

// ─── Problem Analytics (filtered, with date range) ───────────────────────────

const getProblemAnalytics = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  const end = endDate ? new Date(endDate) : new Date();
  const defaultStart = new Date();
  defaultStart.setMonth(defaultStart.getMonth() - 5);
  defaultStart.setDate(1);
  defaultStart.setHours(0, 0, 0, 0);
  const start = startDate ? new Date(startDate) : defaultStart;

  // Same granularity thresholds as ecosystem
  const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
  const isDaily  = daysDiff <= 14;
  const isWeekly = !isDaily && daysDiff <= 90;
  const isYearly = !isDaily && !isWeekly && daysDiff > 730;

  const dateField = (field) => isWeekly
    ? { year: { $isoWeekYear: `$${field}` }, week: { $isoWeek: `$${field}` } }
    : { $dateToString: { format: isDaily ? '%Y-%m-%d' : isYearly ? '%Y' : '%Y-%m', date: `$${field}` } };

  // Registered: InnovationRequest by createdAt
  // Resolved:   Pilot (IMPLEMENTED) by implementedAt
  const [regRows, resRows] = await Promise.all([
    InnovationRequest.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: dateField('createdAt'), count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Pilot.aggregate([
      { $match: { status: 'IMPLEMENTED', implementedAt: { $gte: start, $lte: end, $ne: null } } },
      { $group: { _id: dateField('implementedAt'), count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // Build scaffold
  const scaffold = {};
  if (isDaily) {
    const cursor = new Date(start); cursor.setHours(0, 0, 0, 0);
    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10);
      scaffold[key] = { label: `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getDate()}`, registered: 0, resolved: 0 };
      cursor.setDate(cursor.getDate() + 1);
    }
  } else if (isWeekly) {
    const cursor = new Date(start); cursor.setHours(0, 0, 0, 0);
    const dow = cursor.getDay();
    cursor.setDate(cursor.getDate() - (dow === 0 ? 6 : dow - 1));
    while (cursor <= end) {
      const key = isoWeekKey(cursor);
      scaffold[key] = { label: `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getDate()}`, registered: 0, resolved: 0 };
      cursor.setDate(cursor.getDate() + 7);
    }
  } else if (isYearly) {
    for (let yr = start.getFullYear(); yr <= end.getFullYear(); yr++) {
      const key = String(yr);
      scaffold[key] = { label: key, registered: 0, resolved: 0 };
    }
  } else {
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMark = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cursor <= endMark) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      scaffold[key] = { label: `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`, registered: 0, resolved: 0 };
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  if (isWeekly) {
    const wKey = (r) => `${r._id.year}-W${String(r._id.week).padStart(2, '0')}`;
    regRows.forEach(r => { if (scaffold[wKey(r)]) scaffold[wKey(r)].registered = r.count; });
    resRows.forEach(r => { if (scaffold[wKey(r)]) scaffold[wKey(r)].resolved   = r.count; });
  } else {
    regRows.forEach(r => { if (scaffold[r._id]) scaffold[r._id].registered = r.count; });
    resRows.forEach(r => { if (scaffold[r._id]) scaffold[r._id].resolved   = r.count; });
  }

  res.status(200).json({
    status: 'success',
    data: { granularity: isDaily ? 'day' : isWeekly ? 'week' : isYearly ? 'year' : 'month', items: Object.values(scaffold) },
  });
});

// ─── Shared helper: build date range scaffold + run single-metric aggregation ─

function buildScaffold(start, end, isDaily, isWeekly, isYearly) {
  const scaffold = {};
  if (isDaily) {
    const cursor = new Date(start); cursor.setHours(0, 0, 0, 0);
    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10);
      scaffold[key] = { label: `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getDate()}`, count: 0 };
      cursor.setDate(cursor.getDate() + 1);
    }
  } else if (isWeekly) {
    const cursor = new Date(start); cursor.setHours(0, 0, 0, 0);
    const dow = cursor.getDay();
    cursor.setDate(cursor.getDate() - (dow === 0 ? 6 : dow - 1));
    while (cursor <= end) {
      const key = isoWeekKey(cursor);
      scaffold[key] = { label: `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getDate()}`, count: 0 };
      cursor.setDate(cursor.getDate() + 7);
    }
  } else if (isYearly) {
    for (let yr = start.getFullYear(); yr <= end.getFullYear(); yr++) {
      const key = String(yr);
      scaffold[key] = { label: key, count: 0 };
    }
  } else {
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMark = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cursor <= endMark) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      scaffold[key] = { label: `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`, count: 0 };
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }
  return scaffold;
}

async function runTrendAnalytics(req, res, Model, matchExtra, dateFieldName) {
  const { startDate, endDate } = req.query;

  const end = endDate ? new Date(endDate) : new Date();
  const defaultStart = new Date();
  defaultStart.setMonth(defaultStart.getMonth() - 5);
  defaultStart.setDate(1);
  defaultStart.setHours(0, 0, 0, 0);
  const start = startDate ? new Date(startDate) : defaultStart;

  const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
  const isDaily  = daysDiff <= 14;
  const isWeekly = !isDaily && daysDiff <= 90;
  const isYearly = !isDaily && !isWeekly && daysDiff > 730;

  const dateField = isWeekly
    ? { year: { $isoWeekYear: `$${dateFieldName}` }, week: { $isoWeek: `$${dateFieldName}` } }
    : { $dateToString: { format: isDaily ? '%Y-%m-%d' : isYearly ? '%Y' : '%Y-%m', date: `$${dateFieldName}` } };

  const rows = await Model.aggregate([
    { $match: { [dateFieldName]: { $gte: start, $lte: end }, ...matchExtra } },
    { $group: { _id: dateField, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const scaffold = buildScaffold(start, end, isDaily, isWeekly, isYearly);

  if (isWeekly) {
    const wKey = (r) => `${r._id.year}-W${String(r._id.week).padStart(2, '0')}`;
    rows.forEach(r => { if (scaffold[wKey(r)]) scaffold[wKey(r)].count = r.count; });
  } else {
    rows.forEach(r => { if (scaffold[r._id]) scaffold[r._id].count = r.count; });
  }

  res.status(200).json({
    status: 'success',
    data: { granularity: isDaily ? 'day' : isWeekly ? 'week' : isYearly ? 'year' : 'month', items: Object.values(scaffold) },
  });
}

// ─── Innovation Trend (Innovation.createdAt) ──────────────────────────────────

const getInnovationTrendAnalytics = catchAsync((req, res) =>
  runTrendAnalytics(req, res, Innovation, {}, 'createdAt')
);

// ─── Innovator Trend (User[role=INNOVATOR].createdAt) ─────────────────────────

const getInnovatorTrendAnalytics = catchAsync((req, res) =>
  runTrendAnalytics(req, res, User, { role: 'INNOVATOR' }, 'createdAt')
);

// ─── VLE-Innovator Contact Trend (ContactView.viewedAt) ──────────────────────

const getVleContactTrendAnalytics = catchAsync((req, res) =>
  runTrendAnalytics(req, res, ContactView, {}, 'createdAt')
);

// ─── Category Analytics ───────────────────────────────────────────────────────

const getCategoryAnalytics = catchAsync(async (req, res) => {
  const [categoryStats, problemsRegistered, resolvedIds] = await Promise.all([
    getCategoryStats(),
    InnovationRequest.countDocuments({ status: 'PUBLISHED' }),
    Pilot.distinct('problemId', { status: 'IMPLEMENTED', problemId: { $ne: null } }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      categoryStats,
      problemsRegistered,
      problemsResolved: resolvedIds.length,
    },
  });
});

// ─── Pipeline Analytics ───────────────────────────────────────────────────────

const getPipelineAnalytics = catchAsync(async (req, res) => {
  const pipeline = await getPipelineStats();
  res.status(200).json({ status: 'success', data: pipeline });
});

// ─── State Breakdown Analytics ────────────────────────────────────────────────

const getStateBreakdownAnalytics = catchAsync(async (req, res) => {
  const [vleRows, commercialRows, aoRows, noRows, innovatorRows, resolvedRows] = await Promise.all([
    VleProfile.aggregate([{ $group: { _id: '$state', count: { $sum: 1 } } }]),
    VleProfile.aggregate([{ $match: { vleStatus: 'commercial' } }, { $group: { _id: '$state', count: { $sum: 1 } } }]),
    AoProfile.aggregate([{ $group: { _id: '$state', count: { $sum: 1 } } }]),
    NodalOrgProfile.aggregate([{ $group: { _id: '$hqState', count: { $sum: 1 } } }]),
    InnovatorProfile.aggregate([{ $group: { _id: '$state', count: { $sum: 1 } } }]),
    Pilot.aggregate([
      { $match: { status: 'IMPLEMENTED' } },
      { $lookup: { from: 'vleprofiles', localField: 'vleId', foreignField: 'userId', as: 'vle' } },
      { $unwind: '$vle' },
      { $group: { _id: '$vle.state', count: { $sum: 1 } } },
    ]),
  ]);

  const byState = {};
  const get = (code) => {
    if (!byState[code]) byState[code] = { nos: 0, aos: 0, vles: 0, innovators: 0, commercial: 0, resolved: 0 };
    return byState[code];
  };
  vleRows.forEach(r => { if (r._id) get(r._id).vles = r.count; });
  commercialRows.forEach(r => { if (r._id) get(r._id).commercial = r.count; });
  aoRows.forEach(r => { if (r._id) get(r._id).aos = r.count; });
  noRows.forEach(r => { if (r._id) get(r._id).nos = r.count; });
  innovatorRows.forEach(r => { if (r._id) get(r._id).innovators = r.count; });
  resolvedRows.forEach(r => { if (r._id) get(r._id).resolved = r.count; });

  res.status(200).json({ status: 'success', data: byState });
});

// ─── Report Exports (CSV downloads) ──────────────────────────────────────────

const { AppError } = require('../../../utils/errorHandler');

const exportProblemsReport = catchAsync(async (req, res, next) => {
  const problems = await InnovationRequest.find({ status: 'PUBLISHED' })
    .sort({ createdAt: -1 })
    .populate('postedBy', 'fullName')
    .select('problemTitle postedBy category categoryOther valueChainStages operationsUndertaken regionState regionDistrict')
    .lean();

  if (!problems.length) return next(new AppError('No problems found to export', 404));

  // VLE → AO → NO hierarchy lookup (same as getAdminProblemsList)
  const posterIds = problems.map(p => p.postedBy?._id).filter(Boolean);
  const vleProfiles = await VleProfile.find({ userId: { $in: posterIds } }).select('userId affiliatedOrg').lean();
  const vleIdSet = new Set(vleProfiles.map(v => v.userId.toString()));
  const vleAffMap = new Map(vleProfiles.map(v => [v.userId.toString(), v.affiliatedOrg?.toString()]));
  const vleAffOrgIds = vleProfiles.map(v => v.affiliatedOrg).filter(Boolean);
  const nonVleIds = posterIds.filter(id => !vleIdSet.has(id.toString()));
  const noDirectProfiles = nonVleIds.length
    ? await NodalOrgProfile.find({ userId: { $in: nonVleIds } }).select('userId orgName').lean()
    : [];
  const noIdSet = new Set(noDirectProfiles.map(n => n.userId.toString()));
  const noOrgNameMap = new Map(noDirectProfiles.map(n => [n.userId.toString(), n.orgName]));
  const aoDirectIds = nonVleIds.filter(id => !noIdSet.has(id.toString()));
  const allAoIds = [...new Set([...vleAffOrgIds, ...aoDirectIds].map(id => id.toString()))];
  const aoProfiles = allAoIds.length
    ? await AoProfile.find({ userId: { $in: allAoIds } }).select('userId orgName nodalOrg').lean()
    : [];
  const aoOrgNameMap = new Map(aoProfiles.map(a => [a.userId.toString(), a.orgName]));
  const aoNodalMap = new Map(aoProfiles.map(a => [a.userId.toString(), a.nodalOrg?.toString()]));
  const nodalOrgIds = [...new Set(aoProfiles.map(a => a.nodalOrg).filter(Boolean).map(id => id.toString()))];
  const nodalOrgProfiles = nodalOrgIds.length
    ? await NodalOrgProfile.find({ userId: { $in: nodalOrgIds } }).select('userId orgName').lean()
    : [];
  const nodalOrgNameMap = new Map(nodalOrgProfiles.map(p => [p.userId.toString(), p.orgName]));

  const rows = ['Name of User,Title,Category,Sub Category,Operations,State,District,Nodal Org,Affiliated Org'];
  problems.forEach(p => {
    const posterId = p.postedBy?._id?.toString();
    const isVle = vleIdSet.has(posterId);
    const isNo = noIdSet.has(posterId);
    const vleAoId = isVle ? vleAffMap.get(posterId) : null;
    const nameOfUser = isVle
      ? (p.postedBy?.fullName || '—')
      : isNo
        ? (noOrgNameMap.get(posterId) || '—')
        : (aoOrgNameMap.get(posterId) || '—');
    const affiliatedOrg = isVle ? (aoOrgNameMap.get(vleAoId) || '—') : '—';
    const nodalOrg = isVle
      ? (nodalOrgNameMap.get(aoNodalMap.get(vleAoId)) || '—')
      : isNo
        ? '—'
        : (nodalOrgNameMap.get(aoNodalMap.get(posterId)) || '—');
    rows.push([
      `"${nameOfUser.replace(/"/g, '""')}"`,
      `"${(p.problemTitle ?? '').replace(/"/g, '""')}"`,
      `"${(p.category || p.categoryOther || '').replace(/"/g, '""')}"`,
      `"${(p.valueChainStages ?? []).join('; ')}"`,
      `"${(p.operationsUndertaken ?? []).join('; ')}"`,
      getStateName(p.regionState) || p.regionState || '',
      getDistrictName(p.regionDistrict, p.regionState) || p.regionDistrict || '',
      `"${nodalOrg.replace(/"/g, '""')}"`,
      `"${affiliatedOrg.replace(/"/g, '""')}"`,
    ].join(','));
  });

  res.header('Content-Type', 'text/csv');
  res.header('Content-Disposition', `attachment; filename=problems-report-${Date.now()}.csv`);
  res.status(200).send(rows.join('\n'));
});

const exportInnovationsReport = catchAsync(async (req, res, next) => {
  const innovations = await Innovation.find({ status: 'PUBLISHED' })
    .sort({ createdAt: -1 })
    .populate('innovatorId', 'fullName')
    .select('innovationName category subcategory salesLocation innovatorId')
    .lean();

  if (!innovations.length) return next(new AppError('No innovations found to export', 404));

  const innovatorIds = innovations.map(i => i.innovatorId?._id).filter(Boolean);
  const [innovatorProfiles, implementedCounts] = await Promise.all([
    InnovatorProfile.find({ userId: { $in: innovatorIds } }).select('userId enterpriseName').lean(),
    Pilot.aggregate([
      { $match: { status: 'IMPLEMENTED' } },
      { $group: { _id: '$innovationId', count: { $sum: 1 } } }
    ])
  ]);
  const enterpriseMap = new Map(innovatorProfiles.map(p => [p.userId.toString(), p.enterpriseName]));
  const implMap = new Map(implementedCounts.map(e => [e._id.toString(), e.count]));

  const rows = ['Innovation Name,Innovator,Category,Sub Category,Sales Locations,Implemented'];
  innovations.forEach(inv => {
    const invId = inv.innovatorId?._id?.toString();
    const enterprise = invId ? enterpriseMap.get(invId) : null;
    const innovatorName = (enterprise && enterprise !== 'NA') ? enterprise : (inv.innovatorId?.fullName || '—');
    rows.push([
      `"${(inv.innovationName ?? '').replace(/"/g, '""')}"`,
      `"${innovatorName.replace(/"/g, '""')}"`,
      `"${(inv.category ?? []).join('; ')}"`,
      `"${(inv.subcategory ?? []).join('; ')}"`,
      `"${(inv.salesLocation ?? []).map(code => getStateName(code) || code).join('; ')}"`,
      implMap.get(inv._id.toString()) ?? 0,
    ].join(','));
  });

  res.header('Content-Type', 'text/csv');
  res.header('Content-Disposition', `attachment; filename=innovations-report-${Date.now()}.csv`);
  res.status(200).send(rows.join('\n'));
});

const exportVLEsReport = catchAsync(async (req, res, next) => {
  const vles = await User.find({ role: 'VLE', status: 'APPROVED' })
    .sort({ signUpDate: -1 })
    .select('fullName email phone')
    .lean();

  if (!vles.length) return next(new AppError('No VLEs found to export', 404));

  const vleIds = vles.map(v => v._id);
  const [profiles, probCounts] = await Promise.all([
    VleProfile.find({ userId: { $in: vleIds } })
      .select('userId vleStatus gender state district village mobile interestedPersonas trainings')
      .lean(),
    InnovationRequest.aggregate([
      { $match: { postedBy: { $in: vleIds } } },
      { $group: { _id: '$postedBy', count: { $sum: 1 } } }
    ])
  ]);
  const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));
  const probMap = new Map(probCounts.map(e => [e._id.toString(), e.count]));

  const rows = ['Name,Status,Gender,Problems,State,District,Village,Mobile,Email,Persona,IG Training'];
  vles.forEach(v => {
    const id = v._id.toString();
    const profile = profileMap.get(id) || {};
    rows.push([
      `"${(v.fullName ?? '').replace(/"/g, '""')}"`,
      profile.vleStatus ?? 'listed',
      profile.gender ?? '',
      probMap.get(id) ?? 0,
      getStateName(profile.state) || profile.state || '',
      getDistrictName(profile.district, profile.state) || profile.district || '',
      `"${(profile.village ?? '').replace(/"/g, '""')}"`,
      profile.mobile ?? v.phone ?? '',
      v.email ?? '',
      `"${(profile.interestedPersonas ?? []).join('; ')}"`,
      `"${(profile.trainings ?? []).join('; ')}"`,
    ].join(','));
  });

  res.header('Content-Type', 'text/csv');
  res.header('Content-Disposition', `attachment; filename=vle-report-${Date.now()}.csv`);
  res.status(200).send(rows.join('\n'));
});

const exportAOsReport = catchAsync(async (req, res, next) => {
  const approvedAoUsers = await User.find({ role: 'AO', status: 'APPROVED' })
    .sort({ signUpDate: -1 })
    .select('_id')
    .lean();

  if (!approvedAoUsers.length) return next(new AppError('No AOs found to export', 404));

  const aoUserIds = approvedAoUsers.map(u => u._id);

  const [aoProfiles, vleCounts, directProbAgg, vleProfiles] = await Promise.all([
    AoProfile.find({ userId: { $in: aoUserIds } }).select('userId orgName state district pocName').lean(),
    VleProfile.aggregate([
      { $match: { affiliatedOrg: { $in: aoUserIds } } },
      { $group: { _id: '$affiliatedOrg', count: { $sum: 1 } } }
    ]),
    InnovationRequest.aggregate([
      { $match: { postedBy: { $in: aoUserIds } } },
      { $group: { _id: '$postedBy', count: { $sum: 1 } } }
    ]),
    VleProfile.find({ affiliatedOrg: { $in: aoUserIds } }).select('userId affiliatedOrg').lean()
  ]);

  const profileMap = new Map(aoProfiles.map(p => [p.userId.toString(), p]));
  const vleCountMap = new Map(vleCounts.map(e => [e._id.toString(), e.count]));
  const directProbMap = new Map(directProbAgg.map(e => [e._id.toString(), e.count]));

  const allVleIds = vleProfiles.map(vp => vp.userId);
  const vleToAoMap = new Map(vleProfiles.map(vp => [vp.userId.toString(), vp.affiliatedOrg.toString()]));
  const vleProbAgg = allVleIds.length
    ? await InnovationRequest.aggregate([
        { $match: { postedBy: { $in: allVleIds } } },
        { $group: { _id: '$postedBy', count: { $sum: 1 } } }
      ])
    : [];
  const vleProbByAo = {};
  vleProbAgg.forEach(({ _id, count }) => {
    const aoKey = vleToAoMap.get(_id.toString());
    if (aoKey) vleProbByAo[aoKey] = (vleProbByAo[aoKey] || 0) + count;
  });

  const rows = ['Name,State,District,PoC,No. of VLEs,No. of Problems,No. of Problems (VLE)'];
  approvedAoUsers.forEach(u => {
    const id = u._id.toString();
    const profile = profileMap.get(id) || {};
    rows.push([
      `"${(profile.orgName ?? '').replace(/"/g, '""')}"`,
      getStateName(profile.state) || profile.state || '',
      getDistrictName(profile.district, profile.state) || profile.district || '',
      `"${(profile.pocName ?? '').replace(/"/g, '""')}"`,
      vleCountMap.get(id) ?? 0,
      directProbMap.get(id) ?? 0,
      vleProbByAo[id] ?? 0,
    ].join(','));
  });

  res.header('Content-Type', 'text/csv');
  res.header('Content-Disposition', `attachment; filename=ao-report-${Date.now()}.csv`);
  res.status(200).send(rows.join('\n'));
});

const exportNOsReport = catchAsync(async (req, res, next) => {
  const approvedNoUsers = await User.find({ role: 'NO', status: 'APPROVED' })
    .sort({ signUpDate: -1 })
    .select('_id')
    .lean();

  if (!approvedNoUsers.length) return next(new AppError('No NOs found to export', 404));

  const noUserIds = approvedNoUsers.map(u => u._id);

  const [noProfiles, aoCountAgg] = await Promise.all([
    NodalOrgProfile.find({ userId: { $in: noUserIds } })
      .select('userId orgName orgType hqState operationalStates website')
      .lean(),
    AoProfile.aggregate([
      { $match: { nodalOrg: { $in: noUserIds } } },
      { $group: { _id: '$nodalOrg', count: { $sum: 1 } } }
    ])
  ]);

  const profileMap = new Map(noProfiles.map(p => [p.userId.toString(), p]));
  const aoCountMap = new Map(aoCountAgg.map(a => [a._id.toString(), a.count]));

  const rows = ['Name,AO Count,Type,HQ State,Operational States,Website'];
  approvedNoUsers.forEach(u => {
    const id = u._id.toString();
    const profile = profileMap.get(id) || {};
    rows.push([
      `"${(profile.orgName ?? '').replace(/"/g, '""')}"`,
      aoCountMap.get(id) ?? 0,
      `"${(profile.orgType ?? '').replace(/"/g, '""')}"`,
      getStateName(profile.hqState) || profile.hqState || '',
      `"${(profile.operationalStates ?? []).map(code => getStateName(code) || code).join('; ')}"`,
      `"${(profile.website ?? '').replace(/"/g, '""')}"`,
    ].join(','));
  });

  res.header('Content-Type', 'text/csv');
  res.header('Content-Disposition', `attachment; filename=no-report-${Date.now()}.csv`);
  res.status(200).send(rows.join('\n'));
});

module.exports = {
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
};
