const { sendOTPEmail } = require('../notification/channels/email');
const {
  generateSecureOTP,
  checkRequestLimit,
  storeEmailOTP,
  verifyEmailOTP
} = require('./otpManager');

const sendOTP = async (email, purpose = 'general') => {
  try {
    const rateLimitCheck = await checkRequestLimit(email, 'email');
    if (!rateLimitCheck.allowed) {
      throw new Error(rateLimitCheck.message);
    }

    const otp = generateSecureOTP();
    await storeEmailOTP(email, otp, purpose);
    await sendOTPEmail(email, otp, purpose);

    return { success: true };
  } catch (error) {
    throw new Error(`Failed to send OTP: ${error.message}`);
  }
};

const verifyOTP = async (email, providedOTP, purpose = 'general') => {
  return await verifyEmailOTP(email, providedOTP, purpose);
};

module.exports = {
  sendOTP,
  verifyOTP
};