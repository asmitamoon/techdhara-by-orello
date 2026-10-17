import api from '../axiosInstance';

export const getOrgOverview = () =>
  api.get('/org/overview').then(r => r.data);

export const getOrgProblemsList = (params) =>
  api.get('/org/problems-list', { params }).then(r => r.data);

export const getOrgServiceRequestsList = (params) =>
  api.get('/org/service-requests', { params }).then(r => r.data);

export const getOrgProblemById = (problemId) =>
  api.get(`/org/problems/${problemId}`).then(r => r.data);

export const getOrgProblemView = (problemId) =>
  api.get(`/org/problems/${problemId}/view`).then(r => r.data);

export const approveOrgProblem = (problemId) =>
  api.patch(`/org/problems/${problemId}/approve`).then(r => r.data);

export const rejectOrgProblem = (problemId, rejectionReason) =>
  api.patch(`/org/problems/${problemId}/reject`, { rejectionReason }).then(r => r.data);

export const requestEditOrgProblem = (problemId, reason) =>
  api.patch(`/org/problems/${problemId}/request-edit`, { reason }).then(r => r.data);

export const updateOrgProblem = (problemId, data) => {
  if (!(data.uploadedImage instanceof File)) {
    return api.patch(`/org/problems/${problemId}`, data).then(r => r.data);
  }
  const formData = new FormData();
  formData.append('cover', data.uploadedImage);
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'uploadedImage' || value == null) return;
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });
  return api.patch(`/org/problems/${problemId}`, formData).then(r => r.data);
};

export const createOrgProblemForVle = (data) => {
  const formData = new FormData();
  if (data.uploadedImage instanceof File) {
    formData.append('cover', data.uploadedImage);
  }
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'uploadedImage' || value == null) return;
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });
  return api.post('/org/problems/create-for-vle', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};

export const createOrgServiceRequestForVle = (data) =>
  api.post('/org/service-requests/create-for-vle', data).then(r => r.data);

export const getOrgServiceRequestById = (serviceRequestId) =>
  api.get(`/org/service-requests/${serviceRequestId}`).then(r => r.data);

export const updateOrgServiceRequest = (serviceRequestId, data) =>
  api.patch(`/org/service-requests/${serviceRequestId}`, data).then(r => r.data);

export const getOrgApprovedVles = (params) =>
  api.get('/org/vles/approved', { params }).then(r => r.data);

export const getOrgPendingVles = (params) =>
  api.get('/org/vles/pending', { params }).then(r => r.data);

export const getOrgVleDetails = (vleId) =>
  api.get(`/org/vles/${vleId}`).then(r => r.data);

export const approveOrgVle = (vleId) =>
  api.patch(`/org/vles/${vleId}/approve`).then(r => r.data);

export const rejectOrgVle = (vleId, rejectionReason) =>
  api.patch(`/org/vles/${vleId}/reject`, { rejectionReason }).then(r => r.data);

export const updateOrgVle = (vleId, formData) =>
  api.patch(`/org/vles/${vleId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);

export const getOrgVleSimilarProblems = (vleId, params) =>
  api.get(`/org/vles/${vleId}/similar-problems`, { params }).then(r => r.data);

export const getOrgVlePilotRequests = (vleId, params) =>
  api.get(`/org/vles/${vleId}/pilot-requests`, { params }).then(r => r.data);

export const getOrgVlePilotRequestContext = (vleId) =>
  api.get(`/org/vles/${vleId}/pilot-request-context`).then(r => r.data);

export const createOrgVlePilotRequest = (vleId, data) =>
  api.post(`/org/vles/${vleId}/pilot-request`, data).then(r => r.data);

export const getOrgPilotById = (pilotId) =>
  api.get(`/org/pilots/${pilotId}`).then(r => r.data);

export const startOrgPilot = (pilotId) =>
  api.patch(`/org/pilots/${pilotId}/start`).then(r => r.data);

export const startOrgPilotTrial = (pilotId) =>
  api.patch(`/org/pilots/${pilotId}/start-trial`).then(r => r.data);

export const markOrgPilotImplemented = (pilotId) =>
  api.patch(`/org/pilots/${pilotId}/implement`).then(r => r.data);

export const cancelOrgPilot = (pilotId) =>
  api.delete(`/org/pilots/${pilotId}`).then(r => r.data);

export const getOrgBusinessModelByPilot = (pilotId) =>
  api.get(`/org/pilots/${pilotId}/business-model`).then(r => r.data);

export const createOrgBusinessModel = (pilotId, data) =>
  api.post(`/org/pilots/${pilotId}/business-model`, data).then(r => r.data);

export const updateOrgBusinessModel = (pilotId, data) =>
  api.patch(`/org/pilots/${pilotId}/business-model`, data).then(r => r.data);

export const getOrgVleFieldReports = (vleId, params) =>
  api.get(`/org/vles/${vleId}/field-reports`, { params }).then(r => r.data);

export const getOrgPilotFieldReports = (pilotId, params) =>
  api.get(`/org/pilots/${pilotId}/field-reports`, { params }).then(r => r.data);

export const getOrgPilots = (params) =>
  api.get('/org/pilots', { params }).then(r => r.data);

export const getOrgFieldReportDetails = (reportId) =>
  api.get(`/org/field-reports/${reportId}`).then(r => r.data);

export const getOrgVleBookkeepings = (vleId, params) =>
  api.get(`/org/vles/${vleId}/bookkeepings`, { params }).then(r => r.data);

export const getOrgVleBookkeepingById = (vleId, bookkeepingId) =>
  api.get(`/org/vles/${vleId}/bookkeepings/${bookkeepingId}`).then(r => r.data);

export const getOrgInnovationById = (innovationId) =>
  api.get(`/org/innovations/${innovationId}`).then(r => r.data);

export const requestEditOrgVle = (vleId, reason) =>
  api.patch(`/org/vles/${vleId}/request-edit`, { reason }).then(r => r.data);
