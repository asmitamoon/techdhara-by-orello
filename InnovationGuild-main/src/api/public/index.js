import api from '../axiosInstance';

export const getNodalOrgs = () => api.get('/public/nodal-orgs').then(r => r.data);
export const getApprovedAos = () => api.get('/public/approved-aos').then(r => r.data);
export const getPublishedInnovations = (params) => api.get('/public/innovations', { params }).then(r => r.data);
export const getInnovationFacets = (params) => api.get('/public/innovations/facets', { params }).then(r => r.data);
export const getInnovationsCategoryPreview = (params) => api.get('/public/innovations/category-preview', { params }).then(r => r.data);
export const getInnovationById = (id) => api.get(`/public/innovations/${id}`).then(r => r.data);
export const getSimilarInnovations = (innovationId) => api.get(`/public/innovations/${innovationId}/similar`).then(r => r.data);
export const getPublishedProblems = (params) => api.get('/public/problems', { params }).then(r => r.data);
export const getProblemById = (id) => api.get(`/public/problems/${id}`).then(r => r.data);
export const getProblemMatches = (problemId) => api.get(`/public/problems/${problemId}/matches`).then(r => r.data);
export const getVleStats = () => api.get('/public/vles/stats').then(r => r.data);
export const getImpactStats = () => api.get('/public/impact-stats').then(r => r.data);
export const getPublishedVles = (params) => api.get('/public/vles', { params }).then(r => r.data);
export const getOperations = () => api.get('/public/operations').then(r => r.data);
export const getVillages = (params) => api.get('/public/villages', { params }).then(r => r.data);
export const submitContactForm = (data) => api.post('/public/contact', data).then(r => r.data);
export const subscribeNewsletter = (data) => api.post('/public/newsletter/subscribe', data).then(r => r.data);
