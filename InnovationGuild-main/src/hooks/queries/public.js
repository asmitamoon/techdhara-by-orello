import { useQuery } from '@tanstack/react-query';
import * as publicApi from '../../api/public';
import { getStateName, getDistrictName } from '../../utils/LocationData/locationData';

export const useOperations = () =>
  useQuery({
    queryKey: ['operations'],
    queryFn: publicApi.getOperations,
    staleTime: 10 * 60 * 1000,
    select: (data) =>
      (data?.data?.operations ?? []).map(op => ({ value: op.value, label: op.label })),
  });

export const useVillages = (state, district) =>
  useQuery({
    queryKey: ['villages', state, district],
    queryFn: () => publicApi.getVillages({ ...(state && { state }), ...(district && { district }) }),
    enabled: !!district,
    staleTime: 5 * 60 * 1000,
    select: (data) => data?.data?.villages ?? [],
  });

export const useNodalOrgs = () =>
  useQuery({
    queryKey: ['nodalOrgs'],
    queryFn: publicApi.getNodalOrgs,
    select: (data) =>
      data.data.nodalOrganizations.map((org) => ({
        value: org.id,
        label: org.organizationName,
      })),
    staleTime: 10 * 60 * 1000,
  });

export const useApprovedAos = () =>
  useQuery({
    queryKey: ['approvedAos'],
    queryFn: publicApi.getApprovedAos,
    select: (data) =>
      data.data.affiliatedOrganizations.map((org) => ({
        value: org.id,
        label: org.organizationName,
      })),
    staleTime: 10 * 60 * 1000,
  });

export const usePublishedInnovations = (params) =>
  useQuery({
    queryKey: ['innovations', params],
    queryFn: () => publicApi.getPublishedInnovations(params),
    enabled: !!params,
  });

export const useInnovationsCategoryPreview = (params) =>
  useQuery({
    queryKey: ['innovationsCategoryPreview', params],
    queryFn: () => publicApi.getInnovationsCategoryPreview(params),
    staleTime: 5 * 60 * 1000,
    enabled: !!params,
  });

export const useInnovationFacets = (params) =>
  useQuery({
    queryKey: ['innovationFacets', params],
    queryFn: () => publicApi.getInnovationFacets(params),
    staleTime: 5 * 60 * 1000,
  });

export const useInnovationById = (id) =>
  useQuery({
    queryKey: ['innovation', id],
    queryFn: () => publicApi.getInnovationById(id),
    enabled: !!id,
  });

export const useSimilarInnovations = (innovationId) =>
  useQuery({
    queryKey: ['similarInnovations', innovationId],
    queryFn: () => publicApi.getSimilarInnovations(innovationId),
    enabled: !!innovationId,
    select: (data) =>
      (data?.data?.innovations ?? []).map((inv) => ({
        id: inv._id,
        title: inv.innovationName,
        image: inv.thumbnail ?? null,
        description: inv.description,
      })),
  });

export const useProblemById = (id) =>
  useQuery({
    queryKey: ['publicProblem', id],
    queryFn: () => publicApi.getProblemById(id),
    enabled: !!id,
    select: (data) => {
      const p = data?.data?.problem;
      if (!p) return null;
      return {
        id: p._id,
        problemTitle: p.problemTitle,
        date: new Date(p.createdAt).toLocaleString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
          hour: 'numeric', minute: '2-digit',
        }),
        problemDescription: p.problemDescription,
        machineOperations: p.machineOperations ?? [],
        operationsUndertaken: p.operationsUndertaken ?? [],
        crops: p.crops ?? '',
        specificInfo: p.specificInfo ?? '',
        problemSize: p.problemSize ?? '',
        pullCapacity: p.pullCapacity ?? '',
        engineCapacity: p.engineCapacity ?? '',
        motorCapacity: p.motorCapacity ?? '',
        energySource: p.energySource ?? [],
        currentMethodology: p.currentMethodology ?? '',
        machineChallenge: p.machineChallenge ?? '',
        regionState: p.regionState ?? '',
        regionDistrict: p.regionDistrict ?? '',
        regionVillage: p.regionVillage ?? '',
        coverImage: p.coverImage ?? null,
        vle: {
          id: p.postedBy?._id ?? null,
          name: p.postedBy?.fullName ?? '',
          location: [
            getDistrictName(p.postedBy?.district, p.postedBy?.state) ?? p.postedBy?.district,
            getStateName(p.postedBy?.state) ?? p.postedBy?.state,
          ].filter(Boolean).join(', '),
        },
      };
    },
  });

export const useProblemMatches = (problemId) =>
  useQuery({
    queryKey: ['problemMatches', problemId],
    queryFn: () => publicApi.getProblemMatches(problemId),
    enabled: !!problemId,
    select: (data) =>
      (data?.data?.matches ?? []).map((m) => ({
        id: m.innovationId?._id,
        title: m.innovationId?.innovationName,
        image: m.innovationId?.media?.images?.[0]?.url ?? null,
        description: m.innovationId?.description,
      })),
  });

export const usePublishedProblems = (params) =>
  useQuery({
    queryKey: ['problems', params],
    queryFn: () => publicApi.getPublishedProblems(params),
    select: (data) => ({
      problems: (data?.data?.problems ?? []).map((p) => ({
        id: p._id,
        title: p.problemTitle,
        date: new Date(p.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.'),
        postedBy: p.postedBy?.fullName ?? '—',
        location: p.regionState ? `${getStateName(p.regionState) ?? p.regionState}, India` : '—',
        similarInterests: p.upvotes ?? 0,
      })),
      pagination: data?.data?.pagination,
    }),
    placeholderData: (prev) => prev,
  });

export const useImpactStats = () =>
  useQuery({
    queryKey: ['impactStats'],
    queryFn: publicApi.getImpactStats,
    staleTime: 5 * 60 * 1000,
    select: (data) => data?.data,
  });

export const useVleStats = () =>
  useQuery({
    queryKey: ['vleStats'],
    queryFn: publicApi.getVleStats,
    staleTime: 5 * 60 * 1000,
    select: (data) => data?.data,
  });

export const usePublishedVles = (params) =>
  useQuery({
    queryKey: ['vles', params],
    queryFn: () => publicApi.getPublishedVles(params),
    select: (data) => ({
      vles: (data?.data?.vles ?? []).map((v) => ({
        id: v._id,
        name: v.fullName,
        profileImage: v.profilePicture ?? null,
        location: [
          v.profile?.village,
          getDistrictName(v.profile?.district, v.profile?.state) ?? v.profile?.district,
          getStateName(v.profile?.state) ?? v.profile?.state,
          'India',
        ].filter(Boolean).join(', '),
        languages: (v.profile?.languages ?? []).join(', '),
        description: v.profile?.mainLivelihood || v.profile?.vleCategory || '',
      })),
      pagination: data?.data?.pagination,
    }),
    placeholderData: (prev) => prev,
  });
