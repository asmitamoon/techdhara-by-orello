const redisClient = require('./redisClient');
const { generateProblemMatchesKey, generateInnovationMatchesKey, CACHE_PATTERNS } = require('./cacheKeys');
const config = require('../../config');
const Match = require('../../models/Match');

const CACHE_TTL = {
  MATCHES: 600
};

const getCachedProblemMatches = async (problemId, filters, query = null) => {
  if (!config.redis.enabled || !redisClient.isRedisConnected()) {
    if (query) {
      return await query;
    }
    return null;
  }

  const cacheKey = generateProblemMatchesKey(problemId, filters);

  try {
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      console.log(`[Cache HIT] Problem matches: ${cacheKey}`);
      return cached;
    }

    console.log(`[Cache MISS] Problem matches: ${cacheKey}`);

    if (query) {
      const result = await query;

      await redisClient.set(cacheKey, result, CACHE_TTL.MATCHES);

      return result;
    }

    return null;
  } catch (error) {
    console.error('[Cache Error] getCachedProblemMatches:', error.message);
    if (query) {
      return await query;
    }
    return null;
  }
};

const getCachedInnovationMatches = async (innovationId, filters, query = null) => {
  if (!config.redis.enabled || !redisClient.isRedisConnected()) {
    if (query) {
      return await query;
    }
    return null;
  }

  const cacheKey = generateInnovationMatchesKey(innovationId, filters);

  try {
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      console.log(`[Cache HIT] Innovation matches: ${cacheKey}`);
      return cached;
    }

    console.log(`[Cache MISS] Innovation matches: ${cacheKey}`);

    if (query) {
      const result = await query;

      await redisClient.set(cacheKey, result, CACHE_TTL.MATCHES);

      return result;
    }

    return null;
  } catch (error) {
    console.error('[Cache Error] getCachedInnovationMatches:', error.message);
    if (query) {
      return await query;
    }
    return null;
  }
};

const invalidateProblemMatches = async (problemId) => {
  if (!config.redis.enabled || !redisClient.isRedisConnected()) {
    return;
  }

  try {
    await redisClient.deletePattern(CACHE_PATTERNS.PROBLEM_MATCHES(problemId));
    console.log(`[Cache Invalidation] Cleared match caches for problem: ${problemId}`);
  } catch (error) {
    console.error('[Cache Error] invalidateProblemMatches:', error.message);
  }
};

const invalidateInnovationMatches = async (innovationId) => {
  if (!config.redis.enabled || !redisClient.isRedisConnected()) {
    return;
  }

  try {
    await redisClient.deletePattern(CACHE_PATTERNS.INNOVATION_MATCHES(innovationId));
    console.log(`[Cache Invalidation] Cleared match caches for innovation: ${innovationId}`);
  } catch (error) {
    console.error('[Cache Error] invalidateInnovationMatches:', error.message);
  }
};

const invalidateMatchCaches = async (problemId, innovationId) => {
  if (!config.redis.enabled || !redisClient.isRedisConnected()) {
    return;
  }

  try {
    await invalidateProblemMatches(problemId);
    await invalidateInnovationMatches(innovationId);
    console.log(`[Cache Invalidation] Cleared match caches for problem: ${problemId} and innovation: ${innovationId}`);
  } catch (error) {
    console.error('[Cache Error] invalidateMatchCaches:', error.message);
  }
};

module.exports = {
  getCachedProblemMatches,
  getCachedInnovationMatches,
  invalidateProblemMatches,
  invalidateInnovationMatches,
  invalidateMatchCaches
};
