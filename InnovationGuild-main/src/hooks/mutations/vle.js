import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as vleApi from '../../api/vle';

export const useCreatePilotRequest = () =>
  useMutation({
    mutationFn: ({ innovationId, problemId }) =>
      vleApi.createPilotRequest(innovationId, problemId ? { problemId } : {}),
    onSuccess: () => toast.success('Pilot request submitted! Please fill in the Business Model form.'),
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed to submit pilot request'),
  });

export const useCreateBusinessModel = () =>
  useMutation({
    mutationFn: (data) => vleApi.createBusinessModel(data),
    onSuccess: () => toast.success('Business model submitted successfully!'),
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed to submit business model'),
  });

export const useCreateBookkeepingEntry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => vleApi.createBookkeepingEntry(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myBookkeepingEntries'] });
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed to submit bookkeeping entry'),
  });
};

export const useToggleFacingSimilar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (problemId) => vleApi.toggleFacingSimilar(problemId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['facingSimilarProblems'] });
      if (res.data.interested) toast.success('Marked as facing similar problem');
    },
    onError: () => toast.error('Something went wrong'),
  });
};
