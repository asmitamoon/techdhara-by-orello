import { useGetMyPilotRequests, useGetMyBusinessModels } from '../../../hooks/queries/vle';
import BusinessModelCard from './_components/BusinessModelCard';
import PageLoader from '../../../components/ui/PageLoader';

const BusinessModels = () => {
  const { data, isLoading } = useGetMyPilotRequests();
  const pilots = data?.data?.pilots ?? [];

  const { data: bmData } = useGetMyBusinessModels();
  const submittedPilotIds = new Set(
    (bmData?.data?.businessModels ?? []).map(bm => (bm.pilotId?._id ?? bm.pilotId)?.toString())
  );

  return (
    <div className="bg-light pt-navbar min-h-screen">
      <div className="container pb-4 sm:pb-8">
        <div className="sm:bg-white sm:p-6 lg:p-8 sm:border border-accent-green-dark rounded-3xl sm:rounded-3xl lg:rounded-4xl">

          <div className="flex items-center gap-3 mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl text-primary">
              Business Models
            </h1>
            {!isLoading && (
              <div className="border border-accent-green rounded-full px-2 py-0.5 text-xs md:text-sm font-medium text-accent-green">
                {String(pilots.length).padStart(2, '0')}
              </div>
            )}
          </div>

          {isLoading ? (
            <PageLoader className="py-10" />
          ) : pilots.length === 0 ? (
            <div className="py-10 text-center text-muted">No pilot requests found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {pilots.map((pilot) => (
                <BusinessModelCard
                  key={pilot._id}
                  id={pilot._id}
                  title={pilot.innovationId?.innovationName ?? '—'}
                  organization={
                    (pilot.innovationId?.innovatorId?.enterpriseName &&
                     pilot.innovationId?.innovatorId?.enterpriseName !== 'NA'
                      ? pilot.innovationId?.innovatorId?.enterpriseName
                      : pilot.innovationId?.innovatorId?.fullName) || ''
                  }
                  image={pilot.innovationId?.media?.images?.[0]?.url ?? null}
                  linkState={{
                    innovationId: pilot.innovationId?._id,
                    innovationName: pilot.innovationId?.innovationName,
                  }}
                  submitted={submittedPilotIds.has(pilot._id?.toString())}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessModels;
