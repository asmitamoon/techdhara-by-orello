import { useParams, useLocation, useNavigate } from 'react-router';
import { useCreateBusinessModel } from '../../../hooks/mutations/vle';
import { useGetMyBusinessModels } from '../../../hooks/queries/vle';
import BusinessModelForm from './_components/BusinessModelForm';
import BusinessModelView from './_components/BusinessModelView';
import PageLoader from '../../../components/ui/PageLoader';

const BusinessModelDetails = () => {
  const { id: pilotId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const innovationName = state?.innovationName ?? 'Innovation';

  const { data: existingData, isLoading: checkLoading } = useGetMyBusinessModels(
    { pilotId },
    { enabled: !!pilotId }
  );

  const businessModelMutation = useCreateBusinessModel();

  const existingModel = existingData?.data?.businessModels?.[0] ?? null;
  const alreadySubmitted = !!existingModel;

  const handleFormSubmit = (formData) => {
    const payload = Object.fromEntries(
      Object.entries(formData).filter(([, v]) => v !== null)
    );
    businessModelMutation.mutate(
      { pilotId, ...payload },
      { onSuccess: () => navigate('/business-models') }
    );
  };

  if (checkLoading) {
    return (
      <div className="min-h-screen bg-light pt-navbar flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light pt-navbar pb-20">
      <div className="container">
        <div className='bg-white border border-accent-green-dark rounded-3xl md:rounded-4xl p-4 md:p-8'>
          <div className='mb-3 sm:mb-10'>
            <h1 className="text-2xl md:text-4xl font-normal text-primary mb-2">
              Business Model
            </h1>
            <p className="text-muted">{innovationName}</p>
          </div>

          {alreadySubmitted ? (
            <BusinessModelView model={existingModel} onBack={() => navigate('/business-models')} />
          ) : (
            <>
              <BusinessModelForm onSubmit={handleFormSubmit} />

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-10 lg:mt-12">
                <button
                  type="submit"
                  form="business-model-form"
                  disabled={businessModelMutation.isPending}
                  className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-button-dark text-white text-base sm:text-lg border border-accent-green rounded-xl hover:bg-primary transition-colors font-medium cursor-pointer font-heading disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {businessModelMutation.isPending ? 'Submitting...' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/business-models')}
                  className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-white text-muted text-base sm:text-lg border border-input-border rounded-xl hover:bg-header transition-colors font-medium cursor-pointer font-heading"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessModelDetails;
