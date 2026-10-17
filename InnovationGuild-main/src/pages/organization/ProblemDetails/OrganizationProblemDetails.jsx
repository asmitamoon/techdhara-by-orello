import { useState, useRef, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router';
import InnovationRequestForm from '../../../components/admin/Forms/InnovationRequestForm';
import ServiceRequestForm from '../../../components/admin/Forms/ServiceRequestForm';
import AdminDetailActions from '../../../components/admin/AdminDetailActions';
import ConfirmPopup from '../../../components/admin/Popups/ConfirmPopup';
import RequestEditPopup from '../../../components/admin/Popups/RequestEditPopup';
import PageLoader from '../../../components/ui/PageLoader';
import {
  useGetOrgProblemById,
  useGetOrgServiceRequestById,
  useApproveProblem,
  useRejectProblem,
  useRequestEditProblem,
  useUpdateOrgProblem,
  useUpdateOrgServiceRequest,
} from '../../../hooks/queries/org';

const CONFIRM_CONFIG = {
  approve: { title: 'Approve Request', message: 'Are you sure you want to approve this request?', label: 'Approve', variant: 'green' },
  submit:  { title: 'Submit Changes',  message: 'Are you sure you want to submit these changes?',  label: 'Submit',  variant: 'green' },
};

const ALLOWED_UPDATE_KEYS = [
  'problemTitle', 'problemDescription', 'regionState', 'regionDistrict', 'regionVillage',
  'category', 'categoryOther', 'valueChainStages', 'crops', 'operationsUndertaken',
  'machineOperations', 'currentMethodology', 'knowMachinery', 'machineChallenge',
  'energySource', 'pullCapacity', 'pullCapacityNotKnown', 'engineCapacity', 'motorCapacity',
  'renewableType', 'specificInfo', 'problemSize', 'endProducts', 'salesChannels',
  'newChannels', 'currentRevenue', 'expectedRevenue', 'machineBudget', 'uploadedImage',
];

const mapStatus = (s) => {
  if (!s) return 'draft';
  if (s === 'PUBLISHED') return 'approved';
  if (s === 'PENDING_APPROVAL') return 'pending';
  return s.toLowerCase();
};

const formatDate = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const OrganizationProblemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const latestFormDataRef = useRef(null);
  const formRef = useRef(null);
  const [confirmPopup, setConfirmPopup] = useState({ isOpen: false, type: null });
  const [showRequestEditPopup, setShowRequestEditPopup] = useState(false);
  const [showRejectPopup, setShowRejectPopup] = useState(false);

  const isServiceRequest = location.pathname.includes('service-request');

  // --- Data fetching ---
  const { data: problemData, isLoading: problemLoading } = useGetOrgProblemById(!isServiceRequest ? id : null);
  const { data: srData, isLoading: srLoading } = useGetOrgServiceRequestById(isServiceRequest ? id : null);
  const isLoading = isServiceRequest ? srLoading : problemLoading;

  // --- Mutations ---
  const { mutate: approveMutate, isPending: isApprovePending } = useApproveProblem();
  const { mutate: rejectMutate, isPending: isRejectPending } = useRejectProblem();
  const { mutate: requestEditMutate, isPending: isRequestEditPending } = useRequestEditProblem();
  const { mutate: updateMutate, isPending: isUpdatePending } = useUpdateOrgProblem();
  const { mutate: updateServiceMutate, isPending: isUpdateServicePending } = useUpdateOrgServiceRequest();

  // --- Data mapping ---
  const profileData = useMemo(() => {
    if (!problemData?.data?.problem) return null;
    const p = problemData.data.problem;
    return {
      problemTitle: p.problemTitle || '',
      problemDescription: p.problemDescription || '',
      regionState: p.regionState || '',
      regionDistrict: p.regionDistrict || '',
      regionVillage: p.regionVillage || '',
      category: p.category || '',
      categoryOther: p.categoryOther || '',
      valueChainStages: p.valueChainStages || [],
      crops: p.crops || '',
      operationsUndertaken: p.operationsUndertaken || [],
      machineOperations: p.machineOperations || [],
      currentMethodology: p.currentMethodology || '',
      knowMachinery: p.knowMachinery ?? null,
      machineChallenge: p.machineChallenge || '',
      energySource: p.energySource || [],
      pullCapacity: p.pullCapacity || '',
      pullCapacityNotKnown: p.pullCapacityNotKnown || false,
      engineCapacity: p.engineCapacity || '',
      motorCapacity: p.motorCapacity || '',
      renewableType: p.renewableType || '',
      specificInfo: p.specificInfo || '',
      problemSize: p.problemSize || '',
      endProducts: p.endProducts || '',
      salesChannels: p.salesChannels || '',
      newChannels: p.newChannels || '',
      currentRevenue: p.currentRevenue != null ? String(p.currentRevenue) : '',
      expectedRevenue: p.expectedRevenue != null ? String(p.expectedRevenue) : '',
      machineBudget: p.machineBudget != null ? String(p.machineBudget) : '',
      uploadedImage: p.coverImage || null,
      submittedDate: formatDate(p.createdAt),
      status: mapStatus(p.status),
      type: 'innovation',
    };
  }, [problemData]);

  const serviceProfileData = useMemo(() => {
    if (!srData?.data?.serviceRequest) return null;
    const sr = srData.data.serviceRequest;
    return {
      unitType: sr.unitType || '',
      techName: sr.techName || '',
      techSpecs: sr.techSpecs || '',
      techCompany: sr.techCompany || '',
      techCompanyNotAvailable: !sr.techCompany,
      cost: sr.cost ? `${sr.cost.min ?? ''} - ${sr.cost.max ?? ''}` : '',
      ownership: sr.ownership || '',
      individualBusinessPlan: sr.individualBusinessPlan || '',
      challenges: sr.challenges || '',
      photosLink: sr.photosLink || '',
      submittedDate: formatDate(sr.createdAt),
      status: 'approved',
      type: 'service',
    };
  }, [srData]);

  const activeProfileData = isServiceRequest ? serviceProfileData : profileData;
  const showStickyBar = activeProfileData?.status === 'pending' || isEditMode;

  // --- Action handlers ---
  const handleApprove = () => setConfirmPopup({ isOpen: true, type: 'approve' });
  const handleReject = () => setShowRejectPopup(true);
  const handleRequestEdit = () => setShowRequestEditPopup(true);

  const handleConfirmAction = () => {
    if (confirmPopup.type === 'approve') {
      approveMutate(id, {
        onSuccess: () => setConfirmPopup({ isOpen: false, type: null }),
      });
      return;
    }
    if (confirmPopup.type === 'submit') {
      const data = latestFormDataRef.current || {};
      if (isServiceRequest) {
        const SR_KEYS = ['unitType', 'techName', 'techSpecs', 'techCompany', 'ownership', 'individualBusinessPlan', 'challenges', 'photosLink'];
        const payload = Object.fromEntries(Object.entries(data).filter(([k]) => SR_KEYS.includes(k)));
        updateServiceMutate({ serviceRequestId: id, data: payload }, {
          onSuccess: () => { setIsEditMode(false); setConfirmPopup({ isOpen: false, type: null }); },
        });
      } else {
        const payload = Object.fromEntries(Object.entries(data).filter(([k]) => ALLOWED_UPDATE_KEYS.includes(k)));
        updateMutate({ problemId: id, data: payload }, {
          onSuccess: () => { setIsEditMode(false); setConfirmPopup({ isOpen: false, type: null }); },
        });
      }
      return;
    }
    setConfirmPopup({ isOpen: false, type: null });
  };

  const handleRejectSubmit = (reason) => {
    rejectMutate({ problemId: id, rejectionReason: reason }, {
      onSuccess: () => { setShowRejectPopup(false); navigate(-1); },
    });
  };

  const handleRequestEditSubmit = (reason) => {
    requestEditMutate({ problemId: id, reason }, {
      onSuccess: () => { setShowRequestEditPopup(false); navigate(-1); },
    });
  };

  // --- Edit-mode handlers ---
  const handleEditToggle = () => setIsEditMode(true);

  const handleFormDataChange = (currentFormData) => {
    latestFormDataRef.current = currentFormData;
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submitForm();
    }
  };

  const handleFormSubmit = () => {
    setConfirmPopup({ isOpen: true, type: 'submit' });
  };

  const handleCancel = () => setIsEditMode(false);

  if (isLoading) return <PageLoader />;
  if (!activeProfileData) return null;

  return (
    <div className={`min-h-screen bg-page ${showStickyBar ? 'pb-28' : ''}`}>
      <div className="flex flex-col gap-8">
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
              {isServiceRequest ? 'Service Request Details' : 'Innovation Request Details'}
            </h1>
          </div>
          <div className="border-t mt-6 border-accent-green-dark"></div>
        </div>

        {isServiceRequest ? (
          <ServiceRequestForm
            ref={formRef}
            initialData={activeProfileData}
            isEditMode={isEditMode}
            onEditToggle={handleEditToggle}
            onDataChange={handleFormDataChange}
            onSubmit={handleFormSubmit}
          />
        ) : (
          <InnovationRequestForm
            ref={formRef}
            initialData={activeProfileData}
            isEditMode={isEditMode}
            onEditToggle={handleEditToggle}
            onDataChange={handleFormDataChange}
            onSubmit={handleFormSubmit}
          />
        )}
      </div>

      {/* Sticky Action Bar */}
      <AdminDetailActions
        status={activeProfileData.status}
        isEditMode={isEditMode}
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestEdit={handleRequestEdit}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      {/* Approve / Submit confirmation popup */}
      <ConfirmPopup
        isOpen={confirmPopup.isOpen}
        onClose={() => setConfirmPopup({ isOpen: false, type: null })}
        onConfirm={handleConfirmAction}
        title={CONFIRM_CONFIG[confirmPopup.type]?.title}
        message={CONFIRM_CONFIG[confirmPopup.type]?.message}
        confirmLabel={CONFIRM_CONFIG[confirmPopup.type]?.label}
        variant={CONFIRM_CONFIG[confirmPopup.type]?.variant}
        isLoading={confirmPopup.type === 'approve' ? isApprovePending : (isServiceRequest ? isUpdateServicePending : isUpdatePending)}
      />

      {/* Reject popup — reason textarea */}
      <RequestEditPopup
        isOpen={showRejectPopup}
        onClose={() => setShowRejectPopup(false)}
        onSubmit={handleRejectSubmit}
        isLoading={isRejectPending}
      />

      {/* Request Edit popup — reason textarea */}
      <RequestEditPopup
        isOpen={showRequestEditPopup}
        onClose={() => setShowRequestEditPopup(false)}
        onSubmit={handleRequestEditSubmit}
        isLoading={isRequestEditPending}
      />
    </div>
  );
};

export default OrganizationProblemDetails;
