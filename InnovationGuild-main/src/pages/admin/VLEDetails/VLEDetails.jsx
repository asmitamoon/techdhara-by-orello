import { useState, useRef, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import VLEProfileForm from '../../../components/admin/Forms/VleProfileForm';
import AdminDetailActions from '../../../components/admin/AdminDetailActions';
import ConfirmPopup from '../../../components/admin/Popups/ConfirmPopup';
import RequestEditPopup from '../../../components/admin/Popups/RequestEditPopup';
import PageLoader from '../../../components/ui/PageLoader';
import { useGetAdminVleDetails, useApproveAdminVle, useRejectAdminVle, useUpdateAdminVle, useGetAdminProblems, useGetAdminServiceRequests, useGetAdminVleSimilarProblems, useGetAdminVlePilotRequests, useStartAdminPilot, useStartAdminPilotTrial, useMarkAdminPilotImplemented, useCancelAdminPilot, useRequestEditAdminVle } from '../../../hooks/queries/admin';
import useDebounce from '../../../hooks/useDebounce';
import { useOperations } from '../../../hooks/queries/public';
import { PROBLEM_CATEGORY_OPTIONS, UNIT_TYPE_OPTIONS, OWNERSHIP_OPTIONS } from '../../../utils/constants/problemConstants';
import { getStateName, getDistrictName, getStateOptions, getDistrictOptions } from '../../../utils/LocationData/locationData';
import TabsSmall from '../../../components/admin/TabsSmall';
import InnovationRequestTable from '../../../components/admin/Tables/ProblemTable/InnovationRequestTable';
import ServiceRequestTable from '../../../components/admin/Tables/ProblemTable/ServiceRequestTable';
import ProblemFilter from '../../../components/admin/Tables/ProblemTable/ProblemFilter';
import PilotTable from '../../../components/admin/Tables/PilotTable/PilotTable';
import BookkeepingsTable from '../../../components/admin/Tables/BookkeepingsTable/BookkeepingsTable';
import FieldReportsTable from '../../../components/admin/Tables/FieldReportsTable/FieldReportsTable';


const PILOT_STATUS_OPTIONS = [
  { value: 'started', label: 'Started' },
  { value: 'trial', label: 'Trial' },
  { value: 'implemented', label: 'Implemented' },
  { value: 'cancelled', label: 'Cancelled' }
];

const PILOT_STATUS_MAP = {
  PILOT_STARTED: 'started',
  TRIAL_STARTED: 'trial',
  IMPLEMENTED: 'implemented',
  CANCELLED: 'cancelled',
};

const CONFIRM_CONFIG = {
  approve: { title: 'Approve VLE', message: 'Are you sure you want to approve this VLE?', label: 'Approve', variant: 'green' },
  submit:  { title: 'Submit Changes', message: 'Are you sure you want to submit these changes?', label: 'Submit', variant: 'green' },
};

const VLEDetails = () => {
  const { vleId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isEditMode, setIsEditMode] = useState(false);
  const latestFormDataRef = useRef(null);
  const formRef = useRef(null);

  // Read tab state from URL query params, with defaults
  const activeTab = searchParams.get('tab') || 'profile';
  const problemsSubTab = searchParams.get('subtab') || 'innovation';
  const pilotsSubTab = searchParams.get('subtab') || 'requests';

  const [confirmPopup, setConfirmPopup] = useState({ isOpen: false, type: null });
  const [pilotStatusConfirm, setPilotStatusConfirm] = useState({ isOpen: false, data: null });
  const [showRequestEditPopup, setShowRequestEditPopup] = useState(false);
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [pilotPage, setPilotPage] = useState(1);
  const [fieldReportPilotsPage, setFieldReportPilotsPage] = useState(1);

  // Data fetching
  const { data: vleData, isLoading } = useGetAdminVleDetails(vleId);
  const { mutate: approveMutate, isPending: isApprovePending } = useApproveAdminVle();
  const { mutate: rejectMutate,  isPending: isRejectPending  } = useRejectAdminVle();
  const { mutate: updateMutate,  isPending: isUpdatePending  } = useUpdateAdminVle();
  const { mutate: requestEditMutate, isPending: isRequestEditPending } = useRequestEditAdminVle();

  const profileData = useMemo(() => {
    if (!vleData?.data) return null;
    const { user, profile } = vleData.data;
    const p = profile || {};
    return {
      profilePic: user.profilePicture || null,
      fullName: user.fullName || '',
      age: p.age != null ? String(p.age) : '',
      gender: p.gender || '',
      state: p.state || '',
      district: p.district || '',
      village: p.village || '',
      mobile: p.mobile || user.phone || '',
      affiliatedOrgName: vleData.data.affiliatedOrgName || '',
      mainLivelihood: p.mainLivelihood || '',
      livelihoodExperience: p.livelihoodExperience != null ? String(p.livelihoodExperience) : '',
      otherLivelihoods: p.otherLivelihoods || [],
      yearlyRevenue: p.yearlyRevenue != null ? String(p.yearlyRevenue) : '',
      qualification: p.qualification || '',
      languages: p.languages || [],
      hasMachineExp: p.hasMachineExp === true ? 'yes' : p.hasMachineExp === false ? 'no' : null,
      trainingsTaken: p.trainingsTaken || '',
      machineExpYears: p.machineExpYears != null ? String(p.machineExpYears) : '',
      machinesWorkedWith: p.machinesWorkedWith || [],
      vleCategory: p.vleCategory || '',
      vleCategoryOther: p.vleCategoryOther || '',
      supportAssessment: p.supportAssessment || [],
      trainings: p.trainings || [],
      basicTrainingCenter: p.basicTrainingCenter || '',
      innovationTrainingCenter: p.innovationTrainingCenter || '',
      advancedTrainingCenter: p.advancedTrainingCenter || '',
      otherTrainingCenter: p.otherTrainingCenter || '',
      status: user.status?.toLowerCase() || '',
      submittedDate: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '',
      approvedDate: user.approvedAt ? new Date(user.approvedAt).toISOString().split('T')[0] : '',
    };
  }, [vleData]);

  const vleStatus = profileData?.status || '';

  // Problem filters
  const [problemSearchQuery, setProblemSearchQuery] = useState('');
  const [problemSelectedCategory, setProblemSelectedCategory] = useState('');
  const [problemSelectedOperation, setProblemSelectedOperation] = useState('');
  const [problemSelectedState, setProblemSelectedState] = useState('');
  const [problemSelectedDistrict, setProblemSelectedDistrict] = useState('');
  const [problemSelectedUnitType, setProblemSelectedUnitType] = useState('');
  const [problemSelectedOwnership, setProblemSelectedOwnership] = useState('');
  const [innovationPage, setInnovationPage] = useState(1);
  const [servicePage, setServicePage] = useState(1);
  const debouncedProblemSearch = useDebounce(problemSearchQuery);

  useEffect(() => { setInnovationPage(1); setServicePage(1); }, [debouncedProblemSearch, problemSelectedCategory, problemSelectedOperation, problemSelectedState, problemSelectedDistrict]);
  useEffect(() => { setPilotPage(1); }, [pilotsSubTab]);

  const innovationParams = activeTab === 'problems' && problemsSubTab === 'innovation' ? {
    page: innovationPage, limit: 20, postedBy: vleId,
    ...(debouncedProblemSearch && { search: debouncedProblemSearch }),
    ...(problemSelectedCategory && { category: problemSelectedCategory }),
    ...(problemSelectedOperation && { operation: problemSelectedOperation }),
    ...(problemSelectedState && { state: problemSelectedState }),
    ...(problemSelectedDistrict && { district: problemSelectedDistrict }),
  } : null;
  const serviceParams = activeTab === 'problems' && problemsSubTab === 'service' ? {
    page: servicePage, limit: 20, postedBy: vleId,
    ...(debouncedProblemSearch && { search: debouncedProblemSearch }),
    ...(problemSelectedUnitType && { unitType: problemSelectedUnitType }),
    ...(problemSelectedOwnership && { ownership: problemSelectedOwnership }),
  } : null;
  const { data: innovationData, isLoading: innovationLoading } = useGetAdminProblems(innovationParams);
  const { data: serviceData, isLoading: serviceLoading } = useGetAdminServiceRequests(serviceParams);

  const innovationTableData = useMemo(() => (innovationData?.data?.problems || []).map(p => ({
    id: p.id,
    posterType: p.posterType || 'VLE',
    profileId: p.profileId || null,
    title: p.title || '—',
    vle: p.vle || '—',
    category: p.category || null,
    subCategory: p.subCategory?.length ? p.subCategory : null,
    operations: p.operations?.length ? p.operations : null,
    state: getStateName(p.state),
    district: getDistrictName(p.district, p.state),
    nodalOrg: p.nodalOrg || '—',
    affiliatedOrg: p.affiliatedOrg || '—',
  })), [innovationData]);

  const serviceTableData = useMemo(() => (serviceData?.data?.serviceRequests || []).map(sr => ({
    id: sr.id,
    posterType: sr.posterType || 'VLE',
    profileId: sr.profileId || null,
    techName: sr.techName || '—',
    vle: sr.vle || '—',
    techCompany: sr.techCompany || '—',
    unitType: sr.unitType || '—',
    ownership: sr.ownership || '—',
    nodalOrg: sr.nodalOrg || '—',
    affiliatedOrg: sr.affiliatedOrg || '—',
  })), [serviceData]);

  const innovationPagination = useMemo(() => {
    const totalPages = innovationData?.data?.pagination?.totalPages ?? 1;
    return {
      currentPage: innovationPage, totalPages,
      onPageChange: setInnovationPage,
      onPrevious: () => setInnovationPage(p => Math.max(1, p - 1)),
      onNext: () => setInnovationPage(p => Math.min(totalPages, p + 1)),
      canGoPrevious: innovationPage > 1,
      canGoNext: innovationPage < totalPages,
    };
  }, [innovationPage, innovationData]);

  const servicePagination = useMemo(() => {
    const totalPages = serviceData?.data?.pagination?.totalPages ?? 1;
    return {
      currentPage: servicePage, totalPages,
      onPageChange: setServicePage,
      onPrevious: () => setServicePage(p => Math.max(1, p - 1)),
      onNext: () => setServicePage(p => Math.min(totalPages, p + 1)),
      canGoPrevious: servicePage > 1,
      canGoNext: servicePage < totalPages,
    };
  }, [servicePage, serviceData]);

  // Pilot params + hooks + memos
  const pilotsParams = activeTab === 'pilots' ? {
    page: pilotPage, limit: 20,
    ...(pilotsSubTab === 'requests' && { status: 'PENDING' }),
    ...(pilotsSubTab === 'recently_started' && { excludeStatus: 'PENDING' }),
  } : null;
  const fieldReportPilotsParams = activeTab === 'field_report'
    ? { status: 'TRIAL_STARTED,IMPLEMENTED,CANCELLED', limit: 10, page: fieldReportPilotsPage }
    : null;
  const bookkeepingPilotsParams = activeTab === 'bookkeeping'
    ? { status: 'IMPLEMENTED', page: 1, limit: 10 }
    : null;

  const { data: pilotsData, isLoading: pilotsLoading } = useGetAdminVlePilotRequests(vleId, pilotsParams);
  const { data: fieldReportPilotsData } = useGetAdminVlePilotRequests(vleId, fieldReportPilotsParams);
  const { data: bookkeepingPilotsData } = useGetAdminVlePilotRequests(vleId, bookkeepingPilotsParams);
  const { mutate: startPilotMutate,  isPending: isStartPilotPending  } = useStartAdminPilot();
  const { mutate: startTrialMutate,  isPending: isStartTrialPending  } = useStartAdminPilotTrial();
  const { mutate: implementMutate,   isPending: isImplementPending   } = useMarkAdminPilotImplemented();
  const { mutate: cancelPilotMutate, isPending: isCancelPilotPending } = useCancelAdminPilot();

  const pilotTableData = useMemo(() => (pilotsData?.data?.pilots || []).map(p => ({
    id: p._id,
    problemId: p.problemId?._id || null,
    innovationId: p.innovationId?._id || null,
    innovation: p.innovationId?.innovationName || '—',
    vleName: p.vleId?.fullName || '—',
    vleStatus: p.vleId?.status || '',
    vleId: p.vleId?._id || vleId,
    Problem: p.problemId?.problemTitle || '—',
    businessModel: p.hasBusinessModel ?? false,
    pilotStatus: PILOT_STATUS_MAP[p.status] || null,
  })), [pilotsData, vleId]);

  const bookkeepingTableData = useMemo(() => (bookkeepingPilotsData?.data?.pilots || []).map(p => ({
    id: p._id,
    innovationId: p.innovationId?._id || null,
    problemId: p.problemId?._id || null,
    innovation: p.innovationId?.innovationName || '—',
    Problem: p.problemId?.problemTitle || '—',
    vleId: p.vleId?._id || vleId,
  })), [bookkeepingPilotsData, vleId]);

  const fieldReportTableData = useMemo(() => (fieldReportPilotsData?.data?.pilots || []).map(p => ({
    id: p._id,
    innovationId: p.innovationId?._id || null,
    problemId: p.problemId?._id || null,
    innovation: p.innovationId?.innovationName || '—',
    Problem: p.problemId?.problemTitle || '—',
    status: p.status,
  })), [fieldReportPilotsData]);

  const fieldReportPilotsTotalPages = fieldReportPilotsData?.data?.pagination?.totalPages ?? 1;
  const fieldReportPaginationProps = {
    currentPage: fieldReportPilotsPage, totalPages: fieldReportPilotsTotalPages,
    onPageChange: setFieldReportPilotsPage,
    onPrevious: () => setFieldReportPilotsPage(p => Math.max(1, p - 1)),
    onNext: () => setFieldReportPilotsPage(p => Math.min(fieldReportPilotsTotalPages, p + 1)),
    canGoPrevious: fieldReportPilotsPage > 1,
    canGoNext: fieldReportPilotsPage < fieldReportPilotsTotalPages,
  };

  const pilotPaginationProps = useMemo(() => {
    const totalPages = pilotsData?.data?.pagination?.totalPages || 1;
    return {
      currentPage: pilotPage, totalPages,
      onPageChange: setPilotPage,
      onPrevious: () => setPilotPage(p => Math.max(1, p - 1)),
      onNext: () => setPilotPage(p => Math.min(totalPages, p + 1)),
      canGoPrevious: pilotPage > 1,
      canGoNext: pilotPage < totalPages,
    };
  }, [pilotPage, pilotsData]);

  // Similar problem filters (separate from problems added)
  const [similarSearchQuery, setSimilarSearchQuery] = useState('');
  const [similarSelectedCategory, setSimilarSelectedCategory] = useState('');
  const [similarSelectedOperation, setSimilarSelectedOperation] = useState('');
  const [similarPage, setSimilarPage] = useState(1);
  const debouncedSimilarSearch = useDebounce(similarSearchQuery);

  useEffect(() => { setSimilarPage(1); }, [debouncedSimilarSearch, similarSelectedCategory, similarSelectedOperation]);

  const similarParams = activeTab === 'similar_problems' ? {
    page: similarPage, limit: 20,
    ...(debouncedSimilarSearch && { search: debouncedSimilarSearch }),
    ...(similarSelectedCategory && { category: similarSelectedCategory }),
    ...(similarSelectedOperation && { operation: similarSelectedOperation }),
  } : null;
  const { data: similarData, isLoading: similarLoading } = useGetAdminVleSimilarProblems(vleId, similarParams);

  const similarTableData = useMemo(() => (similarData?.data?.problems || []).map(p => ({
    id: p.id,
    posterType: p.posterType || 'VLE',
    profileId: p.profileId || null,
    title: p.title || '—',
    vle: p.vle || '—',
    category: p.category || null,
    subCategory: p.subCategory?.length ? p.subCategory : null,
    operations: p.operations?.length ? p.operations : null,
    state: getStateName(p.state),
    district: getDistrictName(p.district, p.state),
    nodalOrg: p.nodalOrg || '—',
    affiliatedOrg: p.affiliatedOrg || '—',
  })), [similarData]);

  const similarPagination = useMemo(() => {
    const totalPages = similarData?.data?.pagination?.totalPages ?? 1;
    return {
      currentPage: similarPage, totalPages,
      onPageChange: setSimilarPage,
      onPrevious: () => setSimilarPage(p => Math.max(1, p - 1)),
      onNext: () => setSimilarPage(p => Math.min(totalPages, p + 1)),
      canGoPrevious: similarPage > 1,
      canGoNext: similarPage < totalPages,
    };
  }, [similarPage, similarData]);

  const showStickyBar = vleStatus === 'pending' || isEditMode;

  // Filter options

  const categoryOptions = PROBLEM_CATEGORY_OPTIONS;
  const { data: operationOptions = [] } = useOperations();
  const stateOptions = useMemo(() => getStateOptions(), []);
  const problemDistrictOptions = useMemo(
    () => problemSelectedState ? getDistrictOptions(problemSelectedState) : [],
    [problemSelectedState]
  );

  const unitTypeOptions = UNIT_TYPE_OPTIONS;
  const ownershipOptions = OWNERSHIP_OPTIONS;

  const handleClearProblemFilters = () => {
    setProblemSearchQuery('');
    setProblemSelectedCategory('');
    setProblemSelectedOperation('');
    setProblemSelectedState('');
    setProblemSelectedDistrict('');
    setProblemSelectedUnitType('');
    setProblemSelectedOwnership('');
    setInnovationPage(1);
    setServicePage(1);
  };

  const handleClearSimilarFilters = () => {
    setSimilarSearchQuery('');
    setSimilarSelectedCategory('');
    setSimilarSelectedOperation('');
    setSimilarPage(1);
  };

  // Tab change handlers
  const handleTabChange = (newTab) => {
    if (isEditMode) handleCancel();
    setSearchParams({ tab: newTab });
  };

  const handleProblemsSubTabChange = (newSubTab) => {
    setSearchParams({ tab: 'problems', subtab: newSubTab });
  };

  const handlePilotsSubTabChange = (newSubTab) => {
    setSearchParams({ tab: 'pilots', subtab: newSubTab });
  };

  const handleApprove = () => setConfirmPopup({ isOpen: true, type: 'approve' });
  const handleReject = () => setShowRejectPopup(true);
  const handleRequestEdit = () => setShowRequestEditPopup(true);

  const handleConfirmAction = () => {
    if (confirmPopup.type === 'approve') {
      approveMutate(vleId, {
        onSuccess: () => setConfirmPopup({ isOpen: false, type: null }),
      });
      return;
    }
    if (confirmPopup.type === 'submit') {
      const data = latestFormDataRef.current;
      const fd = new FormData();
      if (data.profilePic instanceof File) fd.append('profilePic', data.profilePic);
      ['fullName', 'age', 'gender', 'state', 'district', 'village', 'mobile',
       'affiliatedOrg',
       'mainLivelihood', 'livelihoodExperience', 'yearlyRevenue', 'qualification',
       'hasMachineExp', 'trainingsTaken', 'machineExpYears', 'vleCategory', 'vleCategoryOther',
       'basicTrainingCenter', 'innovationTrainingCenter', 'advancedTrainingCenter', 'otherTrainingCenter']
        .forEach(k => { if (data[k] != null) fd.append(k, data[k]); });
      ['otherLivelihoods', 'languages', 'machinesWorkedWith', 'supportAssessment', 'trainings']
        .forEach(k => (data[k] || []).forEach(v => fd.append(k, v)));
      updateMutate({ vleId, formData: fd }, {
        onSuccess: () => {
          setIsEditMode(false);
          setConfirmPopup({ isOpen: false, type: null });
        },
      });
      return;
    }
    setConfirmPopup({ isOpen: false, type: null });
  };

  const handleRejectSubmit = (reason) => {
    rejectMutate({ vleId, reason }, {
      onSuccess: () => {
        setShowRejectPopup(false);
        navigate('/admin/vles');
      },
    });
  };

  const handleRequestEditSubmit = (reason) => {
    requestEditMutate(
      { vleId, reason },
      { onSuccess: () => { setShowRequestEditPopup(false); navigate(-1); } }
    );
  };

  const handleEditToggle = () => setIsEditMode(true);

  const handleFormDataChange = (currentFormData) => {
    latestFormDataRef.current = currentFormData;
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submitForm();
    }
  };

  const handleFormSubmit = (validatedData) => {
    latestFormDataRef.current = validatedData;
    setConfirmPopup({ isOpen: true, type: 'submit' });
  };

  const handleCancel = () => setIsEditMode(false);

  const handlePilotStatusChangeRequest = (id, newStatus) => {
    setPilotStatusConfirm({
      isOpen: true,
      data: { id, newStatus }
    });
  };

  const handleConfirmPilotStatusChange = () => {
    const { id, newStatus } = pilotStatusConfirm.data;
    const onSuccess = () => setPilotStatusConfirm({ isOpen: false, data: null });
    if (newStatus === 'started') startPilotMutate(id, { onSuccess });
    else if (newStatus === 'trial') startTrialMutate(id, { onSuccess });
    else if (newStatus === 'implemented') implementMutate(id, { onSuccess });
    else if (newStatus === 'cancelled') cancelPilotMutate(id, { onSuccess });
    else setPilotStatusConfirm({ isOpen: false, data: null });
  };

  if (isLoading || !profileData) return <PageLoader />;

  return (
    <div className={`min-h-screen bg-page ${showStickyBar ? 'pb-28' : ''}`}>
      <div className="">
        <div className="flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <button
                onClick={() => navigate('/admin/vles')}
                className="flex-shrink-0 p-2 hover:bg-light rounded-lg transition-colors group cursor-pointer"
                aria-label="Go back"
              >
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8 text-muted group-hover:text-dark transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-regular text-black">
                VLE Details
              </h1>
            </div>
            <div className="border-t mt-6 border-accent-green-dark"></div>
          </div>

        {vleStatus === 'approved' && (
          <TabsSmall
            tabs={[
              { id: 'profile', label: 'Profile Detail' },
              { id: 'problems', label: 'Problems Added' },
              { id: 'pilots', label: 'Pilots' },
              { id: 'similar_problems', label: 'Similar Problem Faced' },
              { id: 'field_report', label: 'Field Report' },
              { id: 'bookkeeping', label: 'Bookkeeping' }
            ]}
            activeTab={activeTab}
            onChange={handleTabChange}
            className="w-full sm:w-5xl"
          />
        )}

        {/* Profile Form */}
        {(activeTab === 'profile' || vleStatus !== 'approved') && (
          <VLEProfileForm
            ref={formRef}
            initialData={profileData}
            isEditMode={isEditMode}
            onEditToggle={handleEditToggle}
            onDataChange={handleFormDataChange}
            onSubmit={handleFormSubmit}
          />
        )}

        {/* Problems Added */}
        {activeTab === 'problems' && vleStatus === 'approved' && (
          <div className="flex flex-col gap-6">
            <TabsSmall
              tabs={[
                { id: 'innovation', label: 'Innovation Requests' },
                { id: 'service', label: 'Service Requests' }
              ]}
              activeTab={problemsSubTab}
              onChange={(tab) => {
                handleProblemsSubTabChange(tab);
                handleClearProblemFilters();
              }}
              className="w-full sm:w-md"
            />
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-accent-green-dark">
              {/* Filters */}
              <div className="p-4 border-b border-input-border">
                <ProblemFilter
                  searchQuery={problemSearchQuery}
                  setSearchQuery={setProblemSearchQuery}
                  selectedState={problemSelectedState}
                  setSelectedState={(val) => { setProblemSelectedState(val); setProblemSelectedDistrict(''); setInnovationPage(1); }}
                  selectedDistrict={problemSelectedDistrict}
                  setSelectedDistrict={(val) => { setProblemSelectedDistrict(val); setInnovationPage(1); }}
                  selectedCategory={problemSelectedCategory}
                  setSelectedCategory={(val) => { setProblemSelectedCategory(val); setInnovationPage(1); }}
                  selectedOperation={problemSelectedOperation}
                  setSelectedOperation={(val) => { setProblemSelectedOperation(val); setInnovationPage(1); }}
                  selectedUnitType={problemSelectedUnitType}
                  setSelectedUnitType={setProblemSelectedUnitType}
                  selectedOwnership={problemSelectedOwnership}
                  setSelectedOwnership={setProblemSelectedOwnership}
                  onClearFilters={handleClearProblemFilters}
                  stateOptions={stateOptions}
                  districtOptions={problemDistrictOptions}
                  categoryOptions={categoryOptions}
                  operationOptions={operationOptions}
                  unitTypeOptions={unitTypeOptions}
                  ownershipOptions={ownershipOptions}
                  showCategoryFilters={problemsSubTab === 'innovation'}
                  showStateDistrictFilters={problemsSubTab === 'innovation'}
                />
              </div>

              {problemsSubTab === 'innovation' ? (
                <InnovationRequestTable
                  data={innovationTableData}
                  pagination={innovationPagination}
                  isLoading={innovationLoading}
                  vleContext={vleId}
                  routePrefix="/admin"
                />
              ) : (
                <ServiceRequestTable
                  data={serviceTableData}
                  pagination={servicePagination}
                  isLoading={serviceLoading}
                  vleContext={vleId}
                  routePrefix="/admin"
                />
              )}
            </div>
          </div>
        )}

        {/* Pilots */}
        {activeTab === 'pilots' && vleStatus === 'approved' && (
          <div className="flex flex-col gap-6">
            <TabsSmall
              tabs={[
                { id: 'requests', label: 'Requests' },
                { id: 'recently_started', label: 'Recently Started' }
              ]}
              activeTab={pilotsSubTab}
              onChange={handlePilotsSubTabChange}
              className="w-full sm:w-md"
            />
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-accent-green-dark">
              <PilotTable
                data={pilotTableData}
                isLoading={pilotsLoading}
                activeTab={pilotsSubTab}
                onStatusChange={handlePilotStatusChangeRequest}
                pilotStatusOptions={PILOT_STATUS_OPTIONS}
                pagination={pilotPaginationProps}
                showVleColumn={false}
                vleId={vleId}
                isVleContext={true}
                routePrefix="/admin"
              />
            </div>
          </div>
        )}

        {/* Similar Problem Faced */}
        {activeTab === 'similar_problems' && vleStatus === 'approved' && (
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-accent-green-dark">
            {/* Filters */}
            <div className="p-4 border-b border-input-border">
              <ProblemFilter
                searchQuery={similarSearchQuery}
                setSearchQuery={setSimilarSearchQuery}
                selectedCategory={similarSelectedCategory}
                setSelectedCategory={setSimilarSelectedCategory}
                selectedOperation={similarSelectedOperation}
                setSelectedOperation={setSimilarSelectedOperation}
                onClearFilters={handleClearSimilarFilters}
                categoryOptions={categoryOptions}
                operationOptions={operationOptions}
                showCategoryFilters={true}
                showStateDistrictFilters={false}
              />
            </div>

            <InnovationRequestTable
              data={similarTableData}
              pagination={similarPagination}
              isLoading={similarLoading}
              showVleColumn={true}
              vleContext={vleId}
              routePrefix="/admin"
            />
          </div>
        )}

        {activeTab === 'field_report' && vleStatus === 'approved' && (
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-accent-green-dark">
            <FieldReportsTable
              data={fieldReportTableData}
              pagination={fieldReportPaginationProps}
              vleId={vleId}
              routePrefix="/admin"
              getProblemLink={(id) => `/admin/problems/innovation-request/${id}`}
              currentTab={searchParams.get('tab') || 'profile'}
              currentSubTab={searchParams.get('subtab')}
            />
          </div>
        )}

        {/* Bookkeeping */}
        {activeTab === 'bookkeeping' && vleStatus === 'approved' && (
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-accent-green-dark">
            <BookkeepingsTable data={bookkeepingTableData} vleId={vleId} routePrefix="/admin" />
          </div>
        )}
      </div>

      <AdminDetailActions
        status={vleStatus}
        isEditMode={isEditMode}
        onApprove={vleStatus === 'pending' ? handleApprove : null}
        onReject={vleStatus === 'pending' ? handleReject : null}
        onRequestEdit={vleStatus === 'pending' ? handleRequestEdit : null}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <ConfirmPopup
        isOpen={confirmPopup.isOpen}
        onClose={() => setConfirmPopup({ isOpen: false, type: null })}
        onConfirm={handleConfirmAction}
        title={CONFIRM_CONFIG[confirmPopup.type]?.title}
        message={CONFIRM_CONFIG[confirmPopup.type]?.message}
        confirmLabel={CONFIRM_CONFIG[confirmPopup.type]?.label}
        variant={CONFIRM_CONFIG[confirmPopup.type]?.variant}
        isLoading={confirmPopup.type === 'approve' ? isApprovePending : isUpdatePending}
      />

      <ConfirmPopup
        isOpen={pilotStatusConfirm.isOpen}
        onClose={() => setPilotStatusConfirm({ isOpen: false, data: null })}
        onConfirm={handleConfirmPilotStatusChange}
        title={
          pilotStatusConfirm.data?.newStatus === 'started' ? 'Start Pilot' :
          pilotStatusConfirm.data?.newStatus === 'cancelled' ? 'Cancel Pilot' : 'Update Pilot Status'
        }
        message={
          pilotStatusConfirm.data?.newStatus === 'started' ? 'Are you sure you want to start this pilot?' :
          pilotStatusConfirm.data?.newStatus === 'trial' ? 'Are you sure you want to start the trial for this pilot?' :
          pilotStatusConfirm.data?.newStatus === 'implemented' ? 'Are you sure you want to mark this pilot as implemented?' :
          pilotStatusConfirm.data?.newStatus === 'cancelled' ? 'Are you sure you want to cancel this pilot?' :
          'Are you sure you want to update this pilot status?'
        }
        confirmLabel={
          pilotStatusConfirm.data?.newStatus === 'started' ? 'Start Pilot' :
          pilotStatusConfirm.data?.newStatus === 'cancelled' ? 'Cancel' : 'Update'
        }
        variant={pilotStatusConfirm.data?.newStatus === 'cancelled' ? 'red' : 'green'}
        isLoading={isStartPilotPending || isStartTrialPending || isImplementPending || isCancelPilotPending}
      />

      <RequestEditPopup
        isOpen={showRequestEditPopup}
        onClose={() => setShowRequestEditPopup(false)}
        onSubmit={handleRequestEditSubmit}
        isLoading={isRequestEditPending}
      />

      <RequestEditPopup
        isOpen={showRejectPopup}
        onClose={() => setShowRejectPopup(false)}
        onSubmit={handleRejectSubmit}
        isLoading={isRejectPending}
        title="Reject VLE"
        placeholder="Enter rejection reason..."
      />
      </div>
    </div>
  );
};

export default VLEDetails;
