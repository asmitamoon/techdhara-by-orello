import SavedProfileCard from './_components/SavedProfileCard';
import { useGetSavedProfiles } from '../../../hooks/queries/common';
import { useUnsaveProfile } from '../../../hooks/mutations/common';
import PageLoader from '../../../components/ui/PageLoader';

const SavedProfiles = () => {
  const { data, isLoading } = useGetSavedProfiles();
  const unsaveMutation = useUnsaveProfile();

  const savedProfiles = data?.data?.savedProfiles ?? [];

  return (
    <div className="bg-light pt-navbar min-h-screen">
      <div className="container pb-4 sm:pb-8">

        {/* Main Container with Green Border */}
        <div className="sm:bg-white sm:p-6 lg:p-8 sm:border border-accent-green-dark rounded-[20px] sm:rounded-[24px] lg:rounded-[32px]">

          {/* Header Section */}
          <div className="flex items-center gap-3 mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl text-primary">
              Saved Profiles
            </h1>
            {/* Count Badge */}
            <div className="border border-accent-green rounded-full px-2 py-0.5 text-xs md:text-sm font-medium text-accent-green">
              {String(savedProfiles.length).padStart(2, '0')}
            </div>
          </div>

          {isLoading ? (
            <PageLoader className="py-10 sm:py-12" />
          ) : savedProfiles.length === 0 ? (
            <div className="py-10 text-center text-muted">No saved profiles yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {savedProfiles.map((saved) => {
                const user = saved.savedUserId;
                const userId = user?._id ?? user;
                const name = user?.fullName ?? '';
                const location = user?.location ?? null;
                const languages = user?.languages ?? null;
                return (
                  <SavedProfileCard
                    key={saved._id}
                    id={userId}
                    name={name}
                    tags={[]}
                    image={user?.profilePicture ?? null}
                    location={location}
                    languages={languages}
                    onDelete={() => unsaveMutation.mutate(userId)}
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

export default SavedProfiles;
