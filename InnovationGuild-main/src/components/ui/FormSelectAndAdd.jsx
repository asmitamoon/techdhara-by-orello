import React, { useState, useEffect } from 'react';
import Select, { components } from 'react-select';

// Reusing your custom styles
const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#Fef2eb',
    borderColor: state.isFocused ? '#E29F88' : '#E29F88',
    borderRadius: '0.75rem',
    minHeight: '45.6px',
    padding: '0.25rem 0.5rem',
    fontSize: '1rem',
    color: '#123E39',
    boxShadow:'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '@media (min-width: 640px)': {
      minHeight: '57.6px',
      padding: '0.375rem 0.75rem',
      fontSize: '1rem',
    },
    '@media (min-width: 1024px)': {
      minHeight: '70px',
      padding: '0.5rem 1rem',
      fontSize: '1.125rem',
    },
    '&:hover': {
      borderColor: '#fef2eb'
    }
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0.25rem 0.5rem',
    paddingRight: '90px' // Space for Add button + dropdown indicator
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#fef2eb'
      : state.isFocused
        ? '#fef2eb'
        : '#FFFFFF',
    color: state.isSelected ? '#FFFFFF' : '#123E39',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    padding: '0.625rem 1rem',
    borderRadius: '0.75rem',
    transition: 'all 0.2s',
    '@media (min-width: 640px)': {
      fontSize: '1rem',
    },
    '@media (min-width: 1024px)': {
      fontSize: '1.125rem',
    },
    '&:active': {
      backgroundColor: '#fef2eb'
    }
  }),
  singleValue: (base) => ({
    ...base,
    color: '#123E39',
    margin: '0'
  }),
  placeholder: (base) => ({
    ...base,
    color: '#7E7E7E',
    fontSize: '0.875rem',
    '@media (min-width: 640px)': {
      fontSize: '1rem',
    },
    '@media (min-width: 1024px)': {
      fontSize: '1.125rem',
    }
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.75rem',
    overflow: 'hidden',
    border: '1px solid #8BAD8E',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    marginTop: '0.25rem',
    zIndex: 50
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#e29f88',
    borderRadius: '0.5rem',
    padding: '0.125rem 0.25rem',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#123E39',
    fontSize: '0.875rem',
    padding: '0.25rem',
    '@media (min-width: 640px)': {
      fontSize: '1rem',
    },
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#A54025',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#e29f88',
      color: '#FFFFFF',
    },
  }),
  menuList: (base) => ({
    ...base,
    padding: '0.5rem',
    borderRadius: '0.75rem',
    maxHeight: '200px',
    overflowY: 'auto'
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: '#123E39',
    padding: '0.5rem',
    transition: 'transform 0.2s',
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    '&:hover': {
      color: '#649769'
    }
  }),
  indicatorSeparator: () => ({
    display: 'none'
  })
};

const FormSelectAndAdd = ({
  value,
  onChange,
  options: initialOptions,
  onOptionsChange, // NEW: callback to sync options back to parent
  placeholder = "Select an option",
  isSearchable = true,
  isDisabled = false,
  isMulti = false,
  maxSelections,
  className = ''
}) => {
  // Sync internal options state with props if initialOptions change
  const [options, setOptions] = useState(initialOptions);
  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  const [inputValue, setInputValue] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);

  const handleAddOption = () => {
    if (!inputValue.trim()) return;
    if (maxSelections != null && Array.isArray(value) && value.length >= maxSelections) return;

    // Validate format: only letters, numbers, spaces, and hyphens
    const isValid = /^[a-zA-Z0-9\s-]+$/.test(inputValue.trim());
    if (!isValid) {
      alert('Operation names can only contain letters, numbers, spaces, and hyphens');
      return;
    }

    const normalizedValue = inputValue.trim().toLowerCase().replace(/\s+/g, '_');

    // Check if option already exists
    const exists = options.some(
      opt => opt.value.toLowerCase() === normalizedValue
    );

    if (exists) {
      alert('This option already exists!');
      return;
    }

    const newOption = {
      value: normalizedValue,
      label: inputValue.trim() // Use trimmed input as label
    };

    const updatedOptions = [...options, newOption];

    // 1. Add to options list immediately
    setOptions(updatedOptions);

    // 2. Sync back to parent component (NEW)
    if (onOptionsChange) {
      onOptionsChange(updatedOptions);
    }

    // 3. Add to selection
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      onChange([...currentValues, newOption]);
    } else {
      onChange(newOption);
    }

    // 4. Clear input
    setInputValue('');
  };

  // Custom DropdownIndicator with always-visible Add button
  const DropdownIndicator = (props) => {
    const currentCount = Array.isArray(value) ? value.length : 0;
    const isAtMax = maxSelections != null && currentCount >= maxSelections;
    const isEnabled = inputValue.trim().length > 0 && !isAtMax;

    return (
      <div className="flex items-center gap-1">
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isEnabled) {
                handleAddOption();
              }
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseEnter={() => !isEnabled && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            disabled={!isEnabled}
            className={`px-3 py-1.5 mr-1 text-white text-xs font-medium rounded-md transition-all ${
              isEnabled
                ? 'bg-[#649769] hover:bg-[#4E7A53] cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed opacity-60'
            }`}
            type="button"
          >
            Add
          </button>

          {/* Tooltip */}
          {showTooltip && !isEnabled && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap z-50 shadow-lg">
              {isAtMax ? `Maximum ${maxSelections} selections reached` : 'Type to add new option'}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          )}
        </div>
        <components.DropdownIndicator {...props} />
      </div>
    );
  };

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options} // Using local state options which gets updated
      styles={customSelectStyles}
      isSearchable={isSearchable}
      isDisabled={isDisabled}
      isMulti={isMulti} 
      placeholder={placeholder}
      className={className}
      closeMenuOnSelect={!isMulti}
      isOptionDisabled={() => maxSelections != null && Array.isArray(value) && value.length >= maxSelections}
      inputValue={inputValue}
      onInputChange={(newValue, actionMeta) => {
        // Only update if user is typing
        if (actionMeta.action === 'input-change') {
          setInputValue(newValue);
        }
      }}
      components={{ DropdownIndicator }}
      noOptionsMessage={() => 
        inputValue ? (
          <div className="text-center py-2">
            <button
              onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddOption();
              }}
              onMouseDown={(e) => { // Prevent focus loss
                  e.preventDefault();
                  e.stopPropagation();
              }}
              className="px-4 py-2 bg-[#649769] text-white text-sm font-medium rounded-lg hover:bg-[#4E7A53] transition-colors"
            >
              Add "{inputValue}"
            </button>
          </div>
        ) : (
          "No options"
        )
      }
    />
  );
}

export default FormSelectAndAdd;