const rateLimit = require('express-rate-limit');

// Applied to endpoints that trigger Twilio SMS or SendGrid email
// 10 OTP sends per IP per 15 minutes
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many OTP requests from this IP. Please try again later.'
  }
});

// Applied to OTP verification endpoints (no external cost but brute-force protection)
// 20 attempts per IP per 15 minutes
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many verification attempts from this IP. Please try again later.'
  }
});

// Password login: 10 attempts per IP per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many login attempts from this IP. Please try again later.'
  }
});

module.exports = { otpSendLimiter, otpVerifyLimiter, loginLimiter };
