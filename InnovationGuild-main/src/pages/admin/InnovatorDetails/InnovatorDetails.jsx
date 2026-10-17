import { useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import InnovatorProfileForm from '../../../components/admin/Forms/InnovatorProfileForm';
import InnovationTable from '../../../components/admin/Tables/InnovationTable/InnovationTable';
import InnovationFilter from '../../../components/admin/Tables/InnovationTable/InnovationFilter';
import AdminDetailActions from '../../../components/admin/AdminDetailActions';
import ConfirmPopup from '../../../components/admin/Popups/ConfirmPopup';
import RequestEditPopup from '../../../components/admin/Popups/RequestEditPopup';
import TabsSmall from '../../../components/admin/TabsSmall';
import { getStateOptions } from '../../../utils/LocationData/locationData';
import {
  useGetAdminInnovatorById,
  useGetAdminInnovatorInnovations,
  useApproveAdminInnovator,
  useRejectAdminInnovator,
  useUpdateAdminInnovator,
  useRequestEditAdminInnovator,
} from '../../../hooks/queries/admin';
import { INNOVATION_CATEGORY_OPTIONS, INNOVATION_SUBCATEGORY_OPTIONS } from '../../../utils/constants/innovationConstants';

const toFormData = (user, profile) => ({
  profilePic: user.profilePicture || null,
  fullName: user.fullName || '',
  enterpriseName: (profile?.enterpriseName && profile.enterpriseName !== 'NA') ? profile.enterpriseName : '',
  isNotRegistered: !profile?.enterpriseName || profile?.enterpriseName === 'NA',
  startDate: profile?.startDate ? new Date(profile.startDate) : null,
  links: profile?.links || '',
  state: profile?.state || '',
  district: profile?.district || '',
  addressLine1: profile?.addressLine1 || '',
  addressLine2: profile?.addressLine2 || '',
  description: profile?.description || '',
  status: user.status?.toLowerCase() || 'pending',
  submittedDate: user.signUpDate ? new Date(user.signUpDate).toISOString().split('T')[0] : '',
  approvedDate: user.approvedAt ? new Date(user.approvedAt).toISOString().split('T')[0] : '',
});

const CONFIRM_CONFIG = {
  approve: { title: 'Approve Innovator', message: 'Are you sure you want to approve this innovator?', label: 'Approve', variant: 'green' },
  submit:  { title: 'Submit Changes',    message: 'Are you sure you want to submit these changes?',    label: 'Submit',  variant: 'green' },
};

const InnovatorDetails = () => {
  const { innovatorId: id } = useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const latestFormDataRef = useRef(null);
  const formRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [confirmPopup, setConfirmPopup] = useState({ isOpen: false, type: null });
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [showRequestEditPopup, setShowRequestEditPopup] = useState(false);

  // Filter states for innovations tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const stateOptions = useMemo(() => getStateOptions(), []);
  const categoryOptions = INNOVATION_CATEGORY_OPTIONS;
  const subCategoryOptions = INNOVATION_SUBCATEGORY_OPTIONS;

  const { data: innovatorData, isLoading: profileLoading } = useGetAdminInnovatorById(id);
  const user = innovatorData?.data?.user;
  const profile = innovatorData?.data?.profile;
  const innovatorProfile = user ? toFormData(user, profile) : null;
  const status = user?.status?.toLowerCase() || 'pending';

  const innovationsParams = activeTab === 'innovations' && status === 'approved'
    ? {
        page: currentPage,
        limit: itemsPerPage,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedState && { state: selectedState }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedSubCategory && { subCategory: selectedSubCategory }),
      }
    : null;

  const { data: innovationsData } = useGetAdminInnovatorInnovations(id, innovationsParams);

  const innovationsTableData = useMemo(() =>
    (innovationsData?.data?.innovations || []).map(i => ({
      id: i._id,
      innovationName: i.innovationName || '—',
      innovatorName: '',
      category: i.category || [],
      subCategory: i.subcategory || [],
      headquarters: i.salesLocation || [],
      noImplemented: i.noImplemented ?? 0,
      approvalStage: i.status === 'APPROVED' ? 'Yes' : 'No',
    })),
    [innovationsData]
  );

  const totalPages = innovationsData?.data?.pagination?.totalPages ?? 1;
  const paginationProps = {
    currentPage,
    totalPages,
    onPageChange: setCurrentPage,
    onPrevious: () => setCurrentPage(prev => Math.max(1, prev - 1)),
    onNext: () => setCurrentPage(prev => Math.min(totalPages, prev + 1)),
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < totalPages,
  };

  const { mutate: approveMutate, isPending: isApproving } = useApproveAdminInnovator();
  const { mutate: rejectMutate, isPending: isRejecting } = useRejectAdminInnovator();
  const { mutate: updateMutate, isPending: isUpdating } = useUpdateAdminInnovator();
  const { mutate: requestEditMutate, isPending: isRequestEditPending } = useRequestEditAdminInnovator();

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedState('');
    setSelectedCategory('');
    setSelectedSubCategory('');
    setCurrentPage(1);
  };

  const showStickyBar = status === 'pending' || isEditMode;

  const handleApprove = () => setConfirmPopup({ isOpen: true, type: 'approve' });
  const handleReject = () => setShowRejectPopup(true);
  const handleRequestEdit = () => setShowRequestEditPopup(true);

  const handleConfirmAction = () => {
    if (confirmPopup.type === 'approve') {
      approveMutate(id, {
        onSuccess: () => setConfirmPopup({ isOpen: false, type: null })
      });
    } else if (confirmPopup.type === 'submit') {
      const data = latestFormDataRef.current;
      const fd = new FormData();
      if (data.profilePic instanceof File) fd.append('profilePic', data.profilePic);
      fd.append('fullName', data.fullName || '');
      ['enterpriseName', 'startDate', 'links', 'state', 'district',
       'addressLine1', 'addressLine2', 'description'].forEach(k => {
        fd.append(k, data[k] ?? '');
      });
      updateMutate(
        { innovatorId: id, formData: fd },
        { onSuccess: () => { setIsEditMode(false); setConfirmPopup({ isOpen: false, type: null }); } }
      );
    } else {
      setConfirmPopup({ isOpen: false, type: null });
    }
  };

  const handleRejectSubmit = (reason) => {
    rejectMutate(
      { innovatorId: id, reason },
      { onSuccess: () => setShowRejectPopup(false) }
    );
  };

  const handleRequestEditSubmit = (reason) => {
    requestEditMutate(
      { innovatorId: id, reason },
      { onSuccess: () => { setShowRequestEditPopup(false); navigate(-1); } }
    );
  };

  const handleEditToggle = () => setIsEditMode(true);

  const handleFormDataChange = (data) => {
    latestFormDataRef.current = data;
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

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center py-12 text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-page ${showStickyBar ? 'pb-28' : ''}`}>
      <div className="flex flex-col gap-8">
        {/* Header Title */}
        <div className="shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="shrink-0 p-2 hover:bg-light rounded-lg transition-colors group cursor-pointer"
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
              Innovator Details
            </h1>
          </div>
          <div className="border-t mt-6 border-accent-green-dark"></div>
        </div>

        {/* Tabs — approved only */}
        {status === 'approved' && (
          <TabsSmall
            tabs={[
              { id: 'profile', label: 'Profile Detail' },
              { id: 'innovations', label: 'Innovations' }
            ]}
            activeTab={activeTab}
            onChange={(tab) => {
              setActiveTab(tab);
              handleClearFilters();
            }}
          />
        )}

        {/* Profile Form */}
        {(status !== 'approved' || activeTab === 'profile') && innovatorProfile && (
          <InnovatorProfileForm
            ref={formRef}
            initialData={innovatorProfile}
            isEditMode={isEditMode}
            onEditToggle={handleEditToggle}
            onDataChange={handleFormDataChange}
            onSubmit={handleFormSubmit}
          />
        )}

        {/* Innovations List — approved + innovations tab */}
        {status === 'approved' && activeTab === 'innovations' && (
          <div className="bg-white rounded-2xl sm:rounded-[28px] lg:rounded-4xl shadow-lg overflow-hidden border border-accent-green-dark">
            <div className="p-4 border-b border-input-border">
              <InnovationFilter
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedState={selectedState}
                setSelectedState={setSelectedState}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedSubCategory={selectedSubCategory}
                setSelectedSubCategory={setSelectedSubCategory}
                onClearFilters={handleClearFilters}
                stateOptions={stateOptions}
                categoryOptions={categoryOptions}
                subCategoryOptions={subCategoryOptions}
              />
            </div>

            <InnovationTable
              data={innovationsTableData}
              pagination={paginationProps}
              showInnovatorColumn={false}
              showAllColumns={true}
            />
          </div>
        )}
      </div>

      {/* Sticky Action Bar */}
      <AdminDetailActions
        status={status}
        isEditMode={isEditMode}
        onApprove={status === 'pending' ? handleApprove : null}
        onReject={status === 'pending' ? handleReject : null}
        onRequestEdit={status === 'pending' ? handleRequestEdit : null}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      {/* Popups */}
      <ConfirmPopup
        isOpen={confirmPopup.isOpen}
        onClose={() => setConfirmPopup({ isOpen: false, type: null })}
        onConfirm={handleConfirmAction}
        title={CONFIRM_CONFIG[confirmPopup.type]?.title}
        message={CONFIRM_CONFIG[confirmPopup.type]?.message}
        confirmLabel={CONFIRM_CONFIG[confirmPopup.type]?.label}
        variant={CONFIRM_CONFIG[confirmPopup.type]?.variant}
        isLoading={confirmPopup.type === 'approve' ? isApproving : isUpdating}
      />

      <RequestEditPopup
        isOpen={showRejectPopup}
        onClose={() => setShowRejectPopup(false)}
        onSubmit={handleRejectSubmit}
        title="Reject Innovator"
        isLoading={isRejecting}
      />

      <RequestEditPopup
        isOpen={showRequestEditPopup}
        onClose={() => setShowRequestEditPopup(false)}
        onSubmit={handleRequestEditSubmit}
        isLoading={isRequestEditPending}
      />
    </div>
  );
};

export default InnovatorDetails;
