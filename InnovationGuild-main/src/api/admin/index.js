import api from '../axiosInstance';

export const getAdminOverview = () =>
  api.get('/admin/overview').then(r => r.data);

export const getAdminAos = (params) =>
  api.get('/admin/affiliated-orgs/approved', { params }).then(r => r.data);

export const getAdminAoById = (aoId) =>
  api.get(`/admin/affiliated-orgs/${aoId}`).then(r => r.data);

export const getAdminAoVles = (aoId, params) =>
  api.get(`/admin/affiliated-orgs/${aoId}/vles`, { params }).then(r => r.data);

export const getAdminAoProblems = (aoId, params) =>
  api.get(`/admin/affiliated-orgs/${aoId}/problems`, { params }).then(r => r.data);

export const getAdminAoServiceRequests = (aoId, params) =>
  api.get(`/admin/affiliated-orgs/${aoId}/service-requests`, { params }).then(r => r.data);

export const approveAdminAo = (aoId) =>
  api.patch(`/admin/affiliated-orgs/${aoId}/approve`).then(r => r.data);

export const rejectAdminAo = (aoId, reason) =>
  api.patch(`/admin/affiliated-orgs/${aoId}/reject`, { reason }).then(r => r.data);

export const updateAdminAo = (aoId, formData) =>
  api.patch(`/admin/affiliated-orgs/${aoId}`, formData).then(r => r.data);

export const getAdminNos = (params) =>
  api.get('/admin/nodal-orgs/approved', { params }).then(r => r.data);

export const getAdminNoById = (noId) =>
  api.get(`/admin/nodal-orgs/${noId}`).then(r => r.data);

export const getAdminNoAos = (noId, params) =>
  api.get(`/admin/nodal-orgs/${noId}/affiliated-orgs`, { params }).then(r => r.data);

export const getAdminNoProblems = (noId, params) =>
  api.get(`/admin/nodal-orgs/${noId}/problems`, { params }).then(r => r.data);

export const getAdminNoServiceRequests = (noId, params) =>
  api.get(`/admin/nodal-orgs/${noId}/service-requests`, { params }).then(r => r.data);

export const approveAdminNo = (noId) =>
  api.patch(`/admin/nodal-orgs/${noId}/approve`).then(r => r.data);

export const rejectAdminNo = (noId, reason) =>
  api.patch(`/admin/nodal-orgs/${noId}/reject`, { reason }).then(r => r.data);

export const updateAdminNo = (noId, formData) =>
  api.patch(`/admin/nodal-orgs/${noId}`, formData).then(r => r.data);

export const getAdminProblems = (params) =>
  api.get('/admin/problems', { params }).then(r => r.data);

export const getAdminProblemById = (problemId) =>
  api.get(`/admin/problems/${problemId}`).then(r => r.data);

export const approveAdminProblem = (problemId) =>
  api.patch(`/admin/problems/${problemId}/approve`).then(r => r.data);

export const rejectAdminProblem = (problemId, rejectionReason) =>
  api.patch(`/admin/problems/${problemId}/reject`, { rejectionReason }).then(r => r.data);

export const requestEditAdminProblem = (problemId, reason) =>
  api.patch(`/admin/problems/${problemId}/request-edit`, { reason }).then(r => r.data);

export const updateAdminProblem = (problemId, data) => {
  if (!(data.uploadedImage instanceof File)) {
    return api.patch(`/admin/problems/${problemId}`, data).then(r => r.data);
  }
  const formData = new FormData();
  formData.append('cover', data.uploadedImage);
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'uploadedImage' || value == null) return;
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });
  return api.patch(`/admin/problems/${problemId}`, formData).then(r => r.data);
};

export const getAdminServiceRequests = (params) =>
  api.get('/admin/service-requests', { params }).then(r => r.data);

export const getAdminServiceRequestById = (serviceRequestId) =>
  api.get(`/admin/service-requests/${serviceRequestId}`).then(r => r.data);

export const requestEditAdminServiceRequest = (serviceRequestId, reason) =>
  api.patch(`/admin/service-requests/${serviceRequestId}/request-edit`, { reason }).then(r => r.data);

export const updateAdminServiceRequest = (serviceRequestId, data) =>
  api.patch(`/admin/service-requests/${serviceRequestId}`, data).then(r => r.data);

export const getAdminApprovedVles = (params) =>
  api.get('/admin/vles/approved', { params }).then(r => r.data);

export const getAdminPendingVles = (params) =>
  api.get('/admin/vles/pending', { params }).then(r => r.data);

