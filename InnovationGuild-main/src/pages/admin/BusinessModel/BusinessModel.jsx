import { useState, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import BusinessModelForm from '../../../components/admin/Forms/BusinessModelForm';
import AdminDetailActions from '../../../components/admin/AdminDetailActions';
import ConfirmPopup from '../../../components/admin/Popups/ConfirmPopup';
import RequestEditPopup from '../../../components/admin/Popups/RequestEditPopup';
import PageLoader from '../../../components/ui/PageLoader';
import { useGetAdminBusinessModelByPilot, useUpdateAdminBusinessModel } from '../../../hooks/queries/admin';

const CONFIRM_CONFIG = {
  approve: { title: 'Approve Business Model', message: 'Are you sure you want to approve this business model?', label: 'Approve', variant: 'green' },
  reject:  { title: 'Reject Business Model',  message: 'Are you sure you want to reject this business model?',  label: 'Reject',  variant: 'red' },
  submit:  { title: 'Submit Changes', message: 'Are you sure you want to submit these changes?', label: 'Submit', variant: 'green' },
};

const BusinessModel = () => {
  const { pilotId, vleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const latestFormDataRef = useRef(null);
  const formRef = useRef(null);
  const [confirmPopup, setConfirmPopup] = useState({ isOpen: false, type: null });
  const [showRequestEditPopup, setShowRequestEditPopup] = useState(false);

  const { data: bmData, isLoading } = useGetAdminBusinessModelByPilot(pilotId);
  const { mutate: updateMutate, isPending: isUpdatePending } = useUpdateAdminBusinessModel();

  const businessModel = bmData?.data?.businessModel;
  const pilotStatus = businessModel?.pilotId?.status;
  const isLocked = pilotStatus === 'IMPLEMENTED' || pilotStatus === 'CANCELLED';

  const formData = useMemo(() => {
    if (!businessModel) return null;
    const toStr = v => v != null ? String(v) : '';
    return {
      personaInterest: businessModel.personaInterest || [],
      assessmentReadiness: businessModel.assessmentReadiness || [],
      initialCost: toStr(businessModel.initialCost),
      fieldCapacity: toStr(businessModel.fieldCapacity),
      customHiringCharges: toStr(businessModel.customHiringCharges),
      estimatedRevenue: toStr(businessModel.estimatedRevenue),
      paybackPeriod: toStr(businessModel.paybackPeriod),
      inventoryCosts: toStr(businessModel.inventoryCosts),
      logisticsCosts: toStr(businessModel.logisticsCosts),
      salesTargetYear: toStr(businessModel.salesTargetYear),
      commissionsPlanned: toStr(businessModel.commissionsPlanned),
      estimatedRevenueSales: toStr(businessModel.estimatedRevenueSales),
      servicingInventoryCosts: toStr(businessModel.servicingInventoryCosts),
      servicingLogisticsCosts: toStr(businessModel.servicingLogisticsCosts),
      servicingTargetYear: toStr(businessModel.servicingTargetYear),
      servicingCommissionPlanned: toStr(businessModel.servicingCommissionPlanned),
      machinesPlanned: toStr(businessModel.machinesPlanned),
      costFabrication: toStr(businessModel.costFabrication),
      sellingPrice: toStr(businessModel.sellingPrice),
      estimatedRevenueAssembly: toStr(businessModel.estimatedRevenueAssembly),
    };
  }, [businessModel]);

  const showStickyBar = isEditMode;

  // --- Action handlers ---
  const handleApprove = () => setConfirmPopup({ isOpen: true, type: 'approve' });
  const handleReject = () => setConfirmPopup({ isOpen: true, type: 'reject' });
  const handleRequestEdit = () => setShowRequestEditPopup(true);

  const handleConfirmAction = () => {
    if (confirmPopup.type === 'submit') {
      const data = latestFormDataRef.current;
      updateMutate({ businessModelId: businessModel._id, pilotId, data }, {
        onSuccess: () => {
          setIsEditMode(false);
          setConfirmPopup({ isOpen: false, type: null });
        },
      });
      return;
    }
    // approve/reject: no backend yet, just close
    setConfirmPopup({ isOpen: false, type: null });
  };

  const handleRequestEditSubmit = (reason) => {
    console.log('Request Edit:', reason);
    setShowRequestEditPopup(false);
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

  const handleBack = () => {
    if (location.state?.returnTab && vleId) {
      const params = new URLSearchParams();
      params.set('tab', location.state.returnTab);
      if (location.state.returnSubTab) {
        params.set('subtab', location.state.returnSubTab);
      }
      navigate(`/admin/vles/${vleId}?${params.toString()}`);
    } else {
      navigate(-1);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className={`min-h-screen bg-page ${showStickyBar ? 'pb-28' : ''}`}>
      <div className="flex flex-col gap-8">
        <div className="flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <button
              onClick={handleBack}
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
              Business Model
            </h1>
          </div>
          <div className="border-t mt-6 border-accent-green-dark"></div>
        </div>

        {isLocked && (
          <p className="text-sm text-muted italic px-1">
            This business model is locked because the pilot has been {pilotStatus === 'IMPLEMENTED' ? 'implemented' : 'cancelled'}.
          </p>
        )}

        <BusinessModelForm
          ref={formRef}
          initialData={formData}
          isEditMode={isEditMode && !isLocked}
          onEditToggle={isLocked ? undefined : handleEditToggle}
          onDataChange={handleFormDataChange}
          onSubmit={handleFormSubmit}
        />
      </div>

      <AdminDetailActions
        status={businessModel?.status}
        isEditMode={isEditMode}
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestEdit={handleRequestEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        showOnStatus={(status, isEditMode) => isEditMode}
      />

      {/* Confirmation popup — Approve / Reject / Submit */}
      <ConfirmPopup
        isOpen={confirmPopup.isOpen}
        onClose={() => setConfirmPopup({ isOpen: false, type: null })}
        onConfirm={handleConfirmAction}
        title={CONFIRM_CONFIG[confirmPopup.type]?.title}
        message={CONFIRM_CONFIG[confirmPopup.type]?.message}
        confirmLabel={CONFIRM_CONFIG[confirmPopup.type]?.label}
        variant={CONFIRM_CONFIG[confirmPopup.type]?.variant}
        isLoading={confirmPopup.type === 'submit' ? isUpdatePending : false}
      />

      {/* Request Edit popup — textarea + submit */}
      <RequestEditPopup
        isOpen={showRequestEditPopup}
        onClose={() => setShowRequestEditPopup(false)}
        onSubmit={handleRequestEditSubmit}
      />
    </div>
  );
};

export default BusinessModel;
