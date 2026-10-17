import { useState, useRef } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router';
import SlidingTabSwitch from './_components/SlidingTabSwitch.jsx'
import InnovationRequestForm from '../../../components/admin/Forms/InnovationRequestForm';
import ServiceRequestForm from '../../../components/admin/Forms/ServiceRequestForm';
import { useCreateOrgProblem, useCreateOrgServiceRequest } from '../../../hooks/queries/org';

const OrganizationProblemSubmission = () => {
  const [activeTab, setActiveTab] = useState('innovation');
  const navigate = useNavigate();
  const location = useLocation();
  const { id: vleId } = useParams();
  const routePrefix = location.pathname.startsWith('/no') ? '/no' : '/ao';
  const formRef = useRef(null);

  const { mutate: createProblem, isPending: isProblemPending } = useCreateOrgProblem();
  const { mutate: createServiceRequest, isPending: isServicePending } = useCreateOrgServiceRequest();

  const tabs = [
    { label: 'Innovation Request', value: 'innovation' },
    { label: 'Service Request', value: 'service' }
  ];

  const handleFormSubmit = (data) => {
    const onSuccess = () => {
      navigate(`${routePrefix}/vles/${vleId}?tab=problems`);
    };
    if (activeTab === 'innovation') {
      createProblem({ ...data, vleId }, { onSuccess });
    } else {
      createServiceRequest({ ...data, vleId }, { onSuccess });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-page">
      <div className="flex flex-col gap-8">
        <div>
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <button
              onClick={handleCancel}
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
              Problem Statement
            </h1>
          </div>
          <div className="border-t mt-6 border-accent-green-dark"></div>
        </div>

        <div className="py-6">
          <SlidingTabSwitch
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'innovation' ? (
              <InnovationRequestForm
                ref={formRef}
                isEditMode={!isProblemPending}
                onSubmit={handleFormSubmit}
              />
            ) : (
              <ServiceRequestForm
                ref={formRef}
                isEditMode={!isServicePending}
                onSubmit={handleFormSubmit}
              />
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
            <button
              type="button"
              onClick={() => formRef.current?.submitForm()}
              disabled={isProblemPending || isServicePending}
              className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-button-dark text-white text-base sm:text-lg border border-accent-green rounded-xl hover:bg-primary transition-colors font-medium cursor-pointer font-heading disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {(isProblemPending || isServicePending) ? 'Submitting...' : 'Submit Problem'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-white text-muted text-base sm:text-lg border border-input-border rounded-xl hover:bg-header transition-colors font-medium cursor-pointer font-heading"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrganizationProblemSubmission;