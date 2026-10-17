import api from '../axiosInstance';

export const getApprovedAos = (params) =>
  api.get('/nodal-org/aos/approved', { params }).then(r => r.data);

export const getPendingAos = (params) =>
  api.get('/nodal-org/aos/pending', { params }).then(r => r.data);

export const getAoById = (aoId) =>
  api.get(`/nodal-org/aos/${aoId}`).then(r => r.data);

export const approveAo = (aoId) =>
  api.patch(`/nodal-org/aos/${aoId}/approve`).then(r => r.data);

export const rejectAo = (aoId, reason) =>
  api.patch(`/nodal-org/aos/${aoId}/reject`, { reason }).then(r => r.data);

export const updateAo = (aoId, formData) =>
  api.patch(`/nodal-org/aos/${aoId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);

export const getAoVles = (aoId, params) =>
  api.get(`/nodal-org/aos/${aoId}/vles`, { params }).then(r => r.data);

export const getAoProblems = (aoId, params) =>
  api.get(`/nodal-org/aos/${aoId}/problems`, { params }).then(r => r.data);

export const getAoServiceRequests = (aoId, params) =>
  api.get(`/nodal-org/aos/${aoId}/service-requests`, { params }).then(r => r.data);

export const initiateAoRegistration = (data) =>
  api.post('/nodal-org/initiate-ao-registration', data).then(r => r.data);

export const resendAoOtp = (data) =>
  api.post('/nodal-org/resend-ao-otp', data).then(r => r.data);

export const registerAoByNo = (formData) =>
  api.post('/nodal-org/register-ao', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);

export const requestEditNoAo = (aoId, reason) =>
  api.patch(`/nodal-org/aos/${aoId}/request-edit`, { reason }).then(r => r.data);
