import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as orgApi from '../../api/org';

const onError = (err) => toast.error(err?.response?.data?.message || 'Something went wrong');

export const useGetOrgOverview = () =>
  useQuery({
    queryKey: ['orgOverview'],
    queryFn: orgApi.getOrgOverview,
  });

export const useGetOrgProblemsList = (params) =>
  useQuery({
    queryKey: ['orgProblemsList', params],
    queryFn: () => orgApi.getOrgProblemsList(params),
    enabled: params !== null,
  });

export const useGetOrgServiceRequestsList = (params) =>
  useQuery({
    queryKey: ['orgServiceRequestsList', params],
    queryFn: () => orgApi.getOrgServiceRequestsList(params),
    enabled: params !== null,
  });

export const useGetOrgProblemById = (problemId) =>
  useQuery({
    queryKey: ['orgProblem', problemId],
    queryFn: () => orgApi.getOrgProblemById(problemId),
    enabled: !!problemId,
  });

export const useGetOrgProblemView = (problemId) =>
  useQuery({
    queryKey: ['orgProblemView', problemId],
    queryFn: () => orgApi.getOrgProblemView(problemId),
    enabled: !!problemId,
  });

export const useGetOrgServiceRequestById = (serviceRequestId) =>
  useQuery({
    queryKey: ['orgServiceRequest', serviceRequestId],
    queryFn: () => orgApi.getOrgServiceRequestById(serviceRequestId),
    enabled: !!serviceRequestId,
  });

export const useApproveProblem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (problemId) => orgApi.approveOrgProblem(problemId),
    onSuccess: (_, problemId) => {
      qc.invalidateQueries({ queryKey: ['orgProblem', problemId] });
      qc.invalidateQueries({ queryKey: ['orgProblemsList'] });
      toast.success('Problem approved');
    },
    onError,
  });
};

export const useRejectProblem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ problemId, rejectionReason }) => orgApi.rejectOrgProblem(problemId, rejectionReason),
    onSuccess: (_, { problemId }) => {
      qc.invalidateQueries({ queryKey: ['orgProblem', problemId] });
      qc.invalidateQueries({ queryKey: ['orgProblemsList'] });
      toast.success('Problem rejected');
    },
    onError,
  });
};

export const useRequestEditProblem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ problemId, reason }) => orgApi.requestEditOrgProblem(problemId, reason),
    onSuccess: (_, { problemId }) => {
      qc.invalidateQueries({ queryKey: ['orgProblem', problemId] });
      qc.invalidateQueries({ queryKey: ['orgProblemsList'] });
      toast.success('Edit requested');
    },
    onError,
  });
};

export const useUpdateOrgProblem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ problemId, data }) => orgApi.updateOrgProblem(problemId, data),
    onSuccess: (_, { problemId }) => {
      qc.invalidateQueries({ queryKey: ['orgProblem', problemId] });
      toast.success('Problem updated successfully');
    },
    onError,
  });
};

export const useCreateOrgProblem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => orgApi.createOrgProblemForVle(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orgProblemsList'] });
      toast.success('Problem submitted successfully');
    },
    onError,
  });
};

export const useCreateOrgServiceRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => orgApi.createOrgServiceRequestForVle(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orgServiceRequestsList'] });
      toast.success('Service request submitted successfully');
    },
    onError,
  });
};

export const useUpdateOrgServiceRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceRequestId, data }) => orgApi.updateOrgServiceRequest(serviceRequestId, data),
    onSuccess: (_, { serviceRequestId }) => {
      qc.invalidateQueries({ queryKey: ['orgServiceRequest', serviceRequestId] });
      toast.success('Service request updated successfully');
    },
    onError,
  });
};

export const useGetOrgApprovedVles = (params) =>
  useQuery({
    queryKey: ['orgApprovedVles', params],
    queryFn: () => orgApi.getOrgApprovedVles(params),
    enabled: params !== null,
  });

export const useGetOrgPendingVles = (params) =>
  useQuery({
    queryKey: ['orgPendingVles', params],
    queryFn: () => orgApi.getOrgPendingVles(params),
    enabled: params !== null,
  });

export const useGetOrgVleDetails = (vleId) =>
  useQuery({
    queryKey: ['orgVleDetails', vleId],
    queryFn: () => orgApi.getOrgVleDetails(vleId),
    enabled: !!vleId,
  });

export const useApproveOrgVle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vleId) => orgApi.approveOrgVle(vleId),
    onSuccess: (_, vleId) => {
      qc.invalidateQueries({ queryKey: ['orgVleDetails', vleId] });
      qc.invalidateQueries({ queryKey: ['orgPendingVles'] });
      qc.invalidateQueries({ queryKey: ['orgApprovedVles'] });
      toast.success('VLE approved');
    },
    onError,
  });
};

export const useRejectOrgVle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ vleId, rejectionReason }) => orgApi.rejectOrgVle(vleId, rejectionReason),
    onSuccess: (_, { vleId }) => {
      qc.invalidateQueries({ queryKey: ['orgVleDetails', vleId] });
      qc.invalidateQueries({ queryKey: ['orgPendingVles'] });
      toast.success('VLE rejected');
    },
    onError,
  });
};

export const useUpdateOrgVle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ vleId, formData }) => orgApi.updateOrgVle(vleId, formData),
    onSuccess: (_, { vleId }) => {
      qc.invalidateQueries({ queryKey: ['orgVleDetails', vleId] });
      toast.success('VLE updated successfully');
    },
    onError,
  });
};

