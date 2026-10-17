const redisClient = require('./redisClient');
const { generateInnovationListKey, generateInnovationDetailKey, generateProblemListKey, generateProblemDetailKey, CACHE_PATTERNS } = require('./cacheKeys');
const config = require('../../config');
const Innovation = require('../../models/Innovation');
const InnovationRequest = require('../../models/InnovationRequest');

const CACHE_TTL = {
  INNOVATION_LIST: 300,
  INNOVATION_DETAIL: 300,
  PROBLEM_LIST: 300,
  PROBLEM_DETAIL: 300
};

const getCachedInnovationsList = async (filters, aggregationPipeline = null) => {
  if (!config.redis.enabled || !redisClient.isRedisConnected()) {
    if (aggregationPipeline) {
      return await Innovation.aggregate(aggregationPipeline);
    }
    return null;
  }

  const cacheKey = generateInnovationListKey(filters);

  try {
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      console.log(`[Cache HIT] Innovation list: ${cacheKey}`);
      return cached;
    }

    console.log(`[Cache MISS] Innovation list: ${cacheKey}`);

    if (aggregationPipeline) {
      const result = await Innovation.aggregate(aggregationPipeline);

      await redisClient.set(cacheKey, result, CACHE_TTL.INNOVATION_LIST);

      return result;
    }

    return null;
  } catch (error) {
    console.error('[Cache Error] getCachedInnovationsList:', error.message);
    if (aggregationPipeline) {
      return await Innovation.aggregate(aggregationPipeline);
    }
    return null;
  }
};

const getCachedInnovationDetail = async (innovationId, query = null) => {
  if (!config.redis.enabled || !redisClient.isRedisConnected()) {
    if (query) {
      return await query;
    }
    return null;
  }

  const cacheKey = generateInnovationDetailKey(innovationId);

  try {
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      console.log(`[Cache HIT] Innovation detail: ${cacheKey}`);
      return cached;
    }

    console.log(`[Cache MISS] Innovation detail: ${cacheKey}`);

    if (query) {
      const result = await query;

      if (result) {
        await redisClient.set(cacheKey, result, CACHE_TTL.INNOVATION_DETAIL);
      }

      return result;
    }

    return null;
  } catch (error) {
    console.error('[Cache Error] getCachedInnovationDetail:', error.message);
    if (query) {
      return await query;
    }
    return null;
  }
};

const getCachedProblemsList = async (filters, aggregationPipeline = null) => {
  if (!config.redis.enabled || !redisClient.isRedisConnected()) {
    if (aggregationPipeline) {
      return await InnovationRequest.aggregate(aggregationPipeline);
    }
    return null;
  }

  const cacheKey = generateProblemListKey(filters);

  try {
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      console.log(`[Cache HIT] Problem list: ${cacheKey}`);
      return cached;
    }

    console.log(`[Cache MISS] Problem list: ${cacheKey}`);

    if (aggregationPipeline) {
      const result = await InnovationRequest.aggregate(aggregationPipeline);

      await redisClient.set(cacheKey, result, CACHE_TTL.PROBLEM_LIST);

      return result;
    }

    return null;
  } catch (error) {
    console.error('[Cache Error] getCachedProblemsList:', error.message);
    if (aggregationPipeline) {
      return await InnovationRequest.aggregate(aggregationPipeline);
    }
    return null;
  }
};

const getCachedProblemDetail = async (problemId, query = null) => {
  if (!config.redis.enabled || !redisClient.isRedisConnected()) {
    if (query) {
      return await query;
    }
    return null;
  }

  const cacheKey = generateProblemDetailKey(problemId);

  try {
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      console.log(`[Cache HIT] Problem detail: ${cacheKey}`);
      return cached;
    }

    console.log(`[Cache MISS] Problem detail: ${cacheKey}`);

    if (query) {
      const result = await query;

      if (result) {
        await redisClient.set(cacheKey, result, CACHE_TTL.PROBLEM_DETAIL);
      }

      return result;
    }

    return null;
  } catch (error) {
    console.error('[Cache Error] getCachedProblemDetail:', error.message);
    if (query) {
      return await query;
    }
    return null;
  }
};

const invalidateInnovationCaches = async (innovationId) => {
  if (!config.redis.enabled || !redisClient.isRedisConnected()) {
    return;
  }

  try {
    await redisClient.del(generateInnovationDetailKey(innovationId));

    await redisClient.deletePattern(CACHE_PATTERNS.ALL_INNOVATIONS);

    await redisClient.deletePattern(CACHE_PATTERNS.INNOVATION_MATCHES(innovationId));

    console.log(`[Cache Invalidation] Cleared all caches for innovation: ${innovationId}`);
  } catch (error) {
    console.error('[Cache Error] invalidateInnovationCaches:', error.message);
  }
};

const invalidateProblemCaches = async (problemId) => {
  if (!config.redis.enabled || !redisClient.isRedisConnected()) {
    return;
  }

  try {
    await redisClient.del(generateProblemDetailKey(problemId));

    await redisClient.deletePattern(CACHE_PATTERNS.ALL_PROBLEMS);

    await redisClient.deletePattern(CACHE_PATTERNS.PROBLEM_MATCHES(problemId));

    console.log(`[Cache Invalidation] Cleared all caches for problem: ${problemId}`);
  } catch (error) {
    console.error('[Cache Error] invalidateProblemCaches:', error.message);
  }
};

const invalidateAllInnovations = async () => {
  if (!config.redis.enabled || !redisClient.isRedisConnected()) {
    return;
  }

  try {
    await redisClient.deletePattern(CACHE_PATTERNS.ALL_INNOVATIONS);
    console.log('[Cache Invalidation] Cleared all innovation list caches');
  } catch (error) {
    console.error('[Cache Error] invalidateAllInnovations:', error.message);
  }
};

const invalidateAllProblems = async () => {
  if (!config.redis.enabled || !redisClient.isRedisConnected()) {
    return;
  }

  try {
    await redisClient.deletePattern(CACHE_PATTERNS.ALL_PROBLEMS);
    console.log('[Cache Invalidation] Cleared all problem list caches');
  } catch (error) {
    console.error('[Cache Error] invalidateAllProblems:', error.message);
  }
};

module.exports = {
  getCachedInnovationsList,
  getCachedInnovationDetail,
  getCachedProblemsList,
  getCachedProblemDetail,
  invalidateInnovationCaches,
  invalidateProblemCaches,
  invalidateAllInnovations,
  invalidateAllProblems
};
