const crypto = require('crypto');
const config = require('../../config');
const otpCache = require('../cache/otpCache');

const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 3,
  MAX_REQUESTS_PER_PERIOD: 3,
  REQUEST_PERIOD_MINUTES: 5
};

const generateSecureOTP = () => {
  const min = Math.pow(10, OTP_CONFIG.LENGTH - 1);
  const max = Math.pow(10, OTP_CONFIG.LENGTH) - 1;
  return crypto.randomInt(min, max + 1).toString();
};

const checkRequestLimit = async (identifier, type) => {
  if (!config.redis.enabled) {
    return { allowed: false, message: 'OTP service temporarily unavailable' };
  }

  const limitCheck = await otpCache.checkRateLimit(identifier, type);

  if (limitCheck.limited) {
    const minutesRemaining = Math.ceil(limitCheck.ttl / 60);
    return {
      allowed: false,
      message: `Too many OTP requests. Please wait ${minutesRemaining} minute(s).`
    };
  }

  await otpCache.incrementRateLimit(identifier, type);
  return { allowed: true };
};

const storeEmailOTP = async (email, otp, purpose = 'general') => {
  if (!config.redis.enabled) {
    throw new Error('OTP service is currently unavailable. Please try again later.');
  }

  return await otpCache.saveOTP(email, otp, 'email', purpose);
};

const verifyEmailOTP = async (email, inputOtp, purpose = 'general') => {
  if (!config.redis.enabled) {
    return { success: false, error: 'OTP service is currently unavailable. Please try again later.' };
  }

  const result = await otpCache.verifyOTP(email, inputOtp, 'email', purpose);

  return {
    success: result.valid,
    error: result.valid ? null : result.reason
  };
};

const storeMobileOTP = async (phone, otp, purpose = 'general') => {
  if (!config.redis.enabled) {
    throw new Error('OTP service is currently unavailable. Please try again later.');
  }

  return await otpCache.saveOTP(phone, otp, 'phone', purpose);
};

const verifyMobileOTP = async (phone, inputOtp, purpose = 'general') => {
  if (!config.redis.enabled) {
    return { success: false, error: 'OTP service is currently unavailable. Please try again later.' };
  }

  const result = await otpCache.verifyOTP(phone, inputOtp, 'phone', purpose);

  return {
    success: result.valid,
    error: result.valid ? null : result.reason
  };
};

module.exports = {
  generateSecureOTP,
  checkRequestLimit,
  storeEmailOTP,
  verifyEmailOTP,
  storeMobileOTP,
  verifyMobileOTP,
  OTP_CONFIG
};