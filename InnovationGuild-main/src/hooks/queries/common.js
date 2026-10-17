import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import * as commonApi from '../../api/common';
import { selectIsLoggedIn, selectUser, selectUserRole } from '../../store/slices/authSlice';
import { getStateName, getDistrictName } from '../../utils/LocationData/locationData';

export const useGetMyProblems = (params) =>
  useQuery({
    queryKey: ['myProblems', params],
    queryFn: () => commonApi.getMyProblems(params),
  });

export const useGetMyServiceRequests = (params) =>
  useQuery({
    queryKey: ['myServiceRequests', params],
    queryFn: () => commonApi.getMyServiceRequests(params),
  });

export const useGetProblemById = (id) =>
  useQuery({
    queryKey: ['problem', id],
    queryFn: () => commonApi.getProblemById(id),
    enabled: !!id,
  });

export const useGetServiceRequestById = (id) =>
  useQuery({
    queryKey: ['serviceRequest', id],
    queryFn: () => commonApi.getServiceRequestById(id),
    enabled: !!id,
  });

export const useGetInnovationComments = (innovationId) => {
  return useQuery({
    queryKey: ['innovationComments', innovationId],
    queryFn: () => commonApi.getInnovationComments(innovationId),
    enabled: !!innovationId,
  });
};

export const useGetProblemComments = (problemId) => {
  return useQuery({
    queryKey: ['problemComments', problemId],
    queryFn: () => commonApi.getProblemComments(problemId),
    enabled: !!problemId,
  });
};

export const useGetSavedInnovations = (params) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);
  return useQuery({
    queryKey: ['savedInnovations', params],
    queryFn: () => commonApi.getSavedInnovations(params),
    enabled: isLoggedIn && user?.status === 'APPROVED' && userRole !== 'admin' && userRole !== 'super_admin',
  });
};

export const useGetSavedProblems = (params) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);
  return useQuery({
    queryKey: ['savedProblems', params],
    queryFn: () => commonApi.getSavedProblems(params),
    enabled: isLoggedIn && user?.status === 'APPROVED' && userRole !== 'admin' && userRole !== 'super_admin',
  });
};

export const useGetSavedProfiles = (params) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);
  return useQuery({
    queryKey: ['savedProfiles', params],
    queryFn: () => commonApi.getSavedProfiles(params),
    enabled: isLoggedIn && user?.status === 'APPROVED' && userRole !== 'admin' && userRole !== 'super_admin',
  });
};

export const useUserById = (id) =>
  useQuery({
    queryKey: ['userProfile', id],
    queryFn: () => commonApi.getUserById(id),
    enabled: !!id,
    select: (data) => {
      const { user, profile, implementedPilots } = data?.data ?? {};
      if (!user) return null;
      const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
      const loc = (village, district, state) =>
        [village, getDistrictName(district, state) ?? district, getStateName(state) ?? state, 'India']
          .filter(Boolean).join(', ');

      if (user.role === 'VLE') return {
        role: 'VLE',
        fullName: user.fullName,
        location: loc(profile?.village, profile?.district, profile?.state),
        profileImage: user.profilePicture ?? null,
        tags: profile?.vleStatus ? [cap(profile.vleStatus)] : [],
        basicInfo: {
          age: profile?.age?.toString() ?? '',
          gender: cap(profile?.gender ?? ''),
          mobile: user.phone || profile?.mobile || '',
          email: user.email || '',
          languages: (profile?.languages ?? []).join(', '),
        },
        organizationalBackground: { nodalOrganization: '', affiliatedOrg: profile?.affiliatedOrg ?? '' },
        background: {
          vleCategory: profile?.vleCategory === 'Other'
            ? (profile?.vleCategoryOther || 'Other')
            : (profile?.vleCategory ?? ''),
          mainLivelihood: profile?.mainLivelihood ?? '',
          livelihoodExperience: profile?.livelihoodExperience ? `${profile.livelihoodExperience} years` : '',
          qualification: profile?.qualification ?? '',
          otherLivelihoods: (profile?.otherLivelihoods ?? []).join(', '),
          machineExpYears: profile?.machineExpYears ? `${profile.machineExpYears} years` : '',
        },
        techdharaEngagement: {
          persona: (profile?.interestedPersonas ?? []).join(', '),
          equippedMachinery: (implementedPilots ?? [])
            .map(p => p.innovationId?.innovationName)
            .filter(Boolean)
            .join(', '),
          trainings: (profile?.trainings ?? []).join(', '),
        },
      };

      if (user.role === 'INNOVATOR') return {
        role: 'Innovator',
        innovatorName: user.fullName,
        location: loc(null, profile?.district, profile?.state),
        profileImage: user.profilePicture ?? null,
        tags: [],
        basicInfo: { mobile: user.phone || '', email: user.email || '', links: profile?.links || '' },
        background: {
          enterpriseName: profile?.enterpriseName || '',
          startDate: profile?.startDate ? new Date(profile.startDate).getFullYear().toString() : '',
        },
        description: profile?.description || '',
      };

      if (user.role === 'AO') return {
        role: 'ao',
        fullName: profile?.orgName || user.fullName,
        location: loc(profile?.village, profile?.district, profile?.state),
        profileImage: user.profilePicture ?? null,
        tags: [],
        basicInfo: { mobile: user.phone || '', email: user.email || '', links: profile?.website || '' },
        background: {
          typeOfOrganisation: profile?.orgType === 'other'
            ? (profile?.orgTypeOther || 'Other')
            : (profile?.orgType || ''),
          streamOfWork: (profile?.streamOfWork ?? [])
            .map(s => s === 'other' ? (profile?.streamOfWorkOther || 'Other') : s)
            .join(', '),
          nodalOrganization: profile?.nodalOrg || '',
        },
        organizationPOC: { pocOfAO: profile?.pocName || '' },
      };

      if (user.role === 'NO') return {
        role: 'no',
        fullName: profile?.orgName || user.fullName,
        location: loc(null, null, profile?.hqState),
        profileImage: user.profilePicture ?? null,
        tags: [],
        basicInfo: { mobile: user.phone || '', email: user.email || '', links: profile?.website || '' },
        background: {
          typeOfOrganisation: profile?.orgType || '',
          streamOfWork: '',
          operationalStates: (profile?.operationalStates ?? []).map(code => getStateName(code) ?? code).join(', '),
        },
        overview: profile?.description || '',
        organizationPOC: { pocOfNO: '' },
      };

      // GENERAL_USER (fallback)
      return {
        role: 'General User',
        fullName: user.fullName,
        location: loc(profile?.village, profile?.district, profile?.state),
        profileImage: user.profilePicture ?? null,
        tags: [],
        basicInfo: {
          age: profile?.age?.toString() ?? '',
          gender: cap(profile?.gender ?? ''),
          mobile: user.phone || profile?.mobile || '',
          email: user.email || '',
        },
      };
    },
  });

export const useGetMyNotifications = (params, options = {}) =>
  useQuery({
    queryKey: ['myNotifications', params],
    queryFn: () => commonApi.getMyNotifications(params),
    ...options,
  });

export const useGetMyProfile = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  return useQuery({
    queryKey: ['myProfile'],
    queryFn: commonApi.getMyProfile,
    enabled: isLoggedIn,
  });
};

export const useUpdateMyProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => commonApi.updateMyProfile(formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myProfile'] }),
    onError: (err) => toast.error(err?.response?.data?.message || 'Something went wrong'),
  });
};

export const useSubmitMyProfileForApproval = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: commonApi.submitMyProfileForApproval,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myProfile'] });
      toast.success('Profile submitted for re-approval');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Something went wrong'),
  });
};
