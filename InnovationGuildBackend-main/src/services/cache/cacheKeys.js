const generateInnovationListKey = (filters) => {
  const {
    category = 'all',
    subCategory = '',
    stage = 'all',
    operation = '',
    state = '',
    search = '',
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    order = 'desc'
  } = filters;

  return `public:innovations:category:${category}:subCategory:${subCategory}:stage:${stage}:operation:${operation}:state:${state}:search:${search}:page:${page}:limit:${limit}:sortBy:${sortBy}:order:${order}`;
};

const generateInnovationDetailKey = (innovationId) => {
  return `public:innovation:${innovationId}`;
};

const generateProblemListKey = (filters) => {
  const {
    category = 'all',
    search = '',
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    order = 'desc'
  } = filters;

  return `public:problems:category:${category}:search:${search}:page:${page}:limit:${limit}:sortBy:${sortBy}:order:${order}`;
};

const generateProblemDetailKey = (problemId) => {
  return `public:problem:${problemId}`;
};

const generateProblemMatchesKey = (problemId, filters) => {
  const {
    status = 'all',
    page = 1,
    limit = 10
  } = filters;

  return `matches:problem:${problemId}:status:${status}:page:${page}:limit:${limit}`;
};

const generateInnovationMatchesKey = (innovationId, filters) => {
  const {
    status = 'all',
    page = 1,
    limit = 10
  } = filters;

  return `matches:innovation:${innovationId}:status:${status}:page:${page}:limit:${limit}`;
};

const generateOTPKey = (identifier, type, purpose = 'general') => {
  return `otp:${type}:${purpose}:${identifier}`;
};

const generateRateLimitKey = (identifier, type) => {
  return `otp:ratelimit:${type}:${identifier}`;
};

const generateAiImportRateLimitKey = (userId) => `ai:import:ratelimit:${userId}`;

const generateViewKey = (innovationId, ip) => `view:innovation:${innovationId}:${ip}`;

const CACHE_PATTERNS = {
  ALL_INNOVATIONS: 'public:innovations:*',
  ALL_PROBLEMS: 'public:problems:*',
  PROBLEM_MATCHES: (problemId) => `matches:problem:${problemId}:*`,
  INNOVATION_MATCHES: (innovationId) => `matches:innovation:${innovationId}:*`,
  ALL_MATCHES: 'matches:*',
  ALL_OTP: 'otp:*'
};

module.exports = {
  generateInnovationListKey,
  generateInnovationDetailKey,
  generateProblemListKey,
  generateProblemDetailKey,
  generateProblemMatchesKey,
  generateInnovationMatchesKey,
  generateOTPKey,
  generateRateLimitKey,
  generateAiImportRateLimitKey,
  generateViewKey,
  CACHE_PATTERNS
};
