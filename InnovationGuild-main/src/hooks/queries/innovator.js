import { useQuery } from '@tanstack/react-query';
import * as innovatorApi from '../../api/innovator';

export const useGetMyInnovations = () =>
  useQuery({
    queryKey: ['myInnovations'],
    queryFn: innovatorApi.getMyInnovations,
  });

export const useGetInnovationById = (id) =>
  useQuery({
    queryKey: ['innovation', id],
    queryFn: () => innovatorApi.getInnovationById(id),
    enabled: !!id,
  });
