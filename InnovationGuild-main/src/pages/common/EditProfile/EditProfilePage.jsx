import { useRef, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { selectUserRole } from '../../../store/slices/authSlice'
import { useGetMyProfile, useUpdateMyProfile, useSubmitMyProfileForApproval } from '../../../hooks/queries/common'
import VLEProfileForm from '../../../components/admin/Forms/VleProfileForm'
import InnovatorProfileForm from '../../../components/admin/Forms/InnovatorProfileForm'
import AoProfileForm from '../../../components/admin/Forms/AoProfileForm'
import NodalOrgProfileForm from '../../../components/admin/Forms/NodalOrgProfileForm'
import PageLoader from '../../../components/ui/PageLoader'

const buildVleInitialData = (user, profile) => ({
  profilePic: user.profilePicture || null,
  fullName: user.fullName || '',
  age: profile?.age != null ? String(profile.age) : '',
  gender: profile?.gender || '',
  state: profile?.state || '',
  district: profile?.district || '',
  village: profile?.village || '',
  mobile: profile?.mobile || user.phone || '',
  affiliatedOrgName: '',
  mainLivelihood: profile?.mainLivelihood || '',
  livelihoodExperience: profile?.livelihoodExperience != null ? String(profile.livelihoodExperience) : '',
  otherLivelihoods: profile?.otherLivelihoods || [],
  yearlyRevenue: profile?.yearlyRevenue != null ? String(profile.yearlyRevenue) : '',
  qualification: profile?.qualification || '',
  languages: profile?.languages || [],
  hasMachineExp: profile?.hasMachineExp === true ? 'yes' : profile?.hasMachineExp === false ? 'no' : null,
  trainingsTaken: profile?.trainingsTaken || '',
  machineExpYears: profile?.machineExpYears != null ? String(profile.machineExpYears) : '',
  machinesWorkedWith: profile?.machinesWorkedWith || [],
  vleCategory: profile?.vleCategory || '',
  vleCategoryOther: profile?.vleCategoryOther || '',
  supportAssessment: profile?.supportAssessment || [],
  trainings: profile?.trainings || [],
  basicTrainingCenter: profile?.basicTrainingCenter || '',
  innovationTrainingCenter: profile?.innovationTrainingCenter || '',
  advancedTrainingCenter: profile?.advancedTrainingCenter || '',
  otherTrainingCenter: profile?.otherTrainingCenter || '',
  status: user.status?.toLowerCase() || '',
  submittedDate: '',
  approvedDate: '',
});

const buildInnovatorInitialData = (user, profile) => ({
  profilePic: user.profilePicture || null,
  fullName: user.fullName || '',
  enterpriseName: profile?.enterpriseName || '',
  isNotRegistered: !profile?.enterpriseName,
  startDate: profile?.startDate ? new Date(profile.startDate) : null,
  links: profile?.links || '',
  state: profile?.state || '',
  district: profile?.district || '',
  addressLine1: profile?.addressLine1 || '',
  addressLine2: profile?.addressLine2 || '',
  description: profile?.description || '',
  status: user.status?.toLowerCase() || 'pending',
  submittedDate: '',
});

const buildAoInitialData = (user, profile) => ({
  profilePicture: user.profilePicture || null,
  orgName: profile?.orgName || '',
  orgType: profile?.orgType || '',
  orgTypeOther: profile?.orgTypeOther || '',
  streamOfWork: profile?.streamOfWork || [],
  streamOfWorkOther: profile?.streamOfWorkOther || '',
  nodalOrgName: profile?.nodalOrgName || '',
  pocName: profile?.pocName || '',
  state: profile?.state || '',
  district: profile?.district || '',
  village: profile?.village || '',
  website: profile?.website || '',
  status: (user.status || '').toLowerCase(),
  submittedDate: '',
  approvedDate: '',
});

const buildNoInitialData = (user, profile) => ({
  profilePicture: user.profilePicture || null,
  orgName: profile?.orgName || '',
  website: profile?.website || '',
  orgType: profile?.orgType || '',
  hqState: profile?.hqState || '',
  operationalStates: profile?.operationalStates || [],
  description: profile?.description || '',
  hasRuralPrograms: profile?.hasRuralPrograms || '',
  hasTechIntegration: profile?.hasTechIntegration || '',
  channels: profile?.channels || [],
  potentialAoCount: profile?.potentialAoCount != null ? String(profile.potentialAoCount) : '',
  status: (user.status || '').toLowerCase(),
  submittedDate: '',
  approvedDate: '',
});

const buildFormData = (role, data) => {
  const fd = new FormData();
  if (role === 'VLE') {
    if (data.profilePic instanceof File) fd.append('profilePic', data.profilePic);
    ['fullName', 'age', 'gender', 'state', 'district', 'village', 'mobile',
     'mainLivelihood', 'livelihoodExperience', 'yearlyRevenue', 'qualification',
     'hasMachineExp', 'trainingsTaken', 'machineExpYears', 'vleCategory', 'vleCategoryOther',
     'basicTrainingCenter', 'innovationTrainingCenter', 'advancedTrainingCenter', 'otherTrainingCenter']
      .forEach(k => { if (data[k] != null) fd.append(k, data[k]); });
    ['otherLivelihoods', 'languages', 'machinesWorkedWith', 'supportAssessment', 'trainings']
      .forEach(k => (data[k] || []).forEach(v => fd.append(k, v)));
  } else if (role === 'INNOVATOR') {
    if (data.profilePic instanceof File) fd.append('profilePic', data.profilePic);
    fd.append('fullName', data.fullName || '');
    ['enterpriseName', 'startDate', 'links', 'state', 'district', 'addressLine1', 'addressLine2', 'description']
      .forEach(k => fd.append(k, data[k] ?? ''));
  } else if (role === 'AO') {
    if (data.logo instanceof File) fd.append('profilePic', data.logo);
    ['orgName', 'orgType', 'orgTypeOther', 'pocName', 'state', 'district', 'village', 'website']
      .forEach(k => fd.append(k, data[k] || ''));
    (data.streamOfWork || []).forEach(s => fd.append('streamOfWork', s));
    fd.append('streamOfWorkOther', data.streamOfWorkOther || '');
  } else if (role === 'NO') {
    if (data.logo instanceof File) fd.append('profilePic', data.logo);
    ['orgName', 'orgType', 'hqState', 'website', 'description', 'hasRuralPrograms',
     'hasTechIntegration', 'potentialAoCount']
      .forEach(k => fd.append(k, data[k] || ''));
    (data.operationalStates || []).forEach(s => fd.append('operationalStates', s));
    (data.channels || []).forEach(c => fd.append('channels', c));
  }
  return fd;
};

const ROLE_FORMS = {
  VLE: VLEProfileForm,
  INNOVATOR: InnovatorProfileForm,
  AO: AoProfileForm,
  NO: NodalOrgProfileForm,
};

const EditProfilePage = () => {
  const navigate = useNavigate()
  const userRole = useSelector(selectUserRole)
  const formRef = useRef(null)

  const { data: myProfileData, isLoading } = useGetMyProfile()
  const { mutate: updateMutate, isPending: isUpdating } = useUpdateMyProfile()
  const { mutate: submitMutate, isPending: isSubmitting } = useSubmitMyProfileForApproval()

  const profileRole = userRole?.toUpperCase()
  const ProfileForm = ROLE_FORMS[profileRole] || null

  const myData = myProfileData?.data
  const editRequested = myData?.editRequested ?? false

  const initialData = useMemo(() => {
    if (!myData?.user) return null
    const { user, profile } = myData
    if (profileRole === 'VLE') return buildVleInitialData(user, profile)
    if (profileRole === 'INNOVATOR') return buildInnovatorInitialData(user, profile)
    if (profileRole === 'AO') return buildAoInitialData(user, profile)
    if (profileRole === 'NO') return buildNoInitialData(user, profile)
    return null
  }, [myData, profileRole])

  const handleFormSubmit = (validatedData) => {
    const fd = buildFormData(profileRole, validatedData)
    updateMutate(fd, {
      onSuccess: () => {
        submitMutate(undefined, {
          onSuccess: () => navigate(-1),
        })
      },
    })
  }

  const handleSave = () => {
    if (formRef.current) formRef.current.submitForm()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-navbar bg-light flex items-center justify-center">
        <PageLoader />
      </div>
    )
  }

  if (!editRequested) {
    return (
      <div className="min-h-screen pt-navbar bg-light">
        <div className="container mx-auto py-16 text-center">
          <p className="text-muted text-lg">No profile edit has been requested for your account.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-navbar bg-light">
      <div className="container mx-auto">
        {ProfileForm && initialData ? (
          <>
            <ProfileForm
              ref={formRef}
              initialData={initialData}
              isEditMode={true}
              onSubmit={handleFormSubmit}
            />
            <div className="flex justify-end gap-3 mt-6 pb-10">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 rounded-full border border-input-border text-secondary font-medium hover:bg-light transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating || isSubmitting}
                className="px-8 py-2.5 rounded-full bg-button-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isUpdating || isSubmitting ? 'Saving...' : 'Submit for Approval'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-muted">
            Profile form not available for your role.
          </div>
        )}
      </div>
    </div>
  )
}

export default EditProfilePage
