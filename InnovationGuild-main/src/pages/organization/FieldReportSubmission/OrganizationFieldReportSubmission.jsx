import { useState } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router';
import FieldReportForm from '../../../components/admin/Forms/FieldReportForm';
import ConfirmPopup from '../../../components/admin/Popups/ConfirmPopup';
import PageLoader from '../../../components/ui/PageLoader';
import { useGetOrgVlePilotRequests, useGetOrgPilotById } from '../../../hooks/queries/org';
import { useCreateFieldReport } from '../../../hooks/queries/ao';

const OrganizationFieldReportSubmission = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: vleId } = useParams();
  const routePrefix = location.pathname.startsWith('/no') ? '/no' : '/ao';
  const [searchParams] = useSearchParams();

  const preselectedPilotId = searchParams.get('pilotId') ?? '';

  const [selectedPilotId, setSelectedPilotId] = useState(preselectedPilotId);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState({ isOpen: false });

  const { data: pilotData, isLoading: pilotsLoading } = useGetOrgVlePilotRequests(vleId, null);
  const { data: pilotDetailsData } = useGetOrgPilotById(selectedPilotId);
  const { mutate: createMutate, isPending: isCreating } = useCreateFieldReport();

  const trialPilots = (pilotData?.data?.pilots ?? []).filter(p =>
    ['TRIAL_STARTED', 'IMPLEMENTED'].includes(p.status)
  );

  const pilotDetails = pilotDetailsData?.data?.pilot;
  const innovationName = pilotDetails?.innovationId?.innovationName ?? '';
  const vleName = pilotDetails?.vleId?.fullName ?? '';
  const minDate = pilotDetails?.trialStartedAt ? new Date(pilotDetails.trialStartedAt) : undefined;

  const handleFormSubmit = (formData) => {
    if (!selectedPilotId) return;
    setPendingFormData(formData);
    setConfirmPopup({ isOpen: true });
  };

  const handleConfirm = () => {
    const { selectedDate, ...rest } = pendingFormData;
    const reportDate = (selectedDate instanceof Date ? selectedDate : new Date(selectedDate))
      .toISOString()
      .split('T')[0];
    const payload = { reportDate, ...rest };

    createMutate(
      { pilotId: selectedPilotId, data: payload },
      {
        onSuccess: () => {
          toast.success('Field report submitted successfully!');
          queryClient.invalidateQueries({ queryKey: ['orgPilotFieldReports'] });
          queryClient.invalidateQueries({ queryKey: ['orgVleFieldReports'] });
          navigate(`${routePrefix}/vles/${vleId}?tab=field_report`);
        },
        onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed to submit field report'),
      }
    );
    setConfirmPopup({ isOpen: false });
  };

  const handleCancel = () => navigate(-1);

  if (pilotsLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-page">
      <div>
        <div className="flex flex-col gap-8">
          <div className="shrink-0">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <button
                onClick={handleCancel}
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
                Submit Field Report
              </h1>
            </div>
            <div className="border-t mt-6 border-accent-green-dark"></div>

            {!preselectedPilotId && (
              <div className="mt-8 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="form-label">
                    Select Pilot (Trial / Implemented)<span className="text-red-500">*</span>
                  </label>
                  {trialPilots.length === 0 ? (
                    <p className="text-sm text-muted italic">
                      No pilots in Trial Started or Implemented status found for this VLE.
                    </p>
                  ) : (
                    <select
                      value={selectedPilotId}
                      onChange={e => setSelectedPilotId(e.target.value)}
                      className="form-input w-full max-w-md"
                    >
                      <option value="">— Select a pilot —</option>
                      {trialPilots.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.innovationId?.innovationName ?? p._id}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}

            {(innovationName || vleName) && (
              <div className="mt-8 flex flex-col gap-3">
                {innovationName && (
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-medium text-muted">Name of the Innovation:</span>
                    <span className="text-xl font-semibold text-accent-green-dark">{innovationName}</span>
                  </div>
                )}
                {vleName && (
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-medium text-muted">Name of the VLE:</span>
                    <span className="text-xl font-semibold text-accent-green-dark">{vleName}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedPilotId && (
            <FieldReportForm
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              isEditMode={!isCreating}
              minDate={minDate}
            />
          )}
        </div>
      </div>

      <ConfirmPopup
        isOpen={confirmPopup.isOpen}
        onClose={() => setConfirmPopup({ isOpen: false })}
        onConfirm={handleConfirm}
        title="Submit Field Report"
        message="Are you sure you want to submit this field report? Once submitted it cannot be edited."
        confirmLabel="Submit"
        variant="green"
      />
    </div>
  );
};

export default OrganizationFieldReportSubmission;
