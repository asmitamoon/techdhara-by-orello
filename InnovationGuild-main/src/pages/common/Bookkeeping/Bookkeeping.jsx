import BookkeepingCard from './_components/BookkeepingCard';
import { useGetMyPilotRequests } from '../../../hooks/queries/vle';

const Bookkeeping = () => {
  const { data, isLoading } = useGetMyPilotRequests({ status: 'IMPLEMENTED' });
  const pilots = data?.data?.pilots || [];

  return (
    <div className="bg-light pt-navbar min-h-screen">
    <div className="container pb-4 sm:pb-8">

      {/* Main Container with Green Border */}
      <div className="sm:bg-white sm:p-6 lg:p-8 sm:border border-accent-green-dark rounded-[20px] sm:rounded-[24px] lg:rounded-[32px]">

        {/* Header Section */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl text-primary">
            Bookkeeping
          </h1>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted">Loading pilots...</div>
        ) : pilots.length === 0 ? (
          <div className="text-center py-12 text-muted">No implemented pilots found.</div>
        ) : (
          /* Grid Layout: 1 col on mobile, 2 on tablet, 3 on large screens */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {pilots.map((p) => (
              <BookkeepingCard
                key={p._id}
                id={p._id}
                title={p.innovationId?.innovationName}
                organization={
                  (p.innovationId?.innovatorId?.enterpriseName &&
                   p.innovationId?.innovatorId?.enterpriseName !== 'NA'
                    ? p.innovationId?.innovatorId?.enterpriseName
                    : p.innovationId?.innovatorId?.fullName) || ''
                }
                description={p.innovationId?.description ?? ''}
                image={p.innovationId?.media?.images?.[0]?.url ?? null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default Bookkeeping;
