import { useQuery } from '@tanstack/react-query';
import * as vleApi from '../../api/vle';

export const useGetFacingSimilarProblems = (params, { enabled = true } = {}) =>
  useQuery({
    queryKey: ['facingSimilarProblems', params],
    queryFn: () => vleApi.getFacingSimilarProblems(params),
    enabled,
  });

export const useGetPilotRequestContext = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: ['pilotRequestContext'],
    queryFn: () => vleApi.getMyPilotRequestContext(),
    enabled,
  });

export const useGetPilotRequestProblems = (params, { enabled = true } = {}) =>
  useQuery({
    queryKey: ['pilotRequestProblems', params],
    queryFn: () => vleApi.getPilotRequestProblems(params),
    enabled,
  });

export const useGetMyPilotRequests = (params, { enabled = true } = {}) =>
  useQuery({
    queryKey: ['myPilotRequests', params],
    queryFn: () => vleApi.getMyPilotRequests(params),
    enabled,
  });

export const useGetMyBusinessModels = (params, { enabled = true } = {}) =>
  useQuery({
    queryKey: ['myBusinessModels', params],
    queryFn: () => vleApi.getMyBusinessModels(params),
    enabled,
  });

export const useGetMyBookkeepingEntries = (params, { enabled = true } = {}) =>
  useQuery({
    queryKey: ['myBookkeepingEntries', params],
    queryFn: () => vleApi.getMyBookkeepingEntries(params),
    enabled,
  });

export const useGetMyBookkeepingEntry = (entryId) =>
  useQuery({
    queryKey: ['myBookkeepingEntry', entryId],
    queryFn: () => vleApi.getMyBookkeepingEntry(entryId),
    enabled: !!entryId,
  });

export const useGetBookkeepingContext = (pilotId) =>
  useQuery({
    queryKey: ['bookkeepingContext', pilotId],
    queryFn: () => vleApi.getBookkeepingContext(pilotId),
    enabled: !!pilotId,
  });
