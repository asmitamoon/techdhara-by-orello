import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useGetBookkeepingContext, useGetMyBookkeepingEntries } from '../../../hooks/queries/vle';
import BookkeepingDataFilter from '../../../components/admin/Tables/BookkeepingDataTable/BookkeepingDataFilter';
import AdminTablePagination from '../../../components/admin/AdminTablePagination';

const BookkeepingEntries = () => {
  const { id: pilotId } = useParams();
  const navigate = useNavigate();

  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: contextData, isLoading: contextLoading } = useGetBookkeepingContext(pilotId);
  const innovationName = contextData?.data?.innovationName || '';

  const queryParams = {
    pilotId,
    reportingPeriod: selectedPeriod || undefined,
    order: sortBy === 'latest' ? 'desc' : 'asc',
    page: currentPage,
    limit: itemsPerPage,
  };

  const { data, isLoading } = useGetMyBookkeepingEntries(queryParams);

  const entries = data?.data?.entries || [];
  const pagination = data?.data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

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

  const paginationProps = {
    currentPage,
    totalPages,
    onPageChange: setCurrentPage,
    onPrevious: () => setCurrentPage(prev => Math.max(1, prev - 1)),
    onNext: () => setCurrentPage(prev => Math.min(totalPages, prev + 1)),
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < totalPages,
  };

  return (
    <div className="bg-light pt-navbar min-h-screen">
      <div className="container pb-4 sm:pb-8">
        <div className="sm:bg-white sm:p-6 lg:p-8 sm:border border-accent-green-dark rounded-[20px] sm:rounded-[24px] lg:rounded-[32px]">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate('/bookkeeping')}
                className="flex-shrink-0 p-2 hover:bg-light rounded-lg transition-colors group cursor-pointer"
                aria-label="Go back"
              >
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-muted group-hover:text-dark transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl text-primary">Bookkeeping</h1>
                {!contextLoading && innovationName && (
                  <p className="text-sm sm:text-base text-accent-green-dark font-medium mt-0.5">{innovationName}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate(`/bookkeeping/${pilotId}/new`)}
              className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2.5 bg-button-dark text-white text-sm sm:text-base border border-accent-green rounded-xl hover:bg-primary transition-colors font-medium cursor-pointer font-heading"
            >
              + Add Bookkeeping
            </button>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-2xl sm:rounded-[28px] border border-accent-green-dark overflow-hidden mt-6">
            <div className="p-4 border-b border-input-border">
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

            {(isLoading || contextLoading) ? (
              <div className="p-8 text-center text-muted font-body">Loading entries...</div>
            ) : (
              <div className="flex flex-col">
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {entries.length > 0 ? entries.map((entry, idx) => (
                    <Link key={entry._id} to={`/bookkeeping/${pilotId}/${entry._id}`}>
                      <div className="bg-white border border-accent-green-dark rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer h-full">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-xs text-muted font-body">#{(currentPage - 1) * itemsPerPage + idx + 1}</span>
                          <span className="text-xs font-medium text-lime-700 bg-[#DAF7A8] border border-accent-green-dark px-2 py-0.5 rounded-full shrink-0">
                            {entry.reportingPeriod}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-primary font-heading">
                          {entry.periodDate ? entry.periodDate.slice(0, 10) : '—'}
                        </p>
                      </div>
                    </Link>
                  )) : (
                    <div className="col-span-full flex items-center justify-center py-12 text-muted italic font-body">
                      No bookkeeping entries found.
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-input-border flex justify-center">
                  <AdminTablePagination {...paginationProps} />
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookkeepingEntries;
