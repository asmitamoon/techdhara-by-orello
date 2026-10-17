const VleProfile = require('../../../models/VleProfile');

/**
 * Resolves the best available phone number for a user.
 * Prefers the phone number used at login (user.phone).
 * Falls back to VleProfile.mobile for VLE users who registered via email/Google.
 */
async function resolvePhoneNumber(user) {
  if (user.isPhoneUser && user.isPhoneVerified && user.phone) {
    return user.phone;
  }
  if (user.role === 'VLE') {
    try {
      const profile = await VleProfile.findOne({ userId: user._id }).select('mobile');
      if (profile?.mobile) return profile.mobile;
    } catch (err) {
      console.error('Failed to resolve VLE profile phone:', err.message);
    }
  }
  return null;
}

module.exports = { resolvePhoneNumber };
