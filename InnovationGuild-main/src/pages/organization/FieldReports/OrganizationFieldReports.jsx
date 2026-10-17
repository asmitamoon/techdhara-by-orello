import { useState } from 'react';
import { Link, useParams, useNavigate, useLocation, useSearchParams } from 'react-router';
import FieldReportDataTable from '../../../components/admin/Tables/FieldReportDataTable/FieldReportDataTable';
import PageLoader from '../../../components/ui/PageLoader';
import { useGetOrgVleFieldReports, useGetOrgPilotFieldReports, useGetOrgPilotById } from '../../../hooks/queries/org';

const LIMIT = 10;

const OrganizationFieldReports = () => {
  const { id: vleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const routePrefix = location.pathname.startsWith('/no') ? '/no' : '/ao';

  const pilotId = searchParams.get('pilotId');
  const [page, setPage] = useState(1);

  const { data: pilotDetailsData } = useGetOrgPilotById(pilotId);
  const pilotDetails = pilotDetailsData?.data?.pilot;
  const innovationName = pilotDetails?.innovationId?.innovationName ?? '';
  const vleName = pilotDetails?.vleId?.fullName ?? '';

  const { data: pilotReportsData, isLoading: isPilotLoading } = useGetOrgPilotFieldReports(
    pilotId, pilotId ? { page, limit: LIMIT } : null
  );
  const { data: vleReportsData, isLoading: isVleLoading } = useGetOrgVleFieldReports(
    vleId, !pilotId ? { page, limit: LIMIT } : null
  );

  const data = pilotId ? pilotReportsData : vleReportsData;
  const isLoading = pilotId ? isPilotLoading : isVleLoading;

  const reports = data?.data?.reports ?? [];
  const pagination = data?.data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

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
    if (location.state?.returnTab) {
      navigate(-1);
    } else if (vleId) {
      navigate(`${routePrefix}/vles/${vleId}?tab=field_report`);
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

          <div className="bg-white rounded-2xl sm:rounded-[28px] lg:rounded-[32px] shadow-lg overflow-hidden mt-6 sm:mt-8 border border-accent-green-dark">
            {routePrefix === '/ao' && (
              <div className="p-4 bg-white border-b border-input-border flex justify-end">
                <Link to={`${routePrefix}/vles/${vleId}/field-reports/new${pilotId ? `?pilotId=${pilotId}` : ''}`}>
                  <button className="px-6 py-2 bg-button-green text-white rounded-xl hover:bg-button-green/90 transition-colors font-medium text-sm whitespace-nowrap cursor-pointer">
                    Add Field Report
                  </button>
                </Link>
              </div>
            )}

            <FieldReportDataTable
              data={tableData}
              isLoading={isLoading}
              pagination={paginationProps}
              routePrefix={routePrefix}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationFieldReports;
