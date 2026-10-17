import { useState } from 'react'
import FilterSelect from '../../../../components/ui/FilterSelect'
import SearchIcon from '../../../../assets/icons/search.svg'
import { getStateOptions } from '../../../../utils/LocationData/locationData'


const VLEFiltersSection = ({ filters, searchQuery, onFilterChange, onSearchChange, onClearFilters }) => {
  const [showFilters, setShowFilters] = useState(true)

   const stateOptions = getStateOptions()

  const categoryOptions = [
    { value: 'Mechanic', label: 'Mechanic' },
    { value: 'Electrician', label: 'Electrician' },
    { value: 'Plumber', label: 'Plumber' },
    { value: 'Other', label: 'Other' },
  ]

  const genderOptions = [
    { value: '', label: 'All' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ]

  const personaOptions = [
    { value: 'sales', label: 'Sales' },
    { value: 'rental', label: 'Rental' },
    { value: 'servicing', label: 'Servicing' },
    { value: 'fabrication', label: 'Fabrication' },
  ]

  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'commercial', label: 'Commercial' }
  ]

  const mobileButtonStyle = "flex items-center gap-2 px-3 py-1.5 border border-input-border rounded-xl text-primary text-xs sm:text-sm hover:bg-header transition-all cursor-pointer whitespace-nowrap"
  const desktopButtonStyle = "flex items-center gap-2 px-4 py-2 border border-input-border rounded-xl text-primary text-sm lg:text-base bg-[#F4D5CC] transition-all cursor-pointer whitespace-nowrap"

  return (
    <div className="container mb-6 sm:mb-8 lg:mb-9">
      <div className="rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4 p-4 sm:p-5 lg:p-6 border border-input-border bg-white">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 sm:gap-4">
          
          <div className="flex w-full lg:w-auto items-center justify-between lg:justify-start gap-4 sm:gap-6 shrink-0">
            <span className="text-primary text-base sm:text-lg lg:text-xl font-medium">
              Filters
            </span>

            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={onClearFilters}
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
              placeholder="Search VLEs..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-2.5 sm:px-5 sm:py-3 pr-10 sm:pr-12 rounded-xl border border-input-border bg-input-bg text-secondary text-sm sm:text-base placeholder:text-placeholder focus:outline-none"
            />
            <button className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
              <img src={SearchIcon} alt="Search" className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="hidden lg:block flex-grow"></div>

          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={onClearFilters}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="flex flex-col gap-1.5 sm:gap-2">
              <label className="text-secondary text-sm sm:text-base">Background</label>
              <FilterSelect
                value={categoryOptions.find(opt => opt.value === filters.category)}
                onChange={(option) => onFilterChange('category', option?.value || '')}
                options={categoryOptions}
                placeholder="Select Background"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:gap-2">
              <label className="text-secondary text-sm sm:text-base">State</label>
              <FilterSelect
                value={stateOptions.find(opt => opt.value === filters.state)}
                onChange={(option) => onFilterChange('state', option?.value || '')}
                options={stateOptions}
                placeholder="Select State"
                isSearchable={true}
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:gap-2">
              <label className="text-secondary text-sm sm:text-base">Gender</label>
              <FilterSelect
                value={genderOptions.find(opt => opt.value === filters.gender)}
                onChange={(option) => onFilterChange('gender', option?.value || '')}
                options={genderOptions}
                placeholder="All"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:gap-2">
              <label className="text-secondary text-sm sm:text-base">Persona ★</label>
              <FilterSelect
                value={personaOptions.find(opt => opt.value === filters.persona)}
                onChange={(option) => onFilterChange('persona', option?.value || '')}
                options={personaOptions}
                placeholder="Select Persona"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:gap-2">
              <label className="text-secondary text-sm sm:text-base">Status</label>
              <FilterSelect
                value={statusOptions.find(opt => opt.value === filters.status)}
                onChange={(option) => onFilterChange('status', option?.value || '')}
                options={statusOptions}
                placeholder="Select Status"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VLEFiltersSection