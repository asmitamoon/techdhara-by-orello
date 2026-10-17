import { useParams, useNavigate, useLocation } from 'react-router';
import FieldReportForm from '../../../components/admin/Forms/FieldReportForm';

// Mock Data
const MOCK_FIELD_REPORT = {
  selectedDate: new Date('2026-01-09'),
  businessModelAdopted: 'custom_billing_rental',
  typeOfTechnology: 'farm_machinery',
  receivedTraining: 'yes_full',
  machinePerformance: 'very_good',
  easeOfOperation: 'easy',
  machineReliability: 'no_breakdowns',
  availabilityOfSpares: 'easily_available',
  easeOfMaintenance: 'easy',
  operationalChallenges: ['fuel_battery', 'transport'],
  downtimeExperience: 'none',
  additionalComments: 'Machine works well overall',
  supportReceived: 'technical',
  supportNeeded: 'business_planning',
  recommendToOthers: 'yes',
  improvementSuggestions: 'Better battery life would be helpful'
};

const FieldReportDetails = () => {
  const { id, vleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNewReport = id === 'new';

  const handleBack = () => {
    // If we have return tab info in location state and vleId, navigate to that tab
    if (location.state?.returnTab && vleId) {
      const params = new URLSearchParams();
      params.set('tab', location.state.returnTab);
      if (location.state.returnSubTab) {
        params.set('subtab', location.state.returnSubTab);
      }
      navigate(`/admin/vles/${vleId}?${params.toString()}`);
    } else {
      // Fallback to browser back
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-page">
      <div>
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
                {isNewReport ? 'Add Field Report' : 'Field Report'}
              </h1>
            </div>
            <div className="border-t mt-6 border-accent-green-dark"></div>

            <div className="mt-8 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl font-medium text-muted">Name of the Innovation:</span>
                <span className="text-xl font-semibold text-accent-green-dark">Multi Crop Weeder</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-medium text-muted">Name of the VLE:</span>
                <span className="text-xl font-semibold text-accent-green-dark">Pattika Ganesh</span>
              </div>
            </div>
          </div>

          <FieldReportForm
            initialData={isNewReport ? {} : MOCK_FIELD_REPORT}
            isEditMode={isNewReport}
          />
        </div>
      </div>
    </div>
  );
};

export default FieldReportDetails;