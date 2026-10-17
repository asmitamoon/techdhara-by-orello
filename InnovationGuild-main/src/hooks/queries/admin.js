import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as adminApi from '../../api/admin';

const onError = (err) => toast.error(err?.response?.data?.message || 'Something went wrong');

export const useGetAdminOverview = () =>
  useQuery({
    queryKey: ['adminOverview'],
    queryFn: adminApi.getAdminOverview,
    onError,
  });

export const useGetAdminAos = (params) =>
  useQuery({
    queryKey: ['adminAos', params],
    queryFn: () => adminApi.getAdminAos(params),
    enabled: params !== null,
  });

export const useGetAdminAoById = (aoId) =>
  useQuery({
    queryKey: ['adminAo', aoId],
    queryFn: () => adminApi.getAdminAoById(aoId),
    enabled: !!aoId,
  });

export const useGetAdminAoVles = (aoId, params) =>
  useQuery({
    queryKey: ['adminAoVles', aoId, params],
    queryFn: () => adminApi.getAdminAoVles(aoId, params),
    enabled: !!aoId && params !== null,
  });

export const useGetAdminAoProblems = (aoId, params) =>
  useQuery({
    queryKey: ['adminAoProblems', aoId, params],
    queryFn: () => adminApi.getAdminAoProblems(aoId, params),
    enabled: !!aoId && params !== null,
  });

export const useGetAdminAoServiceRequests = (aoId, params) =>
  useQuery({
    queryKey: ['adminAoServiceRequests', aoId, params],
    queryFn: () => adminApi.getAdminAoServiceRequests(aoId, params),
    enabled: !!aoId && params !== null,
  });

export const useApproveAdminAo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (aoId) => adminApi.approveAdminAo(aoId),
    onSuccess: (_, aoId) => {
      qc.invalidateQueries({ queryKey: ['adminAo', aoId] });
      qc.invalidateQueries({ queryKey: ['adminAos'] });
      toast.success('Organization approved');
    },
    onError,
  });
};

export const useRejectAdminAo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ aoId, reason }) => adminApi.rejectAdminAo(aoId, reason),
    onSuccess: (_, { aoId }) => {
      qc.invalidateQueries({ queryKey: ['adminAo', aoId] });
      qc.invalidateQueries({ queryKey: ['adminAos'] });
      toast.success('Organization rejected');
    },
    onError,
  });
};

export const useUpdateAdminAo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ aoId, formData }) => adminApi.updateAdminAo(aoId, formData),
    onSuccess: (_, { aoId }) => {
      qc.invalidateQueries({ queryKey: ['adminAo', aoId] });
      toast.success('Organization updated successfully');
    },
    onError,
  });
};

export const useGetAdminNos = (params) =>
  useQuery({
    queryKey: ['adminNos', params],
    queryFn: () => adminApi.getAdminNos(params),
    enabled: params !== null,
  });

export const useGetAdminNoById = (noId) =>
  useQuery({
    queryKey: ['adminNo', noId],
    queryFn: () => adminApi.getAdminNoById(noId),
    enabled: !!noId,
  });

export const useGetAdminNoAos = (noId, params) =>
  useQuery({
    queryKey: ['adminNoAos', noId, params],
    queryFn: () => adminApi.getAdminNoAos(noId, params),
    enabled: !!noId && params !== null,
  });

export const useGetAdminNoProblems = (noId, params) =>
  useQuery({
    queryKey: ['adminNoProblems', noId, params],
    queryFn: () => adminApi.getAdminNoProblems(noId, params),
    enabled: !!noId && params !== null,
  });

export const useGetAdminNoServiceRequests = (noId, params) =>
  useQuery({
    queryKey: ['adminNoServiceRequests', noId, params],
    queryFn: () => adminApi.getAdminNoServiceRequests(noId, params),
    enabled: !!noId && params !== null,
  });

export const useApproveAdminNo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noId) => adminApi.approveAdminNo(noId),
    onSuccess: (_, noId) => {
      qc.invalidateQueries({ queryKey: ['adminNo', noId] });
      qc.invalidateQueries({ queryKey: ['adminNos'] });
      toast.success('Organization approved');
    },
    onError,
  });
};