export const useGetOrgVleSimilarProblems = (vleId, params) =>
  useQuery({
    queryKey: ['orgVleSimilarProblems', vleId, params],
    queryFn: () => orgApi.getOrgVleSimilarProblems(vleId, params),
    enabled: !!vleId && params !== null,
  });

export const useGetOrgVlePilotRequests = (vleId, params) =>
  useQuery({
    queryKey: ['orgVlePilotRequests', vleId, params],
    queryFn: () => orgApi.getOrgVlePilotRequests(vleId, params),
    enabled: !!vleId && params !== null,
  });

export const useGetOrgVlePilotRequestContext = (vleId) =>
  useQuery({
    queryKey: ['orgVlePilotRequestContext', vleId],
    queryFn: () => orgApi.getOrgVlePilotRequestContext(vleId),
    enabled: !!vleId,
  });

export const useCreateOrgVlePilotRequest = () =>
  useMutation({
    mutationFn: ({ vleId, data }) => orgApi.createOrgVlePilotRequest(vleId, data),
    onSuccess: () => toast.success('Pilot request created successfully'),
    onError,
  });

export const useStartOrgPilot = () =>
  useMutation({
    mutationFn: (pilotId) => orgApi.startOrgPilot(pilotId),
    onSuccess: () => toast.success('Pilot started successfully'),
    onError,
  });

export const useStartOrgPilotTrial = () =>
  useMutation({
    mutationFn: (pilotId) => orgApi.startOrgPilotTrial(pilotId),
    onSuccess: () => toast.success('Trial started successfully'),
    onError,
  });

export const useMarkOrgPilotImplemented = () =>
  useMutation({
    mutationFn: (pilotId) => orgApi.markOrgPilotImplemented(pilotId),
    onSuccess: () => toast.success('Pilot marked as implemented'),
    onError,
  });

export const useCancelOrgPilot = () =>
  useMutation({
    mutationFn: (pilotId) => orgApi.cancelOrgPilot(pilotId),
    onSuccess: () => toast.success('Pilot cancelled'),
    onError,
  });

export const useGetOrgPilotById = (pilotId) =>
  useQuery({
    queryKey: ['org', 'pilot', pilotId],
    queryFn: () => orgApi.getOrgPilotById(pilotId),
    enabled: !!pilotId,
  });

export const useGetOrgBusinessModelByPilot = (pilotId) =>
  useQuery({
    queryKey: ['orgBusinessModel', pilotId],
    queryFn: () => orgApi.getOrgBusinessModelByPilot(pilotId),
    enabled: !!pilotId,
    retry: false,
  });

export const useCreateOrgBusinessModel = () =>
  useMutation({
    mutationFn: ({ pilotId, data }) => orgApi.createOrgBusinessModel(pilotId, data),
    onSuccess: () => toast.success('Business model saved'),
    onError,
  });

export const useUpdateOrgBusinessModel = () =>
  useMutation({
    mutationFn: ({ pilotId, data }) => orgApi.updateOrgBusinessModel(pilotId, data),
    onSuccess: () => toast.success('Business model updated'),
    onError,
  });

export const useGetOrgVleFieldReports = (vleId, params) =>
  useQuery({
    queryKey: ['orgVleFieldReports', vleId, params],
    queryFn: () => orgApi.getOrgVleFieldReports(vleId, params),
    enabled: !!vleId && params !== null,
  });

export const useGetOrgPilotFieldReports = (pilotId, params) =>
  useQuery({
    queryKey: ['orgPilotFieldReports', pilotId, params],
    queryFn: () => orgApi.getOrgPilotFieldReports(pilotId, params),
    enabled: !!pilotId && params !== null,
  });

export const useGetOrgPilots = (params) =>
  useQuery({
    queryKey: ['orgPilots', params],
    queryFn: () => orgApi.getOrgPilots(params),
    enabled: params !== null,
  });

export const useGetOrgFieldReportDetails = (reportId) =>
  useQuery({
    queryKey: ['orgFieldReport', reportId],
    queryFn: () => orgApi.getOrgFieldReportDetails(reportId),
    enabled: !!reportId,
  });

export const useGetOrgVleBookkeepings = (vleId, params) =>
  useQuery({
    queryKey: ['orgVleBookkeepings', vleId, params],
    queryFn: () => orgApi.getOrgVleBookkeepings(vleId, params),
    enabled: !!vleId && params !== null,
  });

export const useGetOrgVleBookkeepingById = (vleId, bookkeepingId) =>
  useQuery({
    queryKey: ['orgVleBookkeeping', vleId, bookkeepingId],
    queryFn: () => orgApi.getOrgVleBookkeepingById(vleId, bookkeepingId),
    enabled: !!vleId && !!bookkeepingId,
  });

export const useGetOrgInnovationById = (innovationId) =>
  useQuery({
    queryKey: ['orgInnovation', innovationId],
    queryFn: () => orgApi.getOrgInnovationById(innovationId),
    enabled: !!innovationId,
  });

export const useRequestEditOrgVle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ vleId, reason }) => orgApi.requestEditOrgVle(vleId, reason),
    onSuccess: (_, { vleId }) => {
      qc.invalidateQueries({ queryKey: ['orgVleDetails', vleId] });
      qc.invalidateQueries({ queryKey: ['orgPendingVles'] });
      toast.success('Edit requested');
    },
    onError,
  });
};
