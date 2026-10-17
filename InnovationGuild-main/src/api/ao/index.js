import api from '../axiosInstance';

export const initiateVleRegistration = (data) =>
  api.post('/ao/initiate-vle-registration', data).then(r => r.data);

export const resendVleOtp = (data) =>
  api.post('/ao/resend-vle-otp', data).then(r => r.data);

export const registerVleByAo = (formData) =>
  api.post('/ao/register-vle', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);

export const createFieldReport = (pilotId, data) =>
  api.post(`/ao/pilots/${pilotId}/field-reports`, data).then(r => r.data);

export const deleteFieldReport = (reportId) =>
  api.delete(`/ao/field-reports/${reportId}`).then(r => r.data);
