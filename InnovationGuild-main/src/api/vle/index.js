import api from '../axiosInstance';

export const toggleFacingSimilar = (problemId) =>
  api.post(`/vle/problems/${problemId}/facing-similar`).then(r => r.data);

export const getFacingSimilarProblems = (params) =>
  api.get('/vle/problems/facing-similar', { params }).then(r => r.data);

export const createPilotRequest = (innovationId, data) =>
  api.post(`/vle/innovations/${innovationId}/pilot-request`, data).then(r => r.data);

export const getMyPilotRequestContext = () =>
  api.get('/vle/pilot-request-context').then(r => r.data);

export const getPilotRequestProblems = (params) =>
  api.get('/vle/pilot-request-problems', { params }).then(r => r.data);

export const getMyPilotRequests = (params) =>
  api.get('/vle/pilot-requests', { params }).then(r => r.data);

export const createBusinessModel = (data) =>
  api.post('/vle/business-models', data).then(r => r.data);

export const getMyBusinessModels = (params) =>
  api.get('/vle/business-models', { params }).then(r => r.data);

export const createBookkeepingEntry = (data) =>
  api.post('/vle/bookkeeping', data).then(r => r.data);

export const getMyBookkeepingEntries = (params) =>
  api.get('/vle/bookkeeping', { params }).then(r => r.data);

export const updateBookkeepingEntry = (entryId, data) =>
  api.patch(`/vle/bookkeeping/${entryId}`, data).then(r => r.data);

export const deleteBookkeepingEntry = (entryId) =>
  api.delete(`/vle/bookkeeping/${entryId}`).then(r => r.data);

export const getMyBookkeepingEntry = (entryId) =>
  api.get(`/vle/bookkeeping/${entryId}`).then(r => r.data);

export const getBookkeepingContext = (pilotId) =>
  api.get(`/vle/bookkeeping/context/${pilotId}`).then(r => r.data);