export const useRejectAdminNo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ noId, reason }) => adminApi.rejectAdminNo(noId, reason),
    onSuccess: (_, { noId }) => {
      qc.invalidateQueries({ queryKey: ['adminNo', noId] });
      qc.invalidateQueries({ queryKey: ['adminNos'] });
      toast.success('Organization rejected');
    },
    onError,
  });
};

export const useUpdateAdminNo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ noId, formData }) => adminApi.updateAdminNo(noId, formData),
    onSuccess: (_, { noId }) => {
      qc.invalidateQueries({ queryKey: ['adminNo', noId] });
      toast.success('Organization updated successfully');
    },
    onError,
  });
};

export const useGetAdminProblems = (params) =>
  useQuery({
    queryKey: ['adminProblems', params],
    queryFn: () => adminApi.getAdminProblems(params),
    enabled: params !== null,
  });

export const useGetAdminProblemById = (id) =>
  useQuery({
    queryKey: ['adminProblem', id],
    queryFn: () => adminApi.getAdminProblemById(id),
    enabled: !!id,
  });

export const useApproveAdminProblem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (problemId) => adminApi.approveAdminProblem(problemId),
    onSuccess: (_, problemId) => {
      qc.invalidateQueries({ queryKey: ['adminProblem', problemId] });
      qc.invalidateQueries({ queryKey: ['adminProblems'] });
      toast.success('Problem approved');
    },
    onError,
  });
};

export const useRejectAdminProblem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ problemId, rejectionReason }) => adminApi.rejectAdminProblem(problemId, rejectionReason),
    onSuccess: (_, { problemId }) => {
      qc.invalidateQueries({ queryKey: ['adminProblem', problemId] });
      qc.invalidateQueries({ queryKey: ['adminProblems'] });
      toast.success('Problem rejected');
    },
    onError,
  });
};

export const useRequestEditAdminProblem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ problemId, reason }) => adminApi.requestEditAdminProblem(problemId, reason),
    onSuccess: (_, { problemId }) => {
      qc.invalidateQueries({ queryKey: ['adminProblem', problemId] });
      qc.invalidateQueries({ queryKey: ['adminProblems'] });
      toast.success('Edit requested');
    },
    onError,
  });
};

export const useUpdateAdminProblem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ problemId, data }) => adminApi.updateAdminProblem(problemId, data),
    onSuccess: (_, { problemId }) => {
      qc.invalidateQueries({ queryKey: ['adminProblem', problemId] });
      toast.success('Problem updated successfully');
    },
    onError,
  });
};

export const useGetAdminServiceRequests = (params) =>
  useQuery({
    queryKey: ['adminServiceRequests', params],
    queryFn: () => adminApi.getAdminServiceRequests(params),
    enabled: params !== null,
  });

export const useGetAdminServiceRequestById = (id) =>
  useQuery({
    queryKey: ['adminServiceRequest', id],
    queryFn: () => adminApi.getAdminServiceRequestById(id),
    enabled: !!id,
  });

export const useRequestEditAdminServiceRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceRequestId, reason }) => adminApi.requestEditAdminServiceRequest(serviceRequestId, reason),
    onSuccess: (_, { serviceRequestId }) => {
      qc.invalidateQueries({ queryKey: ['adminServiceRequest', serviceRequestId] });
      qc.invalidateQueries({ queryKey: ['adminServiceRequests'] });
      toast.success('Edit requested');
    },
    onError,
  });
};

export const useUpdateAdminServiceRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceRequestId, data }) => adminApi.updateAdminServiceRequest(serviceRequestId, data),
    onSuccess: (_, { serviceRequestId }) => {
      qc.invalidateQueries({ queryKey: ['adminServiceRequest', serviceRequestId] });
      toast.success('Service request updated successfully');
    },
    onError,
  });
};

export const useGetAdminApprovedVles = (params) =>
  useQuery({
    queryKey: ['adminApprovedVles', params],
    queryFn: () => adminApi.getAdminApprovedVles(params),
    enabled: params !== null,
  });