export const getAdminVleDetails = (vleId) =>
  api.get(`/admin/vles/${vleId}`).then(r => r.data);

export const approveAdminVle = (vleId) =>
  api.patch(`/admin/vles/${vleId}/approve`).then(r => r.data);

export const rejectAdminVle = (vleId, reason) =>
  api.patch(`/admin/vles/${vleId}/reject`, { reason }).then(r => r.data);

export const updateAdminVle = (vleId, formData) =>
  api.patch(`/admin/vles/${vleId}`, formData).then(r => r.data);

export const getAdminVleSimilarProblems = (vleId, params) =>
  api.get(`/admin/vles/${vleId}/similar-problems`, { params }).then(r => r.data);

export const getAdminVlePilotRequests = (vleId, params) =>
  api.get(`/admin/vles/${vleId}/pilot-requests`, { params }).then(r => r.data);

export const startAdminPilot = (pilotId) =>
  api.patch(`/admin/pilots/${pilotId}/start`).then(r => r.data);

export const startAdminPilotTrial = (pilotId) =>
  api.patch(`/admin/pilots/${pilotId}/start-trial`).then(r => r.data);

export const markAdminPilotImplemented = (pilotId) =>
  api.patch(`/admin/pilots/${pilotId}/implement`).then(r => r.data);

export const cancelAdminPilot = (pilotId) =>
  api.delete(`/admin/pilots/${pilotId}`).then(r => r.data);

export const getAdminBusinessModelByPilot = (pilotId) =>
  api.get(`/admin/pilots/${pilotId}/business-model`).then(r => r.data);

export const updateAdminBusinessModel = (businessModelId, data) =>
  api.patch(`/admin/business-models/${businessModelId}`, data).then(r => r.data);

export const getAdminVleFieldReports = (vleId, params) =>
  api.get(`/admin/vles/${vleId}/field-reports`, { params }).then(r => r.data);

export const getAdminPilotFieldReports = (pilotId, params) =>
  api.get(`/admin/pilots/${pilotId}/field-reports`, { params }).then(r => r.data);

export const getAdminPilotById = (pilotId) =>
  api.get(`/admin/pilots/${pilotId}`).then(r => r.data);

export const getAdminPilots = (params) =>
  api.get('/admin/pilots', { params }).then(r => r.data);

export const getAdminBookkeepings = (params) =>
  api.get('/admin/bookkeeping', { params }).then(r => r.data);

export const getAdminBookkeepingById = (entryId) =>
  api.get(`/admin/bookkeeping/${entryId}`).then(r => r.data);

export const getAdminApprovedInnovators = (params) =>
  api.get('/admin/innovators/approved', { params }).then(r => r.data);

export const getAdminPendingInnovators = (params) =>
  api.get('/admin/innovators/pending', { params }).then(r => r.data);

export const getAdminPipelineInnovators = (params) =>
  api.get('/admin/pipeline-innovators', { params }).then(r => r.data);

export const getAdminInnovatorById = (innovatorId) =>
  api.get(`/admin/innovators/${innovatorId}`).then(r => r.data);

export const getAdminInnovatorInnovations = (innovatorId, params) =>
  api.get(`/admin/innovators/${innovatorId}/innovations`, { params }).then(r => r.data);

export const approveAdminInnovator = (innovatorId) =>
  api.patch(`/admin/innovators/${innovatorId}/approve`).then(r => r.data);

export const rejectAdminInnovator = (innovatorId, reason) =>
  api.patch(`/admin/innovators/${innovatorId}/reject`, { reason }).then(r => r.data);

export const updateAdminInnovator = (innovatorId, formData) =>
  api.patch(`/admin/innovators/${innovatorId}`, formData).then(r => r.data);

export const createAdminPipelineInnovator = (data) =>
  api.post('/admin/pipeline-innovators', data).then(r => r.data);

export const updateAdminPipelineInnovator = (innovatorId, data) =>
  api.patch(`/admin/pipeline-innovators/${innovatorId}`, data).then(r => r.data);

export const getAdminApprovedInnovations = (params) =>
  api.get('/admin/innovations/approved', { params }).then(r => r.data);

export const getAdminPendingInnovations = (params) =>
  api.get('/admin/innovations/pending', { params }).then(r => r.data);

export const getAdminInnovationById = (innovationId) =>
  api.get(`/admin/innovations/${innovationId}`).then(r => r.data);

export const approveAdminInnovation = (innovationId) =>
  api.patch(`/admin/innovations/${innovationId}/approve`).then(r => r.data);

