import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as innovatorApi from '../../api/innovator';

export const useCreateInnovation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: innovatorApi.createInnovation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myInnovations'] }),
  });
};

export const useSubmitInnovationForApproval = () =>
  useMutation({ mutationFn: innovatorApi.submitInnovationForApproval });

export const useDeleteInnovation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: innovatorApi.deleteInnovation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myInnovations'] }),
  });
};

export const useUpdateInnovation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: innovatorApi.updateInnovation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInnovations'] });
      queryClient.invalidateQueries({ queryKey: ['innovation'] });
    },
  });
};
