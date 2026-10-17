import React, { useState } from 'react';
import { Search, Filter, X, RotateCcw } from 'lucide-react';
import FormSelectAdmin from '../../../ui/FormSelectAdmin';

const InnovationFilter = ({ 
  searchQuery, 
  setSearchQuery, 
  selectedState,
  setSelectedState,
  selectedCategory, 
  setSelectedCategory, 
  selectedSubCategory,
  setSelectedSubCategory,
  onClearFilters,
  stateOptions = [],
  categoryOptions = [],
  subCategoryOptions = [],
  placeholder = "Search Innovations..."
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = selectedState || selectedCategory || selectedSubCategory;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder={placeholder}
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
          <div className="w-full sm:w-60">
            <FormSelectAdmin
              value={stateOptions.find(opt => opt.value === selectedState) || null}
              onChange={(option) => setSelectedState(option?.value || '')}
              options={stateOptions}
              placeholder="Location (State)"
              isSearchable={true}
            />
          </div>
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
              value={subCategoryOptions.find(opt => opt.value === selectedSubCategory) || null}
              onChange={(option) => setSelectedSubCategory(option?.value || '')}
              options={subCategoryOptions}
              placeholder="Sub Category"
              isSearchable={true}
            />
          </div>

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

export default InnovationFilter;
