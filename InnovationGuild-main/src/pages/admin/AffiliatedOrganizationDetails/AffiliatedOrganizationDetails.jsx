import { useState, useRef, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import AoProfileForm from '../../../components/admin/Forms/AoProfileForm';
import VleTable from '../../../components/admin/Tables/VleTable/VleTable';
import AdminDetailActions from '../../../components/admin/AdminDetailActions';
import ConfirmPopup from '../../../components/admin/Popups/ConfirmPopup';
import RequestEditPopup from '../../../components/admin/Popups/RequestEditPopup';
import TabsSmall from '../../../components/admin/TabsSmall';
import { getStateOptions, getDistrictOptions, getStateName, getDistrictName } from '../../../utils/LocationData/locationData';
import VleFilter from '../../../components/admin/Tables/VleTable/VleFilter';
import InnovationRequestTable from '../../../components/admin/Tables/ProblemTable/InnovationRequestTable';
import ServiceRequestTable from '../../../components/admin/Tables/ProblemTable/ServiceRequestTable';
import ProblemFilter from '../../../components/admin/Tables/ProblemTable/ProblemFilter';
import PageLoader from '../../../components/ui/PageLoader';
import {
  useGetAdminAoById,
  useGetAdminAoVles,
  useGetAdminAoProblems,
  useGetAdminAoServiceRequests,
  useApproveAdminAo,
  useRejectAdminAo,
  useUpdateAdminAo,
  useRequestEditAdminAo,
} from '../../../hooks/queries/admin';
import { useOperations, useVillages } from '../../../hooks/queries/public';
import { PROBLEM_CATEGORY_OPTIONS, UNIT_TYPE_OPTIONS, OWNERSHIP_OPTIONS } from '../../../utils/constants/problemConstants';
import useDebounce from '../../../hooks/useDebounce';

const LIMIT = 20;

const CONFIRM_CONFIG = {
  approve: { title: 'Approve Organization', message: 'Are you sure you want to approve this organization?', label: 'Approve', variant: 'green' },
  submit:  { title: 'Submit Changes',       message: 'Are you sure you want to submit these changes?',       label: 'Submit',  variant: 'green' },
};

const AffiliatedOrganizationDetails = () => {
  const { aoId: _id } = useParams();
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
  const [vlePage, setVlePage] = useState(1);
  const [innovationPage, setInnovationPage] = useState(1);
  const [servicePage, setServicePage] = useState(1);

  // VLE filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

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

  useEffect(() => { setVlePage(1); }, [debouncedSearch]);
  useEffect(() => { setInnovationPage(1); setServicePage(1); }, [debouncedProblemSearch, problemSelectedCategory, problemSelectedOperation, problemSelectedState, problemSelectedDistrict]);

  const stateOptions = useMemo(() => getStateOptions(), []);
  const districtOptions = useMemo(() =>
    selectedState ? getDistrictOptions(selectedState) : [],
    [selectedState]
  );
  const { data: villageOptions = [] } = useVillages(selectedState, selectedDistrict);

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' }
  ];

  const personaOptions = [
    { value: 'sales',       label: 'Sales' },
    { value: 'rental',      label: 'Rental' },
    { value: 'servicing',   label: 'Servicing' },
    { value: 'fabrication', label: 'Fabrication' },
  ];

  const statusOptions = [
    { value: 'listed', label: 'Listed' },
    { value: 'interested', label: 'Interested' },
    { value: 'active', label: 'Active' },
    { value: 'commercial', label: 'Commercial' }
  ];

  const categoryOptions = PROBLEM_CATEGORY_OPTIONS;
  const { data: operationOptions = [] } = useOperations();
  const problemDistrictOptions = useMemo(
    () => problemSelectedState ? getDistrictOptions(problemSelectedState) : [],
    [problemSelectedState]
  );

  const unitTypeOptions = UNIT_TYPE_OPTIONS;
  const ownershipOptions = OWNERSHIP_OPTIONS;

  // --- API Queries ---
  const { data: aoData, isLoading: aoLoading } = useGetAdminAoById(_id);

  const vleParams = activeTab === 'vle' ? {
    page: vlePage,
    limit: LIMIT,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(selectedState && { state: selectedState }),
    ...(selectedDistrict && { district: selectedDistrict }),
    ...(selectedVillage && { village: selectedVillage }),
    ...(selectedStatus && { vleStatus: selectedStatus }),
  } : null;
  const { data: vleData, isLoading: vleLoading } = useGetAdminAoVles(_id, vleParams);

  const innovationParams = activeTab === 'problems' && problemsSubTab === 'innovation' ? {
    page: innovationPage,
    limit: LIMIT,
    ...(debouncedProblemSearch && { search: debouncedProblemSearch }),
    ...(problemSelectedCategory && { category: problemSelectedCategory }),
    ...(problemSelectedOperation && { operation: problemSelectedOperation }),
    ...(problemSelectedState && { state: problemSelectedState }),
    ...(problemSelectedDistrict && { district: problemSelectedDistrict }),
  } : null;
  const { data: innovationData, isLoading: innovationLoading } = useGetAdminAoProblems(_id, innovationParams);

  const serviceParams = activeTab === 'problems' && problemsSubTab === 'service' ? {
    page: servicePage,
    limit: LIMIT,
    ...(debouncedProblemSearch && { search: debouncedProblemSearch }),
    ...(problemSelectedUnitType && { unitType: problemSelectedUnitType }),
    ...(problemSelectedOwnership && { ownership: problemSelectedOwnership }),
  } : null;
  const { data: serviceData, isLoading: serviceLoading } = useGetAdminAoServiceRequests(_id, serviceParams);

  const { mutate: approveAoMutate, isPending: isApprovePending } = useApproveAdminAo();
  const { mutate: rejectAoMutate,  isPending: isRejectPending  } = useRejectAdminAo();
  const { mutate: updateAoMutate,  isPending: isUpdatePending  } = useUpdateAdminAo();
  const { mutate: requestEditMutate, isPending: isRequestEditPending } = useRequestEditAdminAo();

  // --- Derived data ---
  const profileData = useMemo(() => {
    if (!aoData?.data) return null;
    const { user, profile } = aoData.data;
    return {
      profilePicture: user.profilePicture || null,
      orgName: profile.orgName || '',
      orgType: profile.orgType || '',
      orgTypeOther: profile.orgTypeOther || '',
      streamOfWork: profile.streamOfWork || [],
      streamOfWorkOther: profile.streamOfWorkOther || '',
      nodalOrgName: profile.nodalOrg?.orgName || '',
      pocName: profile.pocName || '',
      state: profile.state || '',
      district: profile.district || '',
      village: profile.village || '',
      website: profile.website || '',
      status: (user.status || '').toLowerCase(),
      submittedDate: profile.createdAt ? profile.createdAt.split('T')[0] : '',
      approvedDate: user.approvedAt ? user.approvedAt.split('T')[0] : '',
    };
  }, [aoData]);

  const aoStatus = profileData?.status || '';

  const vleTableData = useMemo(() => (vleData?.data?.vles || []).map(vle => ({
    id: vle.id,
    name: vle.name || '—',
    status: vle.vleStatus || '—',
    gender: vle.gender || '—',
    state: getStateName(vle.state),
    district: getDistrictName(vle.district, vle.state),
    village: vle.village || '—',
    mobile: vle.mobile || '—',
    email: vle.email || '—',
    problems: vle.problems ?? '—',
    persona: vle.interestedPersonas?.length ? vle.interestedPersonas : null,
    training: vle.trainings || [],
  })), [vleData]);

  const vlePagination = useMemo(() => {
    const raw = vleData?.data?.pagination;
    const totalPages = raw?.totalPages ?? 1;
    return {
      currentPage: vlePage,
      totalPages,
      onPageChange: setVlePage,
      onPrevious: () => setVlePage(p => Math.max(1, p - 1)),
      onNext: () => setVlePage(p => Math.min(totalPages, p + 1)),
      canGoPrevious: vlePage > 1,
      canGoNext: vlePage < totalPages,
    };
  }, [vlePage, vleData]);

  const innovationTableData = useMemo(() => {
    const affiliatedOrgName = innovationData?.data?.affiliatedOrgName || '—';
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
      affiliatedOrg: affiliatedOrgName,
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
    const affiliatedOrgName = serviceData?.data?.affiliatedOrgName || '—';
    const nodalOrgName = serviceData?.data?.nodalOrgName || '—';
    return (serviceData?.data?.serviceRequests || []).map(sr => ({
      id: sr.id,
      techName: sr.techName || '—',
      vle: sr.vle || '—',
      techCompany: sr.techCompany || '—',
      unitType: sr.unitType || '—',
      ownership: sr.ownership || '—',
      nodalOrg: nodalOrgName,
      affiliatedOrg: affiliatedOrgName,
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
    setSelectedVillage('');
    setSelectedGender('');
    setSelectedPersona('');
    setSelectedStatus('');
    setVlePage(1);
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

  const showStickyBar = aoStatus === 'pending' || isEditMode;

  const handleApprove = () => setConfirmPopup({ isOpen: true, type: 'approve' });
  const handleReject = () => setShowRejectPopup(true);
  const handleRequestEdit = () => setShowRequestEditPopup(true);

  const handleRejectSubmit = (reason) => {
    rejectAoMutate({ aoId: _id, reason }, {
      onSuccess: () => {
        setShowRejectPopup(false);
        navigate('/admin/affiliated-organizations');
      },
    });
  };

  const handleConfirmAction = () => {
    if (confirmPopup.type === 'approve') {
      approveAoMutate(_id, {
        onSuccess: () => setConfirmPopup({ isOpen: false, type: null }),
      });
      return;
    }
    if (confirmPopup.type === 'submit') {
      const data = latestFormDataRef.current;
      const fd = new FormData();
      if (data.logo instanceof File) fd.append('logo', data.logo);
      ['orgName', 'orgType', 'orgTypeOther', 'pocName', 'state', 'district', 'village', 'website']
        .forEach(k => fd.append(k, data[k] || ''));
      (data.streamOfWork || []).forEach(s => fd.append('streamOfWork', s));
      fd.append('streamOfWorkOther', data.streamOfWorkOther || '');
      updateAoMutate({ aoId: _id, formData: fd }, {
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
      { aoId: _id, reason },
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

  if (aoLoading) return <PageLoader />;

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
              Affiliated Organization Details
            </h1>
          </div>
          <div className="border-t mt-6 border-accent-green-dark"></div>
        </div>

        {/* Tabs — approved only */}
        {aoStatus === 'approved' && (
          <TabsSmall
            tabs={[
              { id: 'profile', label: 'Profile Detail' },
              { id: 'vle', label: 'Village Level Entrepreneurs' },
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
        {profileData && (aoStatus !== 'approved' || activeTab === 'profile') && (
          <AoProfileForm
            ref={formRef}
            initialData={profileData}
            isEditMode={isEditMode}
            onEditToggle={handleEditToggle}
            onDataChange={handleFormDataChange}
            onSubmit={handleFormSubmit}
          />
        )}

        {/* VLE List — approved + vle tab */}
        {aoStatus === 'approved' && activeTab === 'vle' && (
          <div className="bg-white rounded-2xl sm:rounded-[28px] lg:rounded-[32px] shadow-lg overflow-hidden border border-accent-green-dark">
            {/* Filters */}
            <div className="p-4 border-b border-input-border">
              <VleFilter
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedState={selectedState}
                setSelectedState={(val) => { setSelectedState(val); setSelectedDistrict(''); setSelectedVillage(''); setVlePage(1); }}
                selectedDistrict={selectedDistrict}
                setSelectedDistrict={(val) => { setSelectedDistrict(val); setSelectedVillage(''); setVlePage(1); }}
                selectedVillage={selectedVillage}
                setSelectedVillage={(val) => { setSelectedVillage(val); setVlePage(1); }}
                selectedGender={selectedGender}
                setSelectedGender={setSelectedGender}
                selectedPersona={selectedPersona}
                setSelectedPersona={setSelectedPersona}
                selectedStatus={selectedStatus}
                setSelectedStatus={(val) => { setSelectedStatus(val); setVlePage(1); }}
                onClearFilters={handleClearFilters}
                stateOptions={stateOptions}
                districtOptions={districtOptions}
                villageOptions={villageOptions}
                genderOptions={genderOptions}
                personaOptions={personaOptions}
                statusOptions={statusOptions}
              />
            </div>

            <VleTable
              data={vleTableData}
              isLoading={vleLoading}
              pagination={vlePagination}
              routePrefix="/admin"
            />
          </div>
        )}

        {/* Problems Added */}
        {activeTab === 'problems' && aoStatus === 'approved' && (
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
              {/* Filters */}
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
                  showVleColumn={false}
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
        status={aoStatus}
        isEditMode={isEditMode}
        onApprove={aoStatus === 'pending' ? handleApprove : null}
        onReject={aoStatus === 'pending' ? handleReject : null}
        onRequestEdit={aoStatus === 'pending' ? handleRequestEdit : null}
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

export default AffiliatedOrganizationDetails;
