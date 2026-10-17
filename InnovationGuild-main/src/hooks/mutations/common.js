import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as commonApi from '../../api/common';

export const useCreateProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: commonApi.createProblem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myProblems'] }),
  });
};

export const useSubmitProblemForApproval = () =>
  useMutation({ mutationFn: commonApi.submitProblemForApproval });

export const useCreateServiceRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: commonApi.createServiceRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myServiceRequests'] }),
  });
};

export const useSubmitServiceRequestForApproval = () =>
  useMutation({ mutationFn: commonApi.submitServiceRequestForApproval });

export const useUpdateProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: commonApi.updateProblem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProblems'] });
      queryClient.invalidateQueries({ queryKey: ['problem'] });
    },
  });
};

export const useUpdateServiceRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: commonApi.updateServiceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myServiceRequests'] });
      queryClient.invalidateQueries({ queryKey: ['serviceRequest'] });
    },
  });
};

const getCommentError = (e) =>
  e?.response?.data?.errors?.[0]?.message ??
  e?.response?.data?.message ??
  'Failed to post comment';

export const useCreateCommentOnInnovation = (innovationId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: commonApi.createCommentOnInnovation,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['innovationComments', innovationId] }),
    onError: (e) => toast.error(getCommentError(e)),
  });
};

export const useCreateCommentOnProblem = (problemId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: commonApi.createCommentOnProblem,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['problemComments', problemId] }),
    onError: (e) => toast.error(getCommentError(e)),
  });
};

export const useSaveInnovation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => commonApi.saveInnovation(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['savedInnovations'] });
      const previous = queryClient.getQueryData(['savedInnovations']);
      queryClient.setQueryData(['savedInnovations'], (old) => {
        if (!old) return old;
        const list = old?.data?.savedInnovations ?? [];
        return { ...old, data: { ...old.data, savedInnovations: [...list, { _id: `opt-${id}`, innovationId: { _id: id } }] } };
      });
      return { previous };
    },
    onSuccess: () => toast.success('Innovation saved!'),
    onError: (_e, _id, ctx) => {
      queryClient.setQueryData(['savedInnovations'], ctx.previous);
      toast.error('Failed to save innovation');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['savedInnovations'] }),
  });
};

export const useUnsaveInnovation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => commonApi.unsaveInnovation(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['savedInnovations'] });
      const previous = queryClient.getQueryData(['savedInnovations']);
      queryClient.setQueryData(['savedInnovations'], (old) => {
        if (!old) return old;
        return { ...old, data: { ...old.data, savedInnovations: (old?.data?.savedInnovations ?? []).filter(s => (s.innovationId?._id ?? s.innovationId) !== id) } };
      });
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      queryClient.setQueryData(['savedInnovations'], ctx.previous);
      toast.error('Failed to remove innovation');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['savedInnovations'] }),
  });
};

export const useSaveProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => commonApi.saveProblem(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['savedProblems'] });
      const previous = queryClient.getQueryData(['savedProblems']);
      queryClient.setQueryData(['savedProblems'], (old) => {
        if (!old) return old;
        const list = old?.data?.savedProblems ?? [];
        return { ...old, data: { ...old.data, savedProblems: [...list, { _id: `opt-${id}`, problemId: { _id: id } }] } };
      });
      return { previous };
    },
    onSuccess: () => toast.success('Problem saved!'),
    onError: (_e, _id, ctx) => {
      queryClient.setQueryData(['savedProblems'], ctx.previous);
      toast.error('Failed to save problem');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['savedProblems'] }),
  });
};

export const useUnsaveProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => commonApi.unsaveProblem(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['savedProblems'] });
      const previous = queryClient.getQueryData(['savedProblems']);
      queryClient.setQueryData(['savedProblems'], (old) => {
        if (!old) return old;
        return { ...old, data: { ...old.data, savedProblems: (old?.data?.savedProblems ?? []).filter(s => (s.problemId?._id ?? s.problemId) !== id) } };
      });
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      queryClient.setQueryData(['savedProblems'], ctx.previous);
      toast.error('Failed to remove problem');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['savedProblems'] }),
  });
};

export const useSaveProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => commonApi.saveProfile(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['savedProfiles'] });
      const previous = queryClient.getQueryData(['savedProfiles']);
      queryClient.setQueryData(['savedProfiles'], (old) => {
        if (!old) return old;
        const list = old?.data?.savedProfiles ?? [];
        return { ...old, data: { ...old.data, savedProfiles: [...list, { _id: `opt-${id}`, savedUserId: { _id: id } }] } };
      });
      return { previous };
    },
    onSuccess: () => toast.success('Profile saved!'),
    onError: (_e, _id, ctx) => {
      queryClient.setQueryData(['savedProfiles'], ctx.previous);
      toast.error('Failed to save profile');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['savedProfiles'] }),
  });
};

export const useUnsaveProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => commonApi.unsaveProfile(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['savedProfiles'] });
      const previous = queryClient.getQueryData(['savedProfiles']);
      queryClient.setQueryData(['savedProfiles'], (old) => {
        if (!old) return old;
        return { ...old, data: { ...old.data, savedProfiles: (old?.data?.savedProfiles ?? []).filter(s => (s.savedUserId?._id ?? s.savedUserId) !== id) } };
      });
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      queryClient.setQueryData(['savedProfiles'], ctx.previous);
      toast.error('Failed to remove profile');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['savedProfiles'] }),
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: commonApi.markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myNotifications'] }),
    onError: (err) => toast.error(err?.response?.data?.message || 'Something went wrong'),
  });
};

export const useDeleteNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId) => commonApi.deleteNotification(notificationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myNotifications'] }),
    onError: (err) => toast.error(err?.response?.data?.message || 'Something went wrong'),
  });
};

export const useClearAllNotifications = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: commonApi.clearAllNotifications,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myNotifications'] });
      toast.success('All notifications cleared');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Something went wrong'),
  });
};
