import api from '../axiosInstance';

export const createInnovation = (formData) =>
  api.post('/innovator/innovations', formData).then(r => r.data);

export const submitInnovationForApproval = (innovationId) =>
  api.patch(`/innovator/innovations/${innovationId}/submit`).then(r => r.data);

export const getMyInnovations = () =>
  api.get('/innovator/innovations', { params: { limit: 100 } }).then(r => r.data);

export const deleteInnovation = (innovationId) =>
  api.delete(`/innovator/innovations/${innovationId}`).then(r => r.data);

export const getInnovationById = (id) =>
  api.get(`/innovator/innovations/${id}`).then(r => r.data);

export const updateInnovation = ({ id, formData }) =>
  api.patch(`/innovator/innovations/${id}`, formData).then(r => r.data);