export const useGetAdminPendingVles = (params) =>
  useQuery({
    queryKey: ['adminPendingVles', params],
    queryFn: () => adminApi.getAdminPendingVles(params),
    enabled: params !== null,
  });

export const useGetAdminVleDetails = (vleId) =>
  useQuery({
    queryKey: ['adminVle', vleId],
    queryFn: () => adminApi.getAdminVleDetails(vleId),
    enabled: !!vleId,
  });

export const useApproveAdminVle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vleId) => adminApi.approveAdminVle(vleId),
    onSuccess: (_, vleId) => {
      qc.invalidateQueries({ queryKey: ['adminVle', vleId] });
      qc.invalidateQueries({ queryKey: ['adminApprovedVles'] });
      qc.invalidateQueries({ queryKey: ['adminPendingVles'] });
      toast.success('VLE approved');
    },
    onError,
  });
};

export const useRejectAdminVle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ vleId, reason }) => adminApi.rejectAdminVle(vleId, reason),
    onSuccess: (_, { vleId }) => {
      qc.invalidateQueries({ queryKey: ['adminVle', vleId] });
      qc.invalidateQueries({ queryKey: ['adminApprovedVles'] });
      qc.invalidateQueries({ queryKey: ['adminPendingVles'] });
      toast.success('VLE rejected');
    },
    onError,
  });
};

export const useUpdateAdminVle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ vleId, formData }) => adminApi.updateAdminVle(vleId, formData),
    onSuccess: (_, { vleId }) => {
      qc.invalidateQueries({ queryKey: ['adminVle', vleId] });
      toast.success('VLE updated successfully');
    },
    onError,
  });
};

export const useGetAdminVleSimilarProblems = (vleId, params) =>
  useQuery({
    queryKey: ['adminVleSimilarProblems', vleId, params],
    queryFn: () => adminApi.getAdminVleSimilarProblems(vleId, params),
    enabled: !!vleId && params !== null,
  });

export const useGetAdminVlePilotRequests = (vleId, params) =>
  useQuery({
    queryKey: ['adminVlePilotRequests', vleId, params],
    queryFn: () => adminApi.getAdminVlePilotRequests(vleId, params),
    enabled: !!vleId && params !== null,
  });

export const useStartAdminPilot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pilotId) => adminApi.startAdminPilot(pilotId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminVlePilotRequests'] }); toast.success('Pilot started'); },
    onError,
  });
};

export const useStartAdminPilotTrial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pilotId) => adminApi.startAdminPilotTrial(pilotId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminVlePilotRequests'] }); toast.success('Trial started'); },
    onError,
  });
};

export const useMarkAdminPilotImplemented = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pilotId) => adminApi.markAdminPilotImplemented(pilotId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminVlePilotRequests'] }); toast.success('Pilot implemented'); },
    onError,
  });
};

export const useCancelAdminPilot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pilotId) => adminApi.cancelAdminPilot(pilotId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminVlePilotRequests'] }); toast.success('Pilot cancelled'); },
    onError,
  });
};

export const useGetAdminBusinessModelByPilot = (pilotId) =>
  useQuery({
    queryKey: ['adminBusinessModel', pilotId],
    queryFn: () => adminApi.getAdminBusinessModelByPilot(pilotId),
    enabled: !!pilotId,
    retry: false,
  });

export const useUpdateAdminBusinessModel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ businessModelId, data }) => adminApi.updateAdminBusinessModel(businessModelId, data),
    onSuccess: (_, { pilotId }) => {
      qc.invalidateQueries({ queryKey: ['adminBusinessModel', pilotId] });
      qc.invalidateQueries({ queryKey: ['adminVlePilotRequests'] });
      toast.success('Business model updated');
    },
    onError,
  });
};

export const useGetAdminVleFieldReports = (vleId, params) =>
  useQuery({
    queryKey: ['adminVleFieldReports', vleId, params],
    queryFn: () => adminApi.getAdminVleFieldReports(vleId, params),
    enabled: !!vleId && params !== null,
  });

