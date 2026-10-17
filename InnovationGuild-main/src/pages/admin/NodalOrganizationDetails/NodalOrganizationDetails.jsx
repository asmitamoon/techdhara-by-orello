import { useState, useRef, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import NodalOrgProfileForm from '../../../components/admin/Forms/NodalOrgProfileForm';
import AoTable from '../../../components/admin/Tables/AoTable/AoTable';
import AdminDetailActions from '../../../components/admin/AdminDetailActions';
import ConfirmPopup from '../../../components/admin/Popups/ConfirmPopup';
import RequestEditPopup from '../../../components/admin/Popups/RequestEditPopup';
import TabsSmall from '../../../components/admin/TabsSmall';
import { getStateOptions, getDistrictOptions, getStateName, getDistrictName } from '../../../utils/LocationData/locationData';
import AoFilter from '../../../components/admin/Tables/AoTable/AoFilter';
import InnovationRequestTable from '../../../components/admin/Tables/ProblemTable/InnovationRequestTable';
import ServiceRequestTable from '../../../components/admin/Tables/ProblemTable/ServiceRequestTable';
import ProblemFilter from '../../../components/admin/Tables/ProblemTable/ProblemFilter';
import PageLoader from '../../../components/ui/PageLoader';
import {
  useGetAdminNoById,
  useGetAdminNoAos,
  useGetAdminNoProblems,
  useGetAdminNoServiceRequests,
  useApproveAdminNo,
  useRejectAdminNo,
  useUpdateAdminNo,
  useRequestEditAdminNo,
} from '../../../hooks/queries/admin';
import { useOperations } from '../../../hooks/queries/public';
import { PROBLEM_CATEGORY_OPTIONS, UNIT_TYPE_OPTIONS, OWNERSHIP_OPTIONS } from '../../../utils/constants/problemConstants';
import useDebounce from '../../../hooks/useDebounce';

const LIMIT = 20;

const CONFIRM_CONFIG = {
  approve: { title: 'Approve Organization', message: 'Are you sure you want to approve this organization?', label: 'Approve', variant: 'green' },
  submit:  { title: 'Submit Changes',       message: 'Are you sure you want to submit these changes?',       label: 'Submit',  variant: 'green' },
};

const NodalOrganizationDetails = () => {
  const { noId: _id } = useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const latestFormDataRef = useRef(null);
  const formRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [problemsSubTab, setProblemsSubTab] = useState('innovation');
  const [confirmPopup, setConfirmPopup] = useState({ isOpen: false, type: null });
  const [showRequestEditPopup, setShowRequestEditPopup] = useState(false);
  const [showRejectPopup, setShowRejectPopup] = useState(false);

  // Pagination
  const [aoPage, setAoPage] = useState(1);
  const [innovationPage, setInnovationPage] = useState(1);
  const [servicePage, setServicePage] = useState(1);

  // AO filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  // Problem filters
  const [problemSearchQuery, setProblemSearchQuery] = useState('');
  const [problemSelectedCategory, setProblemSelectedCategory] = useState('');
  const [problemSelectedOperation, setProblemSelectedOperation] = useState('');
  const [problemSelectedState, setProblemSelectedState] = useState('');
  const [problemSelectedDistrict, setProblemSelectedDistrict] = useState('');
  const [problemSelectedUnitType, setProblemSelectedUnitType] = useState('');
  const [problemSelectedOwnership, setProblemSelectedOwnership] = useState('');

  const debouncedSearch = useDebounce(searchQuery);
  const debouncedProblemSearch = useDebounce(problemSearchQuery);

  useEffect(() => { setAoPage(1); }, [debouncedSearch]);
  useEffect(() => { setInnovationPage(1); setServicePage(1); }, [debouncedProblemSearch, problemSelectedCategory, problemSelectedOperation, problemSelectedState, problemSelectedDistrict]);

  const stateOptions = useMemo(() => getStateOptions(), []);
  const districtOptions = useMemo(() =>
    selectedState ? getDistrictOptions(selectedState) : [],
    [selectedState]
  );

  const categoryOptions = PROBLEM_CATEGORY_OPTIONS;
  const { data: operationOptions = [] } = useOperations();
  const problemDistrictOptions = useMemo(
    () => problemSelectedState ? getDistrictOptions(problemSelectedState) : [],
    [problemSelectedState]
  );

  const unitTypeOptions = UNIT_TYPE_OPTIONS;
  const ownershipOptions = OWNERSHIP_OPTIONS;

  // --- API Queries ---
  const { data: noData, isLoading: noLoading } = useGetAdminNoById(_id);

  const aoParams = activeTab === 'ao' ? {
    page: aoPage,
    limit: LIMIT,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(selectedState && { state: selectedState }),
    ...(selectedDistrict && { district: selectedDistrict }),
  } : null;
  const { data: aoData, isLoading: aoLoading } = useGetAdminNoAos(_id, aoParams);

  const innovationParams = activeTab === 'problems' && problemsSubTab === 'innovation' ? {
    page: innovationPage,
    limit: LIMIT,
    ...(debouncedProblemSearch && { search: debouncedProblemSearch }),
    ...(problemSelectedCategory && { category: problemSelectedCategory }),
    ...(problemSelectedOperation && { operation: problemSelectedOperation }),
    ...(problemSelectedState && { state: problemSelectedState }),
    ...(problemSelectedDistrict && { district: problemSelectedDistrict }),
  } : null;
  const { data: innovationData, isLoading: innovationLoading } = useGetAdminNoProblems(_id, innovationParams);

  const serviceParams = activeTab === 'problems' && problemsSubTab === 'service' ? {
    page: servicePage,
    limit: LIMIT,
    ...(debouncedProblemSearch && { search: debouncedProblemSearch }),
    ...(problemSelectedUnitType && { unitType: problemSelectedUnitType }),
    ...(problemSelectedOwnership && { ownership: problemSelectedOwnership }),
  } : null;
  const { data: serviceData, isLoading: serviceLoading } = useGetAdminNoServiceRequests(_id, serviceParams);

  const { mutate: approveNoMutate, isPending: isApprovePending } = useApproveAdminNo();
  const { mutate: rejectNoMutate,  isPending: isRejectPending  } = useRejectAdminNo();
  const { mutate: updateNoMutate,  isPending: isUpdatePending  } = useUpdateAdminNo();
  const { mutate: requestEditMutate, isPending: isRequestEditPending } = useRequestEditAdminNo();

  // --- Derived data ---
  const profileData = useMemo(() => {
    if (!noData?.data) return null;
    const { user, profile } = noData.data;
    return {
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
      submittedDate: profile?.createdAt ? profile.createdAt.split('T')[0] : '',
      approvedDate: user?.approvedAt ? user.approvedAt.split('T')[0] : '',
    };
  }, [noData]);

  const noStatus = profileData?.status || '';

  const aoTableData = useMemo(() => (aoData?.data?.affiliatedOrgs || []).map(ao => ({
    id: ao._id,
    name: ao.profile?.orgName || '—',
    state: getStateName(ao.profile?.state),
    district: getDistrictName(ao.profile?.district, ao.profile?.state),
    poc: ao.profile?.pocName || '—',
    vles: String(ao.vleCount ?? 0),
    prob: String(ao.probCount ?? 0),
    probVle: String(ao.probVleCount ?? 0),
  })), [aoData]);

  const aoPagination = useMemo(() => {
    const raw = aoData?.data?.pagination;
    const totalPages = raw?.totalPages ?? 1;
    return {
      currentPage: aoPage,
      totalPages,
      onPageChange: setAoPage,
      onPrevious: () => setAoPage(p => Math.max(1, p - 1)),
      onNext: () => setAoPage(p => Math.min(totalPages, p + 1)),
      canGoPrevious: aoPage > 1,
      canGoNext: aoPage < totalPages,
    };
  }, [aoPage, aoData]);

  const innovationTableData = useMemo(() => {
    const nodalOrgName = innovationData?.data?.nodalOrgName || '—';
    return (innovationData?.data?.problems || []).map(p => ({
      id: p.id,
      title: p.title || '—',
      vle: p.vle || '—',
      category: p.category || null,
      subCategory: p.subCategory?.length ? p.subCategory : null,
      operations: p.operations?.length ? p.operations : null,
      state: getStateName(p.state),
      district: getDistrictName(p.district, p.state),
      nodalOrg: nodalOrgName,
      affiliatedOrg: '—',
    }));
  }, [innovationData]);

  const innovationPagination = useMemo(() => {
    const raw = innovationData?.data?.pagination;
    const totalPages = raw?.totalPages ?? 1;
    return {
      currentPage: innovationPage,
      totalPages,
      onPageChange: setInnovationPage,
      onPrevious: () => setInnovationPage(p => Math.max(1, p - 1)),
      onNext: () => setInnovationPage(p => Math.min(totalPages, p + 1)),
      canGoPrevious: innovationPage > 1,
      canGoNext: innovationPage < totalPages,
    };
  }, [innovationPage, innovationData]);

  const serviceTableData = useMemo(() => {
    const nodalOrgName = serviceData?.data?.nodalOrgName || '—';
    return (serviceData?.data?.serviceRequests || []).map(sr => ({
      id: sr.id,
      techName: sr.techName || '—',
      vle: sr.vle || '—',
      techCompany: sr.techCompany || '—',
      unitType: sr.unitType || '—',
      ownership: sr.ownership || '—',
      nodalOrg: nodalOrgName,
      affiliatedOrg: '—',
    }));
  }, [serviceData]);

  const servicePagination = useMemo(() => {
    const raw = serviceData?.data?.pagination;
    const totalPages = raw?.totalPages ?? 1;
    return {
      currentPage: servicePage,
      totalPages,
      onPageChange: setServicePage,
      onPrevious: () => setServicePage(p => Math.max(1, p - 1)),
      onNext: () => setServicePage(p => Math.min(totalPages, p + 1)),
      canGoPrevious: servicePage > 1,
      canGoNext: servicePage < totalPages,
    };
  }, [servicePage, serviceData]);

  // --- Handlers ---
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedState('');
    setSelectedDistrict('');
    setAoPage(1);
  };

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

  const showStickyBar = noStatus === 'pending' || isEditMode;

  const handleApprove = () => setConfirmPopup({ isOpen: true, type: 'approve' });
  const handleReject = () => setShowRejectPopup(true);
  const handleRequestEdit = () => setShowRequestEditPopup(true);

  const handleRejectSubmit = (reason) => {
    rejectNoMutate({ noId: _id, reason }, {
      onSuccess: () => {
        setShowRejectPopup(false);
        navigate('/admin/nodal-organizations');
      },
    });
  };

  const handleConfirmAction = () => {
    if (confirmPopup.type === 'approve') {
      approveNoMutate(_id, {
        onSuccess: () => setConfirmPopup({ isOpen: false, type: null }),
      });
      return;
    }
    if (confirmPopup.type === 'submit') {
      const data = latestFormDataRef.current;
      const fd = new FormData();
      if (data.logo instanceof File) fd.append('logo', data.logo);
      ['orgName', 'orgType', 'hqState', 'website', 'description', 'hasRuralPrograms', 'hasTechIntegration', 'potentialAoCount']
        .forEach(k => fd.append(k, data[k] || ''));
      (data.operationalStates || []).forEach(s => fd.append('operationalStates', s));
      (data.channels || []).forEach(c => fd.append('channels', c));
      updateNoMutate({ noId: _id, formData: fd }, {
        onSuccess: () => {
          setIsEditMode(false);
          setConfirmPopup({ isOpen: false, type: null });
        },
      });
      return;
    }
    setConfirmPopup({ isOpen: false, type: null });
  };

  const handleRequestEditSubmit = (reason) => {
    requestEditMutate(
      { noId: _id, reason },
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

  if (noLoading) return <PageLoader />;

  return (
    <div className={`min-h-screen bg-page ${showStickyBar ? 'pb-28' : ''}`}>
      <div className="flex flex-col gap-8">
        {/* Header Title */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
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
              Nodal Organization Details
            </h1>
          </div>
          <div className="border-t mt-6 border-accent-green-dark"></div>
        </div>

        {/* Tabs — approved only */}
        {noStatus === 'approved' && (
          <TabsSmall
            tabs={[
              { id: 'profile', label: 'Profile Detail' },
              { id: 'ao', label: 'Affiliated Organizations' },
              { id: 'problems', label: 'Problems Added' }
            ]}
            activeTab={activeTab}
            onChange={(tab) => {
              if (isEditMode) handleCancel();
              setActiveTab(tab);
              handleClearFilters();
              handleClearProblemFilters();
            }}
            className='w-2xl'
          />
        )}

        {/* Profile Form */}
        {profileData && (noStatus !== 'approved' || activeTab === 'profile') && (
          <NodalOrgProfileForm
            ref={formRef}
            initialData={profileData}
            isEditMode={isEditMode}
            onEditToggle={handleEditToggle}
            onDataChange={handleFormDataChange}
            onSubmit={handleFormSubmit}
          />
        )}

        {/* AO List — approved + ao tab */}
        {noStatus === 'approved' && activeTab === 'ao' && (
          <div className="bg-white rounded-2xl sm:rounded-[28px] lg:rounded-[32px] shadow-lg overflow-hidden border border-accent-green-dark">
            <div className="p-4 border-b border-input-border">
              <AoFilter
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedState={selectedState}
                setSelectedState={(val) => { setSelectedState(val); setSelectedDistrict(''); setAoPage(1); }}
                selectedDistrict={selectedDistrict}
                setSelectedDistrict={(val) => { setSelectedDistrict(val); setAoPage(1); }}
                onClearFilters={handleClearFilters}
                stateOptions={stateOptions}
                districtOptions={districtOptions}
                showNOFilter={false}
              />
            </div>

            <AoTable
              data={aoTableData}
              isLoading={aoLoading}
              pagination={aoPagination}
              showAllColumns={true}
            />
          </div>
        )}

        {/* Problems Added */}
        {activeTab === 'problems' && noStatus === 'approved' && (
          <div className="flex flex-col gap-6">
            <TabsSmall
              tabs={[
                { id: 'innovation', label: 'Innovation Requests' },
                { id: 'service', label: 'Service Requests' }
              ]}
              activeTab={problemsSubTab}
              onChange={(tab) => {
                setProblemsSubTab(tab);
                handleClearProblemFilters();
              }}
              className="w-full sm:w-md"
            />
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-accent-green-dark">
              <div className="p-4 border-b border-input-border">
                <ProblemFilter
                  searchQuery={problemSearchQuery}
                  setSearchQuery={(val) => setProblemSearchQuery(val)}
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
                  isLoading={innovationLoading}
                  pagination={innovationPagination}
                  routePrefix="/admin"
                />
              ) : (
                <ServiceRequestTable
                  data={serviceTableData}
                  isLoading={serviceLoading}
                  pagination={servicePagination}
                  routePrefix="/admin"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Action Bar */}
      <AdminDetailActions
        status={noStatus}
        isEditMode={isEditMode}
        onApprove={noStatus === 'pending' ? handleApprove : null}
        onReject={noStatus === 'pending' ? handleReject : null}
        onRequestEdit={noStatus === 'pending' ? handleRequestEdit : null}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      {/* Approve / Submit confirm popup */}
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

      {/* Reject popup — collects reason */}
      <RequestEditPopup
        isOpen={showRejectPopup}
        onClose={() => setShowRejectPopup(false)}
        onSubmit={handleRejectSubmit}
        isLoading={isRejectPending}
      />

      {/* Request Edit popup */}
      <RequestEditPopup
        isOpen={showRequestEditPopup}
        onClose={() => setShowRequestEditPopup(false)}
        onSubmit={handleRequestEditSubmit}
        isLoading={isRequestEditPending}
      />
    </div>
  );
};

export default NodalOrganizationDetails;
