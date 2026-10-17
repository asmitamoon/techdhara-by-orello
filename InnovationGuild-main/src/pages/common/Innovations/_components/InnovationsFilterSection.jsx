import { useState, useEffect, useRef } from 'react'
import FilterSelect from '../../../../components/ui/FilterSelect'
import SearchIcon from '../../../../assets/icons/search.svg'

const InnovationsFilterSection = ({
  searchQuery, onSearchChange,
  filters, onFiltersChange,
  subCategoryOptions, operationsOptions, stateOptions,
  noInnovations,
}) => {
  const [showFilters, setShowFilters] = useState(true)
  const [inputValue, setInputValue] = useState(searchQuery)
  const firstRender = useRef(true)

  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    // Skip on mount so returning to the listing (e.g. Back from a detail page)
    // doesn't fire onSearchChange and wipe the ?page= param.
    if (firstRender.current) { firstRender.current = false; return }
    const timer = setTimeout(() => {
      onSearchChange(inputValue)
    }, 400)
    return () => clearTimeout(timer)
  }, [inputValue])

  const handleFilterChange = (filterName, value) => {
    if (onFiltersChange) {
      onFiltersChange({ ...filters, [filterName]: value })
    }
  }

  const handleClearFilters = () => {
    onSearchChange('')
    if (onFiltersChange) {
      onFiltersChange({ subCategory: '', state: '', operatingRequirement: '', sortBy: 'most-relevant' })
    }
  }

  const sortByOptions = [
    { value: 'most-relevant', label: 'Most Relevant' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' }
  ]

  const mobileButtonStyle = "flex items-center gap-2 px-3 py-1.5 border border-input-border rounded-xl text-primary text-xs sm:text-sm bg-header transition-all cursor-pointer whitespace-nowrap"
  const desktopButtonStyle = "flex items-center gap-2 px-4 py-2 border border-input-border rounded-xl text-primary text-sm lg:text-base bg-header transition-all cursor-pointer whitespace-nowrap"

  return (
    <div className="py-5 sm:py-6 lg:py-8">
      <div className="container">
        <div className="rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4 p-4 sm:p-5 lg:p-6 border border-input-border bg-white">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 sm:gap-4">
            
            <div className="flex w-full lg:w-auto items-center justify-between lg:justify-start gap-4 sm:gap-6 shrink-0">
              <span className="text-primary text-base sm:text-lg lg:text-xl font-medium">
                Filters
              </span>

              <div className="flex lg:hidden items-center gap-2">
                <button
                  onClick={handleClearFilters}
                  className={mobileButtonStyle}
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={mobileButtonStyle}
                >
                  {showFilters ? 'Hide' : 'Show'}
                  <svg
                    className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="relative w-full lg:flex-grow">
              <input
                type="text"
                placeholder="Search for innovations..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={noInnovations}
                className="w-full px-4 py-2.5 sm:px-5 sm:py-3 pr-10 sm:pr-12 rounded-xl border border-input-border bg-input-bg text-secondary text-sm sm:text-base placeholder:text-placeholder focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2" disabled={noInnovations}>
                <img src={SearchIcon} alt="Search" className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="hidden lg:block flex-grow"></div>

            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={handleClearFilters}
                className={desktopButtonStyle}
              >
                Clear Filters
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={desktopButtonStyle}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                <svg
                  className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="flex flex-col gap-1.5 sm:gap-2">
                <label className="text-secondary text-sm sm:text-base">Sub Category</label>
                <FilterSelect
                  value={subCategoryOptions.find(opt => opt.value === filters.subCategory) || null}
                  onChange={(option) => handleFilterChange('subCategory', option?.value || '')}
                  options={subCategoryOptions}
                  placeholder={subCategoryOptions.length === 0 ? 'N/A' : 'Select Category'}
                  isDisabled={subCategoryOptions.length === 0}
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:gap-2">
                <label className="text-secondary text-sm sm:text-base">State</label>
                <FilterSelect
                  value={stateOptions.find(opt => opt.value === filters.state) || null}
                  onChange={(option) => handleFilterChange('state', option?.value || '')}
                  options={stateOptions}
                  placeholder={stateOptions.length === 0 ? 'N/A' : 'Select State'}
                  isSearchable={stateOptions.length > 0}
                  isDisabled={stateOptions.length === 0}
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:gap-2">
                <label className="text-secondary text-sm sm:text-base">Operations</label>
                <FilterSelect
                  value={operationsOptions.find(opt => opt.value === filters.operatingRequirement) || null}
                  onChange={(option) => handleFilterChange('operatingRequirement', option?.value || '')}
                  options={operationsOptions}
                  placeholder={operationsOptions.length === 0 ? 'N/A' : 'Select Type'}
                  isDisabled={operationsOptions.length === 0}
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:gap-2">
                <label className="text-secondary text-sm sm:text-base">Sort By</label>
                <FilterSelect
                  value={sortByOptions.find(opt => opt.value === filters.sortBy) || null}
                  onChange={(option) => handleFilterChange('sortBy', option?.value || '')}
                  options={sortByOptions}
                  placeholder={noInnovations ? 'N/A' : 'Most Relevant'}
                  isDisabled={noInnovations}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InnovationsFilterSection