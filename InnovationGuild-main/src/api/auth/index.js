import api from '../axiosInstance';

// ── Core auth ──────────────────────────────────────────────────────────────
export const registerEmail = (data) => api.post('/auth/register', data).then(r => r.data);
export const verifyEmail   = (data) => api.post('/auth/verify-email', data).then(r => r.data);
export const loginEmail    = (data) => api.post('/auth/login', data).then(r => r.data);

export const forgotPassword    = (data) => api.post('/auth/forgot-password', data).then(r => r.data);
export const verifyResetOTP    = (data) => api.post('/auth/verify-reset-otp', data).then(r => r.data);
export const resetPassword     = (data) => api.post('/auth/reset-password', data).then(r => r.data);
export const resendOtp       = (data) => api.post('/auth/resend-otp', data).then(r => r.data);

export const mobileLogin     = (data) => api.post('/auth/mobile-login', data).then(r => r.data);
export const verifyMobile    = (data) => api.post('/auth/mobile-verify', data).then(r => r.data);
export const resendMobileOtp = (data) => api.post('/auth/resend-mobile-otp', data).then(r => r.data);

// ── Token management ───────────────────────────────────────────────────────
export const getMe        = () => api.get('/auth/me').then(r => r.data);
export const refreshToken = () => api.post('/auth/refresh').then(r => r.data);
export const logoutAuth   = () => api.post('/auth/logout').then(r => r.data);
export const logoutAll    = () => api.post('/auth/logout-all').then(r => r.data);

// ── Profile completion ─────────────────────────────────────────────────────
export const completeVleRegistration         = (data) => api.post('/auth/vle/complete-registration', data).then(r => r.data);
export const completeAoRegistration          = (data) => api.post('/auth/ao/complete-registration', data).then(r => r.data);
export const completeInnovatorRegistration   = (data) => api.post('/auth/innovator/complete-registration', data).then(r => r.data);
export const completeNodalOrgRegistration    = (data) => api.post('/auth/nodal-org/complete-registration', data).then(r => r.data);
export const completeGeneralUserRegistration = (data) => api.post('/auth/general-user/complete-registration', data).then(r => r.data);

// ── Profile image ──────────────────────────────────────────────────────────
// Pass a FormData object with key 'profileImage'
// axios detects FormData and sets multipart Content-Type automatically
export const uploadProfileImage = (formData) =>
  api.post('/auth/profile-image', formData).then(r => r.data);
export const deleteProfileImage = () => api.delete('/auth/profile-image').then(r => r.data);
export const getProfileImage    = () => api.get('/auth/profile-image').then(r => r.data);
