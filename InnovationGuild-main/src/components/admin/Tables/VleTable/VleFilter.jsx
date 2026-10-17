import React, { useState } from 'react';
import { Search, Filter, X, RotateCcw } from 'lucide-react';
import FormSelectAdmin from '../../../ui/FormSelectAdmin';

const VleFilter = ({ 
  searchQuery, 
  setSearchQuery, 
  selectedState, 
  setSelectedState, 
  selectedDistrict, 
  setSelectedDistrict,
  selectedVillage,
  setSelectedVillage, 
  selectedGender, 
  setSelectedGender, 
  selectedPersona, 
  setSelectedPersona, 
  selectedStatus, 
  setSelectedStatus, 
  onClearFilters,
  stateOptions = [],
  districtOptions = [],
  villageOptions = [],
  genderOptions = [],
  personaOptions = [],
  statusOptions = [],
  // Optional visibility flags to control which filters are shown
  showVillageFilter = true,
  showPersonaFilter = true,
  showStatusFilter = true
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = selectedState || selectedDistrict || selectedVillage || selectedGender || selectedPersona || selectedStatus;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search VLEs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 pr-10 py-2.5 border bg-page border-[#E29F88] rounded-xl w-full focus:outline-none font-body text-sm"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-placeholder" />
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-2 shrink-0 ${
            showFilters || hasActiveFilters
              ? 'bg-accent-green-dark border-[#E29F88] text-white' 
              : 'bg-white border-[#E29F88] text-accent-green-dark hover:bg-accent-green/5'
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
          <div className="w-full sm:w-60">
            <FormSelectAdmin
              value={stateOptions.find(opt => opt.value === selectedState) || null}
              onChange={(option) => {
                setSelectedState(option?.value || '');
                setSelectedDistrict?.(''); 
                setSelectedVillage?.('');
              }}
              options={stateOptions}
              placeholder="State"
              isSearchable={true}
            />
          </div>
          <div className="w-full sm:w-60">
            <FormSelectAdmin
              value={districtOptions.find(opt => opt.value === selectedDistrict) || null}
              onChange={(option) => {
                setSelectedDistrict?.(option?.value || '');
                setSelectedVillage?.('');
              }}
              options={districtOptions}
              placeholder="District"
              isSearchable={true}
              isDisabled={!selectedState}
            />
          </div>
          {showVillageFilter && setSelectedVillage && (
            <div className="w-full sm:w-60">
              <FormSelectAdmin
                value={villageOptions.find(opt => opt.value === selectedVillage) || null}
                onChange={(option) => setSelectedVillage(option?.value || '')}
                options={villageOptions}
                placeholder="Village"
                isSearchable={true}
                isDisabled={!selectedDistrict}
              />
            </div>
          )}
          <div className="w-full sm:w-60">
            <FormSelectAdmin
              value={genderOptions.find(opt => opt.value === selectedGender) || null}
              onChange={(option) => setSelectedGender(option?.value || '')}
              options={genderOptions}
              placeholder="Gender"
            />
          </div>
          {showPersonaFilter && setSelectedPersona && (
            <div className="w-full sm:w-60">
                <FormSelectAdmin
                value={personaOptions.find(opt => opt.value === selectedPersona) || null}
                onChange={(option) => setSelectedPersona(option?.value || '')}
                options={personaOptions}
                placeholder="Persona"
                />
            </div>
          )}
          {showStatusFilter && setSelectedStatus && (
            <div className="w-full sm:w-60">
                <FormSelectAdmin
                value={statusOptions.find(opt => opt.value === selectedStatus) || null}
                onChange={(option) => setSelectedStatus(option?.value || '')}
                options={statusOptions}
                placeholder="Status"
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
      )}
    </div>
  );
};

export default VleFilter;
