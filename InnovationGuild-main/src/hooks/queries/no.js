import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as noApi from '../../api/no';

const onError = (err) => toast.error(err?.response?.data?.message || 'Something went wrong');

export const useGetApprovedAos = (params) =>
  useQuery({
    queryKey: ['approvedAos', params],
    queryFn: () => noApi.getApprovedAos(params),
  });

export const useGetPendingAos = (params) =>
  useQuery({
    queryKey: ['pendingAos', params],
    queryFn: () => noApi.getPendingAos(params),
  });

export const useGetAoById = (aoId) =>
  useQuery({
    queryKey: ['ao', aoId],
    queryFn: () => noApi.getAoById(aoId),
    enabled: !!aoId,
  });

export const useGetAoVles = (aoId, params) =>
  useQuery({
    queryKey: ['aoVles', aoId, params],
    queryFn: () => noApi.getAoVles(aoId, params),
    enabled: !!aoId && params !== null,
  });

export const useGetAoProblems = (aoId, params) =>
  useQuery({
    queryKey: ['aoProblems', aoId, params],
    queryFn: () => noApi.getAoProblems(aoId, params),
    enabled: !!aoId && params !== null,
  });

export const useGetAoServiceRequests = (aoId, params) =>
  useQuery({
    queryKey: ['aoServiceRequests', aoId, params],
    queryFn: () => noApi.getAoServiceRequests(aoId, params),
    enabled: !!aoId && params !== null,
  });

export const useApproveAo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (aoId) => noApi.approveAo(aoId),
    onSuccess: (_, aoId) => {
      qc.invalidateQueries({ queryKey: ['ao', aoId] });
      qc.invalidateQueries({ queryKey: ['pendingAos'] });
      qc.invalidateQueries({ queryKey: ['approvedAos'] });
      toast.success('Organization approved');
    },
    onError,
  });
};

export const useRejectAo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ aoId, reason }) => noApi.rejectAo(aoId, reason),
    onSuccess: (_, { aoId }) => {
      qc.invalidateQueries({ queryKey: ['ao', aoId] });
      qc.invalidateQueries({ queryKey: ['pendingAos'] });
      toast.success('Organization rejected');
    },
    onError,
  });
};

export const useUpdateAo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ aoId, formData }) => noApi.updateAo(aoId, formData),
    onSuccess: (_, { aoId }) => {
      qc.invalidateQueries({ queryKey: ['ao', aoId] });
      toast.success('Organization updated successfully');
    },
    onError,
  });
};

export const useRequestEditNoAo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ aoId, reason }) => noApi.requestEditNoAo(aoId, reason),
    onSuccess: (_, { aoId }) => {
      qc.invalidateQueries({ queryKey: ['ao', aoId] });
      qc.invalidateQueries({ queryKey: ['pendingAos'] });
      toast.success('Edit requested');
    },
    onError,
  });
};