export const useGetAdminPilotFieldReports = (pilotId, params) =>
  useQuery({
    queryKey: ['adminPilotFieldReports', pilotId, params],
    queryFn: () => adminApi.getAdminPilotFieldReports(pilotId, params),
    enabled: !!pilotId && params !== null,
  });

export const useGetAdminPilotById = (pilotId) =>
  useQuery({
    queryKey: ['adminPilot', pilotId],
    queryFn: () => adminApi.getAdminPilotById(pilotId),
    enabled: !!pilotId,
  });

export const useGetAdminPilots = (params) =>
  useQuery({
    queryKey: ['adminPilots', params],
    queryFn: () => adminApi.getAdminPilots(params),
    enabled: params !== null,
  });

export const useGetAdminBookkeepings = (params) =>
  useQuery({
    queryKey: ['adminBookkeepings', params],
    queryFn: () => adminApi.getAdminBookkeepings(params),
    enabled: params !== null,
  });

export const useGetAdminBookkeepingById = (entryId) =>
  useQuery({
    queryKey: ['adminBookkeeping', entryId],
    queryFn: () => adminApi.getAdminBookkeepingById(entryId),
    enabled: !!entryId,
  });

export const useGetAdminApprovedInnovators = (params) =>
  useQuery({
    queryKey: ['adminApprovedInnovators', params],
    queryFn: () => adminApi.getAdminApprovedInnovators(params),
    enabled: params !== null,
  });

export const useGetAdminPendingInnovators = (params) =>
  useQuery({
    queryKey: ['adminPendingInnovators', params],
    queryFn: () => adminApi.getAdminPendingInnovators(params),
    enabled: params !== null,
  });

export const useGetAdminPipelineInnovators = (params) =>
  useQuery({
    queryKey: ['adminPipelineInnovators', params],
    queryFn: () => adminApi.getAdminPipelineInnovators(params),
    enabled: params !== null,
  });

export const useGetAdminInnovatorById = (innovatorId) =>
  useQuery({
    queryKey: ['adminInnovator', innovatorId],
    queryFn: () => adminApi.getAdminInnovatorById(innovatorId),
    enabled: !!innovatorId,
  });

export const useGetAdminInnovatorInnovations = (innovatorId, params) =>
  useQuery({
    queryKey: ['adminInnovatorInnovations', innovatorId, params],
    queryFn: () => adminApi.getAdminInnovatorInnovations(innovatorId, params),
    enabled: !!innovatorId && params !== null,
  });

export const useApproveAdminInnovator = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (innovatorId) => adminApi.approveAdminInnovator(innovatorId),
    onSuccess: (_, innovatorId) => {
      qc.invalidateQueries({ queryKey: ['adminInnovator', innovatorId] });
      qc.invalidateQueries({ queryKey: ['adminApprovedInnovators'] });
      qc.invalidateQueries({ queryKey: ['adminPendingInnovators'] });
      toast.success('Innovator approved');
    },
    onError,
  });
};

export const useRejectAdminInnovator = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ innovatorId, reason }) => adminApi.rejectAdminInnovator(innovatorId, reason),
    onSuccess: (_, { innovatorId }) => {
      qc.invalidateQueries({ queryKey: ['adminInnovator', innovatorId] });
      qc.invalidateQueries({ queryKey: ['adminApprovedInnovators'] });
      qc.invalidateQueries({ queryKey: ['adminPendingInnovators'] });
      toast.success('Innovator rejected');
    },
    onError,
  });
};

export const useUpdateAdminInnovator = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ innovatorId, formData }) => adminApi.updateAdminInnovator(innovatorId, formData),
    onSuccess: (_, { innovatorId }) => {
      qc.invalidateQueries({ queryKey: ['adminInnovator', innovatorId] });
      toast.success('Innovator updated successfully');
    },
    onError,
  });
};

export const useGetAdminApprovedInnovations = (params) =>
  useQuery({
    queryKey: ['adminApprovedInnovations', params],
    queryFn: () => adminApi.getAdminApprovedInnovations(params),
    enabled: params !== null,
  });

export const useGetAdminPendingInnovations = (params) =>
  useQuery({
    queryKey: ['adminPendingInnovations', params],
    queryFn: () => adminApi.getAdminPendingInnovations(params),
    enabled: params !== null,
  });

