import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as aoApi from '../../api/ao';

const onError = (err) => toast.error(err?.response?.data?.message || 'Something went wrong');

export const useInitiateVleRegistration = () =>
  useMutation({ mutationFn: aoApi.initiateVleRegistration, onError });

export const useResendVleOtp = () =>
  useMutation({ mutationFn: aoApi.resendVleOtp, onError });

export const useRegisterVleByAo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: aoApi.registerVleByAo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['registeredVles'] });
    },
    onError,
  });
};
