import { useState } from 'react';
import { Search, Filter, X, RotateCcw } from 'lucide-react';
import FormSelectAdmin from '../../../ui/FormSelectAdmin';

const ProblemFilter = ({
  searchQuery,
  setSearchQuery,
  selectedState,
  setSelectedState,
  selectedDistrict,
  setSelectedDistrict,
  selectedCategory,
  setSelectedCategory,
  selectedOperation,
  setSelectedOperation,
  selectedUnitType,
  setSelectedUnitType,
  selectedOwnership,
  setSelectedOwnership,
  onClearFilters,
  stateOptions = [],
  districtOptions = [],
  categoryOptions = [],
  operationOptions = [],
  unitTypeOptions = [],
  ownershipOptions = [],
  showCategoryFilters = true,
  showStateDistrictFilters = true
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters =
    (showStateDistrictFilters ? (selectedState || selectedDistrict) : false) ||
    selectedCategory ||
    selectedOperation ||
    selectedUnitType ||
    selectedOwnership;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder={`Search ${showCategoryFilters ? 'Innovation' : 'Service'} Requests...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 pr-10 py-2.5 border bg-page border-accent-green-light rounded-xl w-full focus:outline-none font-body text-sm"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-placeholder" />
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-2 shrink-0 ${
            showFilters || hasActiveFilters
              ? 'bg-accent-green-dark border-accent-green-light text-white' 
              : 'bg-white border-accent-green-light text-accent-green-dark hover:bg-accent-green/5'
          }`}
          title="Toggle Filters"
        >
          {showFilters ? <X size={20} /> : <Filter size={20} />}
          <span className="text-sm font-medium hidden sm:inline">Filters</span>
          {hasActiveFilters && !showFilters && (
            <span className="flex h-2 w-2 rounded-full bg-white border border-accent-green-dark"></span>
          )}
        </button>
      </div>

      {/* Expandable Filter Row */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {showCategoryFilters ? (
            <>
              {/* Innovation Request Filters */}
              {showStateDistrictFilters && (
                <>
                  <div className="w-full sm:w-60">
                    <FormSelectAdmin
                      value={stateOptions.find(opt => opt.value === selectedState) || null}
                      onChange={(option) => {
                        setSelectedState(option?.value || '');
                        setSelectedDistrict(''); // Reset district when state changes
                      }}
                      options={stateOptions}
                      placeholder="State"
                      isSearchable={true}
                    />
                  </div>
                  <div className="w-full sm:w-60">
                    <FormSelectAdmin
                      value={districtOptions.find(opt => opt.value === selectedDistrict) || null}
                      onChange={(option) => setSelectedDistrict(option?.value || '')}
                      options={districtOptions}
                      placeholder="District"
                      isSearchable={true}
                      isDisabled={!selectedState}
                    />
                  </div>
                </>
              )}
              <div className="w-full sm:w-60">
                <FormSelectAdmin
                  value={categoryOptions.find(opt => opt.value === selectedCategory) || null}
                  onChange={(option) => setSelectedCategory(option?.value || '')}
                  options={categoryOptions}
                  placeholder="Category"
                  isSearchable={true}
                />
              </div>
              <div className="w-full sm:w-60">
                <FormSelectAdmin
                  value={operationOptions.find(opt => opt.value === selectedOperation) || null}
                  onChange={(option) => setSelectedOperation(option?.value || '')}
                  options={operationOptions}
                  placeholder="Operation"
                  isSearchable={true}
                />
              </div>
            </>
          ) : (
            <>
              {/* Service Request Filters */}
              <div className="w-full sm:w-60">
                <FormSelectAdmin
                  value={unitTypeOptions.find(opt => opt.value === selectedUnitType) || null}
                  onChange={(option) => setSelectedUnitType(option?.value || '')}
                  options={unitTypeOptions}
                  placeholder="Unit Type"
                  isSearchable={true}
                />
              </div>
              <div className="w-full sm:w-60">
                <FormSelectAdmin
                  value={ownershipOptions.find(opt => opt.value === selectedOwnership) || null}
                  onChange={(option) => setSelectedOwnership(option?.value || '')}
                  options={ownershipOptions}
                  placeholder="Ownership"
                  isSearchable={true}
                />
              </div>
            </>
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
      )}
    </div>
  );
};

export default ProblemFilter;