export const useGetAdminInnovationById = (id) =>
  useQuery({
    queryKey: ['adminInnovation', id],
    queryFn: () => adminApi.getAdminInnovationById(id),
    enabled: !!id,
  });

export const useApproveAdminInnovation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (innovationId) => adminApi.approveAdminInnovation(innovationId),
    onSuccess: (_, innovationId) => {
      qc.invalidateQueries({ queryKey: ['adminInnovation', innovationId] });
      qc.invalidateQueries({ queryKey: ['adminApprovedInnovations'] });
      qc.invalidateQueries({ queryKey: ['adminPendingInnovations'] });
      toast.success('Innovation approved');
    },
    onError,
  });
};

export const useRejectAdminInnovation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ innovationId, reason }) => adminApi.rejectAdminInnovation(innovationId, reason),
    onSuccess: (_, { innovationId }) => {
      qc.invalidateQueries({ queryKey: ['adminInnovation', innovationId] });
      qc.invalidateQueries({ queryKey: ['adminPendingInnovations'] });
      toast.success('Innovation rejected');
    },
    onError,
  });
};

export const useRequestEditAdminInnovation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ innovationId, reason }) => adminApi.requestEditAdminInnovation(innovationId, reason),
    onSuccess: (_, { innovationId }) => {
      qc.invalidateQueries({ queryKey: ['adminInnovation', innovationId] });
      qc.invalidateQueries({ queryKey: ['adminApprovedInnovations'] });
      qc.invalidateQueries({ queryKey: ['adminPendingInnovations'] });
      toast.success('Edit requested');
    },
    onError,
  });
};

export const useUpdateAdminInnovation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ innovationId, data }) => adminApi.updateAdminInnovation(innovationId, data),
    onSuccess: (_, { innovationId }) => {
      qc.invalidateQueries({ queryKey: ['adminInnovation', innovationId] });
      qc.invalidateQueries({ queryKey: ['adminApprovedInnovations'] });
      toast.success('Innovation updated');
    },
    onError,
  });
};

// SUPER_ADMIN only. Backend cascades dependents and refuses (409) if the innovation has pilots;
// onError surfaces that message.
export const useDeleteAdminInnovation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (innovationId) => adminApi.deleteAdminInnovation(innovationId),
    onSuccess: (_, innovationId) => {
      qc.removeQueries({ queryKey: ['adminInnovation', innovationId] });
      qc.invalidateQueries({ queryKey: ['adminApprovedInnovations'] });
      qc.invalidateQueries({ queryKey: ['adminPendingInnovations'] });
      toast.success('Innovation deleted');
    },
    onError,
  });
};

export const useCreateAdminPipelineInnovator = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminApi.createAdminPipelineInnovator(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminPipelineInnovators'] });
      toast.success('Innovator added to pipeline');
    },
    onError,
  });
};

export const useUpdateAdminPipelineInnovator = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ innovatorId, data }) => adminApi.updateAdminPipelineInnovator(innovatorId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminPipelineInnovators'] });
      toast.success('Innovator updated');
    },
    onError,
  });
};

export const useGetAdminContactViews = (params) =>
  useQuery({
    queryKey: ['adminContactViews', params],
    queryFn: () => adminApi.getAdminContactViews(params),
  });

export const useGetAdminAdmins = (params) =>
  useQuery({
    queryKey: ['adminAdmins', params],
    queryFn: () => adminApi.getAdminAdmins(params),
  });

export const useCreateAdminAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminApi.createAdminAdmin(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminAdmins'] });
      toast.success('Admin created successfully');
    },
    onError,
  });
};

export const useDeleteAdminAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (adminId) => adminApi.deleteAdminAdmin(adminId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminAdmins'] });
      toast.success('Admin deleted successfully');
    },
    onError,
  });
};

export const useGetAdminNotifications = (params, options = {}) =>
  useQuery({
    queryKey: ['adminNotifications', params],
    queryFn: () => adminApi.getAdminNotifications(params),
    ...options,
  });

export const useMarkAllAdminNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.markAllAdminNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminNotifications'] }),
    onError,
  });
};

