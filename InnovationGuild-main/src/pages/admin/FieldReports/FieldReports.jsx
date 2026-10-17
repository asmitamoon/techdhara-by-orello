import { useState } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router';
import FieldReportDataTable from '../../../components/admin/Tables/FieldReportDataTable/FieldReportDataTable';
import PageLoader from '../../../components/ui/PageLoader';
import {
  useGetAdminVleFieldReports,
  useGetAdminPilotFieldReports,
  useGetAdminPilotById,
} from '../../../hooks/queries/admin';

const LIMIT = 10;

const FieldReports = () => {
  const { vleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const pilotId = searchParams.get('pilotId');
  const [page, setPage] = useState(1);

  const { data: pilotDetailsData } = useGetAdminPilotById(pilotId);
  const pilotDetails = pilotDetailsData?.data?.pilot;
  const innovationName = pilotDetails?.innovationId?.innovationName ?? '';
  const vleName = pilotDetails?.vleId?.fullName ?? '';

  const { data: pilotReportsData, isLoading: isPilotLoading } = useGetAdminPilotFieldReports(
    pilotId, pilotId ? { page, limit: LIMIT } : null
  );
  const { data: vleReportsData, isLoading: isVleLoading } = useGetAdminVleFieldReports(
    vleId, !pilotId ? { page, limit: LIMIT } : null
  );

  const data = pilotId ? pilotReportsData : vleReportsData;
  const isLoading = pilotId ? isPilotLoading : isVleLoading;

  const reports = data?.data?.reports ?? [];
  const totalPages = data?.data?.pagination?.totalPages ?? 1;

  const tableData = reports.map(r => ({
    id: r._id,
    date: new Date(r.reportDate).toLocaleDateString('en-IN'),
    vleId,
  }));

  const paginationProps = {
    currentPage: page,
    totalPages,
    onPageChange: setPage,
    onPrevious: () => setPage(p => Math.max(1, p - 1)),
    onNext: () => setPage(p => Math.min(totalPages, p + 1)),
    canGoPrevious: page > 1,
    canGoNext: page < totalPages,
  };

  const handleBack = () => {
    if (location.state?.returnTab && vleId) {
      const params = new URLSearchParams();
      params.set('tab', location.state.returnTab);
      if (location.state.returnSubTab) {
        params.set('subtab', location.state.returnSubTab);
      }
      navigate(`/admin/vles/${vleId}?${params.toString()}`);
    } else {
      navigate(-1);
    }
  };

  if (isLoading) return <PageLoader />;

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
                Field Reports
              </h1>
            </div>
            <div className="border-t mt-6 border-accent-green-dark"></div>

            {pilotId && (innovationName || vleName) && (
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

          <div className="bg-white rounded-2xl sm:rounded-[28px] lg:rounded-4xl shadow-lg overflow-hidden border border-accent-green-dark">
            <FieldReportDataTable
              data={tableData}
              isLoading={isLoading}
              pagination={paginationProps}
              routePrefix="/admin"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldReports;
