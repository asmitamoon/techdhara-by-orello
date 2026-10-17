const { sendOTPSMS } = require('../notification/channels/sms');
const {
  generateSecureOTP,
  checkRequestLimit,
  storeMobileOTP,
  verifyMobileOTP
} = require('./otpManager');

const normalizePhoneNumber = (phone) => {
  let normalized = phone.replace(/\s+/g, '').replace(/[()-]/g, '');

  if (!normalized.startsWith('+')) {
    if (normalized.startsWith('91') && normalized.length === 12) {
      normalized = '+' + normalized;       // 91XXXXXXXXXX → +91XXXXXXXXXX
    } else if (normalized.length === 10) {
      normalized = '+91' + normalized;     // XXXXXXXXXX → +91XXXXXXXXXX
    }
  }

  return normalized;
};

const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

const sendMobileOTP = async (phone, purpose = 'general') => {
  const normalizedPhone = normalizePhoneNumber(phone);

  if (!validatePhoneNumber(normalizedPhone)) {
    throw new Error('Invalid phone number format');
  }

  const rateLimitCheck = await checkRequestLimit(normalizedPhone, 'phone');
  if (!rateLimitCheck.allowed) {
    throw new Error(rateLimitCheck.message);
  }

  const otp = generateSecureOTP();
  await storeMobileOTP(normalizedPhone, otp, purpose);

  await sendOTPSMS(normalizedPhone, otp);

  return normalizedPhone;
};

module.exports = {
  normalizePhoneNumber,
  validatePhoneNumber,
  sendMobileOTP,
  verifyMobileOTP
};