export const useClearAllAdminNotifications = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.clearAllAdminNotifications,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminNotifications'] });
      toast.success('All notifications cleared');
    },
    onError,
  });
};

export const useDeleteAdminNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId) => adminApi.deleteAdminNotification(notificationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminNotifications'] }),
    onError,
  });
};

export const useRequestEditAdminVle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ vleId, reason }) => adminApi.requestEditAdminVle(vleId, reason),
    onSuccess: (_, { vleId }) => {
      qc.invalidateQueries({ queryKey: ['adminVle', vleId] });
      qc.invalidateQueries({ queryKey: ['adminPendingVles'] });
      toast.success('Edit requested');
    },
    onError,
  });
};

export const useRequestEditAdminInnovator = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ innovatorId, reason }) => adminApi.requestEditAdminInnovator(innovatorId, reason),
    onSuccess: (_, { innovatorId }) => {
      qc.invalidateQueries({ queryKey: ['adminInnovator', innovatorId] });
      qc.invalidateQueries({ queryKey: ['adminPendingInnovators'] });
      toast.success('Edit requested');
    },
    onError,
  });
};

export const useRequestEditAdminAo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ aoId, reason }) => adminApi.requestEditAdminAo(aoId, reason),
    onSuccess: (_, { aoId }) => {
      qc.invalidateQueries({ queryKey: ['adminAo', aoId] });
      qc.invalidateQueries({ queryKey: ['adminAos'] });
      toast.success('Edit requested');
    },
    onError,
  });
};

export const useRequestEditAdminNo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ noId, reason }) => adminApi.requestEditAdminNo(noId, reason),
    onSuccess: (_, { noId }) => {
      qc.invalidateQueries({ queryKey: ['adminNo', noId] });
      qc.invalidateQueries({ queryKey: ['adminNos'] });
      toast.success('Edit requested');
    },
    onError,
  });
};

export const useGetAdminAnalytics = () =>
  useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: adminApi.getAdminAnalytics,
  });

export const useGetAdminEcosystem = (params, options = {}) =>
  useQuery({
    queryKey: ['adminEcosystem', params],
    queryFn: () => adminApi.getAdminEcosystem(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useGetAdminProblemAnalytics = (params, options = {}) =>
  useQuery({
    queryKey: ['adminProblemAnalytics', params],
    queryFn: () => adminApi.getAdminProblemAnalytics(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useGetAdminInnovationTrend = (params, options = {}) =>
  useQuery({
    queryKey: ['adminInnovationTrend', params],
    queryFn: () => adminApi.getAdminInnovationTrend(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useGetAdminInnovatorTrend = (params, options = {}) =>
  useQuery({
    queryKey: ['adminInnovatorTrend', params],
    queryFn: () => adminApi.getAdminInnovatorTrend(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useGetAdminVleContactTrend = (params, options = {}) =>
  useQuery({
    queryKey: ['adminVleContactTrend', params],
    queryFn: () => adminApi.getAdminVleContactTrend(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useGetAdminCategoryStats = () =>
  useQuery({
    queryKey: ['adminCategoryStats'],
    queryFn: adminApi.getAdminCategoryStats,
    staleTime: 5 * 60 * 1000,
  });

export const useGetAdminPipelineStats = () =>
  useQuery({
    queryKey: ['adminPipelineStats'],
    queryFn: adminApi.getAdminPipelineStats,
    staleTime: 5 * 60 * 1000,
  });

export const useGetAdminStateBreakdown = () =>
  useQuery({
    queryKey: ['adminStateBreakdown'],
    queryFn: adminApi.getAdminStateBreakdown,
    staleTime: 5 * 60 * 1000,
  });

export const useGetAdminNewsletterSubscriptions = (params) =>
  useQuery({
    queryKey: ['adminNewsletterSubscriptions', params],
    queryFn: () => adminApi.getAdminNewsletterSubscriptions(params),
  });

export const useDeleteAdminNewsletterSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.deleteAdminNewsletterSubscription(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminNewsletterSubscriptions'] });
      toast.success('Subscription deleted');
    },
    onError,
  });
};
