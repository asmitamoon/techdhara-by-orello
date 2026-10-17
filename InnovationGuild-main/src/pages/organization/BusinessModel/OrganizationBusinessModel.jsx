import { useState, useRef, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import BusinessModelForm from '../../../components/admin/Forms/BusinessModelForm';
import ConfirmPopup from '../../../components/admin/Popups/ConfirmPopup';
import PageLoader from '../../../components/ui/PageLoader';
import {
  useGetOrgBusinessModelByPilot,
  useCreateOrgBusinessModel,
  useUpdateOrgBusinessModel,
} from '../../../hooks/queries/org';

const OrganizationBusinessModel = () => {
  const { pilotId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const latestFormDataRef = useRef(null);
  const [confirmPopup, setConfirmPopup] = useState({ isOpen: false });

  const { data: bmData, isLoading, error: bmError } = useGetOrgBusinessModelByPilot(pilotId);
  const isNotFound = bmError?.response?.status === 404;
  const { mutate: createMutate, isPending: isCreatePending } = useCreateOrgBusinessModel();
  const { mutate: updateMutate, isPending: isUpdatePending } = useUpdateOrgBusinessModel();

  const pilotStatus = bmData?.data?.businessModel?.pilotId?.status;
  const isLocked = pilotStatus === 'IMPLEMENTED' || pilotStatus === 'CANCELLED';

  // Auto-open edit mode when no BM exists yet
  useEffect(() => {
    if (isNotFound) setIsEditMode(true);
  }, [isNotFound]);

  const formData = useMemo(() => {
    if (!bmData?.data?.businessModel) return null;
    const bm = bmData.data.businessModel;
    const toStr = v => v != null ? String(v) : '';
    return {
      personaInterest: bm.personaInterest || [],
      assessmentReadiness: bm.assessmentReadiness || [],
      initialCost: toStr(bm.initialCost),
      fieldCapacity: toStr(bm.fieldCapacity),
      customHiringCharges: toStr(bm.customHiringCharges),
      estimatedRevenue: toStr(bm.estimatedRevenue),
      paybackPeriod: toStr(bm.paybackPeriod),
      inventoryCosts: toStr(bm.inventoryCosts),
      logisticsCosts: toStr(bm.logisticsCosts),
      salesTargetYear: toStr(bm.salesTargetYear),
      commissionsPlanned: toStr(bm.commissionsPlanned),
      estimatedRevenueSales: toStr(bm.estimatedRevenueSales),
      servicingInventoryCosts: toStr(bm.servicingInventoryCosts),
      servicingLogisticsCosts: toStr(bm.servicingLogisticsCosts),
      servicingTargetYear: toStr(bm.servicingTargetYear),
      servicingCommissionPlanned: toStr(bm.servicingCommissionPlanned),
      machinesPlanned: toStr(bm.machinesPlanned),
      costFabrication: toStr(bm.costFabrication),
      sellingPrice: toStr(bm.sellingPrice),
      estimatedRevenueAssembly: toStr(bm.estimatedRevenueAssembly),
    };
  }, [bmData]);

  const handleEditToggle = () => setIsEditMode(true);

  const handleFormDataChange = (currentFormData) => {
    latestFormDataRef.current = currentFormData;
  };

  const handleFormSubmit = (validatedData) => {
    latestFormDataRef.current = validatedData;
    setConfirmPopup({ isOpen: true });
  };

  const handleConfirmAction = () => {
    const data = latestFormDataRef.current;
    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: ['orgBusinessModel', pilotId] });
      queryClient.invalidateQueries({ queryKey: ['orgPilots'] });
      setIsEditMode(false);
      setConfirmPopup({ isOpen: false });
    };
    if (!bmData?.data?.businessModel) {
      createMutate({ pilotId, data }, { onSuccess });
    } else {
      updateMutate({ pilotId, data }, { onSuccess });
    }
  };

  const handleCancel = () => setIsEditMode(false);

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-page">
      <div className="flex flex-col gap-8">
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
          initialData={formData}
          isEditMode={isEditMode && !isLocked}
          onEditToggle={isLocked ? undefined : handleEditToggle}
          onDataChange={handleFormDataChange}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      </div>

      <ConfirmPopup
        isOpen={confirmPopup.isOpen}
        onClose={() => setConfirmPopup({ isOpen: false })}
        onConfirm={handleConfirmAction}
        title="Submit Changes"
        message="Are you sure you want to submit these changes?"
        confirmLabel="Submit"
        variant="green"
        isLoading={isCreatePending || isUpdatePending}
      />
    </div>
  );
};

export default OrganizationBusinessModel;
