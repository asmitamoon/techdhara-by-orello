import { useParams, useNavigate, useLocation } from 'react-router';
import FieldReportForm from '../../../components/admin/Forms/FieldReportForm';
import PageLoader from '../../../components/ui/PageLoader';
import { useGetOrgFieldReportDetails } from '../../../hooks/queries/org';

const OrganizationFieldReportDetails = () => {
  const { id: vleId, reportId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const routePrefix = location.pathname.startsWith('/no') ? '/no' : '/ao';

  const { data, isLoading, error } = useGetOrgFieldReportDetails(reportId);

  const report = data?.data?.report;

  const formData = report
    ? {
        selectedDate: new Date(report.reportDate),
        businessModelAdopted: report.businessModelAdopted ?? '',
        typeOfTechnology: report.typeOfTechnology ?? '',
        receivedTraining: report.receivedTraining ?? '',
        machinePerformance: report.machinePerformance ?? '',
        easeOfOperation: report.easeOfOperation ?? '',
        machineReliability: report.machineReliability ?? '',
        availabilityOfSpares: report.availabilityOfSpares ?? '',
        easeOfMaintenance: report.easeOfMaintenance ?? '',
        operationalChallenges: report.operationalChallenges ?? [],
        downtimeExperience: report.downtimeExperience ?? '',
        additionalComments: report.additionalComments ?? '',
        supportReceived: report.supportReceived ?? '',
        supportNeeded: report.supportNeeded ?? '',
        recommendToOthers: report.recommendToOthers ?? '',
        improvementSuggestions: report.improvementSuggestions ?? '',
      }
    : undefined;

  const innovationName = report?.pilotId?.innovationId?.innovationName ?? '—';
  const vleName = report?.pilotId?.vleId?.fullName ?? '—';

  const handleBack = () => {
    if (location.state?.returnTab && vleId) {
      const params = new URLSearchParams();
      params.set('tab', location.state.returnTab);
      if (location.state.returnSubTab) params.set('subtab', location.state.returnSubTab);
      navigate(`${routePrefix}/vles/${vleId}?${params.toString()}`);
    } else if (vleId) {
      const pilotId = report?.pilotId?._id;
      navigate(`${routePrefix}/vles/${vleId}/field-reports${pilotId ? `?pilotId=${pilotId}` : ''}`);
    } else {
      navigate(-1);
    }
  };

  if (isLoading) return <PageLoader />;

  if (error || !report) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <p className="text-muted">Field report not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page">
      <div>
        <div className="flex flex-col gap-8">
          <div className="shrink-0">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <button
                onClick={handleBack}
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
                Field Report
              </h1>
            </div>
            <div className="border-t mt-6 border-accent-green-dark"></div>

            <div className="mt-8 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl font-medium text-muted">Name of the Innovation:</span>
                <span className="text-xl font-semibold text-accent-green-dark">{innovationName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-medium text-muted">Name of the VLE:</span>
                <span className="text-xl font-semibold text-accent-green-dark">{vleName}</span>
              </div>
            </div>
          </div>

          <FieldReportForm
            initialData={formData}
            isEditMode={false}
          />
        </div>
      </div>
    </div>
  );
};

export default OrganizationFieldReportDetails;
