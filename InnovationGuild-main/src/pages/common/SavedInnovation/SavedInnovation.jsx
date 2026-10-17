import SavedInnovationCard from './_components/SavedInnovationCard';
import { useGetSavedInnovations } from '../../../hooks/queries/common';
import { useUnsaveInnovation } from '../../../hooks/mutations/common';
import PageLoader from '../../../components/ui/PageLoader';

const SavedInnovations = () => {
  const { data, isLoading } = useGetSavedInnovations();
  const unsaveMutation = useUnsaveInnovation();

  const savedInnovations = data?.data?.savedInnovations ?? [];

  return (
    <div className="bg-light pt-navbar min-h-screen">
    <div className="container pb-4 sm:pb-8">

      {/* Main Container with Green Border */}
      <div className="sm:bg-white sm:p-6 lg:p-8 sm:border border-accent-green-dark rounded-[20px] sm:rounded-[24px] lg:rounded-[32px]">

        {/* Header Section */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl text-primary">
            Saved Innovations
          </h1>
          {/* Count Badge */}
          <div className="border border-accent-green rounded-full px-2 py-0.5 text-xs md:text-sm font-medium text-accent-green">
            {String(savedInnovations.length).padStart(2, '0')}
          </div>
        </div>

        {isLoading ? (
          <PageLoader className="py-10 sm:py-12" />
        ) : savedInnovations.length === 0 ? (
          <div className="py-10 text-center text-muted">No saved innovations yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {savedInnovations.map((saved) => {
              const innovation = saved.innovationId;
              const innovationId = innovation?._id ?? innovation;
              return (
                <SavedInnovationCard
                  key={saved._id}
                  id={innovationId}
                  title={innovation?.innovationName ?? ''}
                  organization={[innovation?.innovatorId?.firstName, innovation?.innovatorId?.lastName].filter(Boolean).join(' ') || ''}
                  description={innovation?.description ?? ''}
                  image={innovation?.media?.images?.[0]?.url ?? null}
                  onDelete={() => unsaveMutation.mutate(innovationId)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default SavedInnovations;
