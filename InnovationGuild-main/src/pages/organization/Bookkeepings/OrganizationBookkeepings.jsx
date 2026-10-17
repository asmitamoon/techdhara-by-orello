import { useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';

// Components
import BookkeepingDataTable from '../../../components/admin/Tables/BookkeepingDataTable/BookkeepingDataTable';
import BookkeepingDataFilter from '../../../components/admin/Tables/BookkeepingDataTable/BookkeepingDataFilter';

// Hooks
import { useGetOrgVleBookkeepings, useGetOrgVleDetails } from '../../../hooks/queries/org';

const OrganizationBookkeepings = () => {
  const { id: vleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const routePrefix = location.pathname.startsWith('/no') ? '/no' : '/ao';
  const pilotId = searchParams.get('pilotId') || undefined;

  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const queryParams = {
    pilotId,
    reportingPeriod: selectedPeriod || undefined,
    order: sortBy === 'latest' ? 'desc' : 'asc',
    page: currentPage,
    limit: itemsPerPage,
  };

  const { data, isLoading } = useGetOrgVleBookkeepings(vleId, queryParams);
  const { data: vleData } = useGetOrgVleDetails(vleId);

  const entries = data?.data?.entries || [];
  const pagination = data?.data?.pagination;
  const vleName = vleData?.data?.user?.fullName ?? '—';
  const innovationName = entries[0]?.pilotId?.innovationId?.innovationName ?? '—';

  const tableData = entries.map((e) => ({
    id: e._id,
    date: e.periodDate ? e.periodDate.slice(0, 10) : '—',
    period: e.reportingPeriod,
  }));

  const totalPages = pagination?.totalPages ?? 1;

  const paginationProps = {
    currentPage,
    totalPages,
    onPageChange: setCurrentPage,
    onPrevious: () => setCurrentPage(prev => Math.max(1, prev - 1)),
    onNext: () => setCurrentPage(prev => Math.min(totalPages, prev + 1)),
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < totalPages,
  };

  const periodOptions = [
    { value: null, label: 'All Periods' },
    { value: 'Daily', label: 'Daily' },
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Yearly', label: 'Yearly' },
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest First' },
    { value: 'oldest', label: 'Oldest First' },
  ];

  const handleClearFilters = () => {
    setSelectedPeriod(null);
    setSortBy('latest');
    setCurrentPage(1);
  };

  const handleBack = () => {
    const returnTab = location.state?.returnTab || 'bookkeeping';
    navigate(`${routePrefix}/vles/${vleId}?tab=${returnTab}`);
  };

  return (
    <div className="min-h-screen bg-page">
      <div>
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
            Bookkeepings
          </h1>
        </div>
        <div className="border-t mt-6 border-accent-green-dark"></div>

        <div className="mt-8 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-medium text-muted">Name of the Innovation:</span>
            <span className="text-xl font-semibold text-accent-green-dark">{innovationName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-medium text-muted">Name of the VLE:</span>
            <span className="text-xl font-semibold text-accent-green-dark">{vleName}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-[28px] lg:rounded-[32px] shadow-lg overflow-hidden mt-8 border border-accent-green-dark">
          <div className="p-4 bg-white border-b border-input-border">
            <BookkeepingDataFilter
              selectedPeriod={selectedPeriod}
              setSelectedPeriod={(val) => { setSelectedPeriod(val); setCurrentPage(1); }}
              sortBy={sortBy}
              setSortBy={(val) => { setSortBy(val); setCurrentPage(1); }}
              onClearFilters={handleClearFilters}
              periodOptions={periodOptions}
              sortOptions={sortOptions}
              showSearch={false}
              showSort={true}
            />
          </div>

          <BookkeepingDataTable
            data={tableData}
            isLoading={isLoading}
            pagination={paginationProps}
            routePrefix={routePrefix}
            vleId={vleId}
          />
        </div>
      </div>
    </div>
  );
};

export default OrganizationBookkeepings;
