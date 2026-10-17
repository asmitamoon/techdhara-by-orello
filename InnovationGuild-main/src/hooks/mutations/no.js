import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as noApi from '../../api/no';

const onError = (err) => toast.error(err?.response?.data?.message || 'Something went wrong');

export const useInitiateAoRegistration = () =>
  useMutation({ mutationFn: noApi.initiateAoRegistration, onError });

export const useResendAoOtp = () =>
  useMutation({ mutationFn: noApi.resendAoOtp, onError });

export const useRegisterAoByNo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: noApi.registerAoByNo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['approvedAos'] });
    },
    onError,
  });
};
