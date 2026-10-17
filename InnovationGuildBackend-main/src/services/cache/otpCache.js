const bcrypt = require('bcryptjs');
const redisClient = require('./redisClient');
const { generateOTPKey, generateRateLimitKey } = require('./cacheKeys');
const config = require('../../config');

const OTP_TTL = config.redis.ttl.otp;
const RATE_LIMIT_TTL = 300;
const RATE_LIMIT_MAX = 3;
const MAX_VERIFICATION_ATTEMPTS = 3;

const saveOTP = async (identifier, otp, type, purpose = 'general') => {
  try {
    const hashedOTP = await bcrypt.hash(otp, 10);

    const otpData = {
      hash: hashedOTP,
      attempts: 0,
      createdAt: Date.now()
    };

    const key = generateOTPKey(identifier, type, purpose);
    const success = await redisClient.set(key, otpData, OTP_TTL);

    if (success) {
      console.log(`[OTP Cache] Saved OTP for ${type}:${purpose}:${identifier} with TTL ${OTP_TTL}s`);
    }

    return success;
  } catch (error) {
    console.error(`[OTP Cache] Error saving OTP:`, error.message);
    return false;
  }
};

const verifyOTP = async (identifier, otp, type, purpose = 'general') => {
  try {
    const key = generateOTPKey(identifier, type, purpose);
    const otpData = await redisClient.get(key);

    if (!otpData) {
      return { valid: false, reason: 'OTP not found or expired' };
    }

    if (otpData.attempts >= MAX_VERIFICATION_ATTEMPTS) {
      await redisClient.del(key);
      return { valid: false, reason: 'Maximum verification attempts exceeded' };
    }

    const isValid = await bcrypt.compare(otp, otpData.hash);

    if (!isValid) {
      otpData.attempts += 1;
      const ttl = await redisClient.getTTL(key);

      if (ttl > 0) {
        await redisClient.set(key, otpData, ttl);
      }

      const attemptsLeft = MAX_VERIFICATION_ATTEMPTS - otpData.attempts;
      return {
        valid: false,
        reason: `Invalid OTP. ${attemptsLeft} attempt(s) remaining`,
        attemptsLeft
      };
    }

    await redisClient.del(key);
    console.log(`[OTP Cache] Successfully verified OTP for ${type}:${purpose}:${identifier}`);

    return { valid: true };
  } catch (error) {
    console.error(`[OTP Cache] Error verifying OTP:`, error.message);
    return { valid: false, reason: 'Error verifying OTP' };
  }
};

const incrementRateLimit = async (identifier, type) => {
  try {
    const key = generateRateLimitKey(identifier, type);
    const count = await redisClient.increment(key, RATE_LIMIT_TTL);

    if (count !== null) {
      console.log(`[OTP Cache] Rate limit for ${type}:${identifier} is ${count}/${RATE_LIMIT_MAX}`);
    }

    return count;
  } catch (error) {
    console.error(`[OTP Cache] Error incrementing rate limit:`, error.message);
    return null;
  }
};

const checkRateLimit = async (identifier, type) => {
  try {
    const key = generateRateLimitKey(identifier, type);
    const count = await redisClient.get(key);

    const currentCount = count ? parseInt(count) : 0;
    const isLimited = currentCount >= RATE_LIMIT_MAX;

    if (isLimited) {
      const ttl = await redisClient.getTTL(key);
      console.log(`[OTP Cache] Rate limit exceeded for ${type}:${identifier}. TTL: ${ttl}s`);
      return { limited: true, ttl, count: currentCount };
    }

    return { limited: false, count: currentCount };
  } catch (error) {
    console.error(`[OTP Cache] Error checking rate limit:`, error.message);
    throw error;
  }
};

const deleteOTP = async (identifier, type, purpose = 'general') => {
  try {
    const key = generateOTPKey(identifier, type, purpose);
    const success = await redisClient.del(key);

    if (success) {
      console.log(`[OTP Cache] Deleted OTP for ${type}:${identifier}`);
    }

    return success;
  } catch (error) {
    console.error(`[OTP Cache] Error deleting OTP:`, error.message);
    return false;
  }
};

module.exports = {
  saveOTP,
  verifyOTP,
  incrementRateLimit,
  checkRateLimit,
  deleteOTP,
  OTP_TTL,
  RATE_LIMIT_TTL,
  RATE_LIMIT_MAX,
  MAX_VERIFICATION_ATTEMPTS
};
