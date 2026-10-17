import { useMutation } from '@tanstack/react-query';
import * as aoApi from '../../api/ao';

export const useCreateFieldReport = () =>
  useMutation({ mutationFn: ({ pilotId, data }) => aoApi.createFieldReport(pilotId, data) });

export const useDeleteFieldReport = () =>
  useMutation({ mutationFn: (reportId) => aoApi.deleteFieldReport(reportId) });
