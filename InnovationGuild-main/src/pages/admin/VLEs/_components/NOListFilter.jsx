import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { useGetAdminNos } from '../../../../hooks/queries/admin';

const NOListFilter = ({ selectedNodalOrg, onSelect }) => {
  const scrollContainerRef = useRef(null);

  const { data, isLoading } = useGetAdminNos({ limit: 100 });
  const nodalOrgs = data?.data?.nodalOrgs || [];

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="my-8 bg-white border border-accent-green-dark rounded-3xl p-4">
      <h2 className="text-lg font-medium text-gray-900 mb-2">NO List</h2>

      {isLoading ? (
        <p className="text-sm text-muted py-2">Loading organizations...</p>
      ) : nodalOrgs.length === 0 ? (
        <p className="text-sm text-muted py-2">No organizations found.</p>
      ) : (
        <div className="flex items-center gap-3">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-[30%] bg-accent-green-dark shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto flex-1 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {nodalOrgs.map((no) => {
              const isActive = selectedNodalOrg === no.userId?.toString();
              return (
                <div
                  key={no.userId}
                  onClick={() => onSelect(isActive ? null : no.userId?.toString())}
                  className={`px-6 py-2 cursor-pointer rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                    ${isActive
                      ? 'bg-accent-green-dark text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {no.orgName}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-[30%] bg-accent-green-dark shrink-0"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default NOListFilter;
