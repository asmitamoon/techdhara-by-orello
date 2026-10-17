import { useState } from "react";
import InteractionsStatsCard from "./_components/InteractionsStatsCard";
import ActivityCard from "./_components/ActivityCard";
import Pagination from "../../../components/ui/Pagination";
import graph2 from '../../../assets/icons/graph2.svg';
import { useGetAdminContactViews } from "../../../hooks/queries/admin";

const LIMIT = 20;

const ROLE_DISPLAY = {
  VLE: 'VLE',
  INNOVATOR: 'Innovator',
  AO: 'AO',
  NO: 'NO',
  GENERAL_USER: 'General User',
};

const ProfileVisits = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useGetAdminContactViews({ page: currentPage, limit: LIMIT });

  const views = data?.data?.views ?? [];
  const interactionCount = data?.data?.pagination?.totalItems ?? 0;
  const totalPages = data?.data?.pagination?.totalPages ?? 1;

  const activities = views.map(v => ({
    viewer: v.viewer.fullName,
    viewerId: v.viewer.userId,
    viewerRole: ROLE_DISPLAY[v.viewer.role] ?? v.viewer.role,
    target: v.viewedUser.fullName,
    targetId: v.viewedUser.userId,
    targetRole: ROLE_DISPLAY[v.viewedUser.role] ?? v.viewedUser.role,
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <p className="text-muted font-body">Loading activity...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page">
      <div>
        {/* Header Section */}
        <h1 className="text-6xl font-regular mb-6">
          Engagement & Profile Activity
        </h1>
        <div className="border-t mt-5 sm:mt-6 border-accent-green-dark"></div>

        <div className="flex flex-col gap-6 sm:gap-8 mt-6 sm:mt-8">
          {/* Stats Section */}
          <div className="flex flex-wrap gap-4">
            <InteractionsStatsCard count={interactionCount} />
          </div>

          {/* Activity Section Wrapper */}
          <div className="bg-white rounded-2xl sm:rounded-[28px] lg:rounded-4xl shadow-lg overflow-hidden border border-accent-green-light p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-6">
              <img src={graph2} alt="graph" className="w-6 h-6" />
              <h3 className="text-2xl font-regular text-[#1F3D1A]">
                Recent Profile Activity
              </h3>
            </div>

            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((item, index) => (
                  <ActivityCard key={index} activity={item} />
                ))
              ) : (
                <div className="text-center py-12 text-muted italic font-body">
                  No recent activity found.
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  onPrevious={() => setCurrentPage(p => Math.max(1, p - 1))}
                  onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  canGoPrevious={currentPage > 1}
                  canGoNext={currentPage < totalPages}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileVisits;
