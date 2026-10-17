import api from '../axiosInstance';

export const createProblem = (formData) =>
  api.post('/common/problems', formData).then(r => r.data);

export const submitProblemForApproval = (problemId) =>
  api.patch(`/common/problems/${problemId}/submit`).then(r => r.data);

export const createServiceRequest = (data) =>
  api.post('/common/service-requests', data).then(r => r.data);

export const submitServiceRequestForApproval = (serviceRequestId) =>
  api.patch(`/common/service-requests/${serviceRequestId}/submit`).then(r => r.data);

export const getMyProblems = (params) =>
  api.get('/common/problems', { params }).then(r => r.data);

export const getMyServiceRequests = (params) =>
  api.get('/common/service-requests', { params }).then(r => r.data);

export const getProblemById = (id) =>
  api.get(`/common/problems/${id}`).then(r => r.data);

export const updateProblem = ({ id, formData }) =>
  api.patch(`/common/problems/${id}`, formData).then(r => r.data);

export const getServiceRequestById = (id) =>
  api.get(`/common/service-requests/${id}`).then(r => r.data);

export const updateServiceRequest = ({ id, data }) =>
  api.patch(`/common/service-requests/${id}`, data).then(r => r.data);

export const viewContact = (userId) =>
  api.post('/common/contacts/view', { userId }).then(r => r.data);

export const getInnovationComments = (innovationId, params) =>
  api.get(`/public/innovations/${innovationId}/comments`, { params }).then(r => r.data);

export const createCommentOnInnovation = ({ innovationId, content }) =>
  api.post(`/common/innovations/${innovationId}/comments`, { content }).then(r => r.data);

export const getProblemComments = (problemId, params) =>
  api.get(`/public/problems/${problemId}/comments`, { params }).then(r => r.data);

export const createCommentOnProblem = ({ problemId, content }) =>
  api.post(`/common/problems/${problemId}/comments`, { content }).then(r => r.data);

export const getUserById = (id) =>
  api.get(`/common/profiles/${id}`).then(r => r.data);

export const getUserInnovations = (userId) =>
  api.get(`/common/profiles/${userId}/innovations`).then(r => r.data);
export const getUserProblems = (userId) =>
  api.get(`/common/profiles/${userId}/problems`).then(r => r.data);

export const saveInnovation = (innovationId) =>
  api.post(`/common/innovations/${innovationId}/save`).then(r => r.data);
export const unsaveInnovation = (innovationId) =>
  api.delete(`/common/innovations/${innovationId}/save`).then(r => r.data);
export const getSavedInnovations = (params) =>
  api.get('/common/saved/innovations', { params }).then(r => r.data);

export const saveProblem = (problemId) =>
  api.post(`/common/problems/${problemId}/save`).then(r => r.data);
export const unsaveProblem = (problemId) =>
  api.delete(`/common/problems/${problemId}/save`).then(r => r.data);
export const getSavedProblems = (params) =>
  api.get('/common/saved/problems', { params }).then(r => r.data);

export const saveProfile = (userId) =>
  api.post(`/common/profiles/${userId}/save`).then(r => r.data);
export const unsaveProfile = (userId) =>
  api.delete(`/common/profiles/${userId}/save`).then(r => r.data);
export const getSavedProfiles = (params) =>
  api.get('/common/saved/profiles', { params }).then(r => r.data);

export const getMyNotifications = (params) =>
  api.get('/common/notifications', { params }).then(r => r.data);

export const markAllNotificationsRead = () =>
  api.patch('/common/notifications/read-all').then(r => r.data);

export const deleteNotification = (notificationId) =>
  api.delete(`/common/notifications/${notificationId}`).then(r => r.data);

export const clearAllNotifications = () =>
  api.delete('/common/notifications').then(r => r.data);

export const getMyProfile = () =>
  api.get('/common/my-profile').then(r => r.data);

export const updateMyProfile = (formData) =>
  api.patch('/common/my-profile', formData).then(r => r.data);

export const submitMyProfileForApproval = () =>
  api.patch('/common/my-profile/submit').then(r => r.data);
