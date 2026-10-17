import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as publicApi from '../../api/public';

const getContactError = (e) =>
  e?.response?.data?.errors?.[0]?.message ??
  e?.response?.data?.message ??
  'Failed to send message';

export const useSubmitContactForm = () =>
  useMutation({
    mutationFn: publicApi.submitContactForm,
    onSuccess: () => toast.success("Message sent! We'll get back to you soon."),
    onError: (e) => toast.error(getContactError(e)),
  });

export const useSubscribeNewsletter = () =>
  useMutation({
    mutationFn: publicApi.subscribeNewsletter,
    onSuccess: (data) => toast.success(data?.message ?? 'Subscribed successfully!'),
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Subscription failed'),
  });
