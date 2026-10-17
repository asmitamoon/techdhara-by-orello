import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import FormSelectAdmin from '../../../ui/FormSelectAdmin';

const BookkeepingFilter = ({
  searchQuery,
  setSearchQuery,
  selectedPeriod,
  setSelectedPeriod,
  selectedState,
  setSelectedState,
  sortBy,
  setSortBy,
  onClearFilters,
  periodOptions = [],
  stateOptions = [],
  sortOptions = [],
  showSearch = true,
  showStateFilter = false,
  showSort = false
}) => {
  const hasActiveFilters = 
    (showSearch && searchQuery) || 
    selectedPeriod !== null || 
    (showStateFilter && selectedState) || 
    (showSort && sortBy !== 'latest');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {/* Search */}
        {showSearch && (
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search Bookkeeping..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-10 py-2.5 border bg-page border-accent-green-dark rounded-xl w-full focus:outline-none font-body text-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-placeholder" />
          </div>
        )}

        <div className="w-full sm:w-60">
          <FormSelectAdmin
            value={periodOptions.find(opt => opt.value === selectedPeriod) || null}
            onChange={(option) => setSelectedPeriod(option?.value ?? null)}
            options={periodOptions}
            placeholder="Period"
          />
        </div>
        
        {showStateFilter && (
          <div className="w-full sm:w-60">
            <FormSelectAdmin
              value={stateOptions.find(opt => opt.value === selectedState) || null}
              onChange={(option) => setSelectedState(option?.value || '')}
              options={stateOptions}
              placeholder="State"
              isSearchable={true}
            />
          </div>
        )}

        {showSort && (
          <div className="w-full sm:w-60">
            <FormSelectAdmin
              value={sortOptions.find(opt => opt.value === sortBy) || null}
              onChange={(option) => setSortBy(option?.value ?? 'latest')}
              options={sortOptions}
              placeholder="Sort by"
            />
          </div>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ml-auto sm:ml-0"
          >
            <RotateCcw size={16} />
            Clear All
          </button>
        )}
      </div>
    </div>
  );
};

export default BookkeepingFilter;