export const rejectAdminInnovation = (innovationId, reason) =>
  api.patch(`/admin/innovations/${innovationId}/reject`, { reason }).then(r => r.data);

export const requestEditAdminInnovation = (innovationId, reason) =>
  api.patch(`/admin/innovations/${innovationId}/request-edit`, { reason }).then(r => r.data);

export const updateAdminInnovation = (innovationId, data) =>
  api.patch(`/admin/innovations/${innovationId}`, data).then(r => r.data);

export const deleteAdminInnovation = (innovationId) =>
  api.delete(`/admin/innovations/${innovationId}`).then(r => r.data);

export const getAdminContactViews = (params) =>
  api.get('/admin/contact-views', { params }).then(r => r.data);

export const getAdminAdmins = (params) =>
  api.get('/admin/admins', { params }).then(r => r.data);

export const createAdminAdmin = (data) =>
  api.post('/admin/admins/create', data).then(r => r.data);

export const deleteAdminAdmin = (adminId) =>
  api.delete(`/admin/admins/${adminId}`).then(r => r.data);

export const getAdminNotifications = (params) =>
  api.get('/admin/notifications', { params }).then(r => r.data);

export const markAllAdminNotificationsRead = () =>
  api.patch('/admin/notifications/read-all').then(r => r.data);

export const clearAllAdminNotifications = () =>
  api.delete('/admin/notifications').then(r => r.data);

export const deleteAdminNotification = (notificationId) =>
  api.delete(`/admin/notifications/${notificationId}`).then(r => r.data);

export const requestEditAdminVle = (vleId, reason) =>
  api.patch(`/admin/vles/${vleId}/request-edit`, { reason }).then(r => r.data);

export const requestEditAdminInnovator = (innovatorId, reason) =>
  api.patch(`/admin/innovators/${innovatorId}/request-edit`, { reason }).then(r => r.data);

export const requestEditAdminAo = (aoId, reason) =>
  api.patch(`/admin/affiliated-orgs/${aoId}/request-edit`, { reason }).then(r => r.data);

export const requestEditAdminNo = (noId, reason) =>
  api.patch(`/admin/nodal-orgs/${noId}/request-edit`, { reason }).then(r => r.data);

export const getAdminAnalytics = () =>
  api.get('/admin/analytics/all').then(r => r.data);

export const getAdminEcosystem = (params) =>
  api.get('/admin/analytics/ecosystem', { params }).then(r => r.data);

export const getAdminProblemAnalytics = (params) =>
  api.get('/admin/analytics/problems', { params }).then(r => r.data);

export const getAdminInnovationTrend = (params) =>
  api.get('/admin/analytics/innovation-trend', { params }).then(r => r.data);

export const getAdminInnovatorTrend = (params) =>
  api.get('/admin/analytics/innovator-trend', { params }).then(r => r.data);

export const getAdminVleContactTrend = (params) =>
  api.get('/admin/analytics/vle-contact-trend', { params }).then(r => r.data);

export const getAdminCategoryStats = () =>
  api.get('/admin/analytics/categories').then(r => r.data);

export const getAdminPipelineStats = () =>
  api.get('/admin/analytics/pipeline').then(r => r.data);

export const getAdminStateBreakdown = () =>
  api.get('/admin/analytics/state-breakdown').then(r => r.data);

export const getAdminNewsletterSubscriptions = (params) =>
  api.get('/admin/newsletter/subscriptions', { params }).then(r => r.data);
export const deleteAdminNewsletterSubscription = (subscriptionId) =>
  api.delete(`/admin/newsletter/subscriptions/${subscriptionId}`).then(r => r.data);
export const exportAdminNewsletterSubscriptions = (params) =>
  api.get('/admin/newsletter/export', { params, responseType: 'blob' }).then(r => r.data);

export const exportProblemsReport    = () => api.get('/admin/analytics/export/problems',    { responseType: 'blob' }).then(r => r.data);
export const exportInnovationsReport = () => api.get('/admin/analytics/export/innovations', { responseType: 'blob' }).then(r => r.data);
export const exportVLEsReport        = () => api.get('/admin/analytics/export/vles',        { responseType: 'blob' }).then(r => r.data);
export const exportAOsReport         = () => api.get('/admin/analytics/export/aos',         { responseType: 'blob' }).then(r => r.data);
export const exportNOsReport         = () => api.get('/admin/analytics/export/nos',         { responseType: 'blob' }).then(r => r.data);
