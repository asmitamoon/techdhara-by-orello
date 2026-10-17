import Select from 'react-select';

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#F4D5CC',
    borderWidth:'1px',
    borderColor:'#E29F88',
    borderRadius: '0.75rem',
    minHeight: '41.6px',
    padding: '0 0.25rem',
    fontSize: '0.875rem',
    color: '#4B5563',
    boxShadow: 'none',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor:'#E29F88' 
    },
    '&:active': {
      borderColor: '#A19882' 
    },
    '@media (min-width: 640px)': {
      minHeight: '49.6px',
      fontSize: '1rem',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0.25rem 0.5rem'
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#F4D5CC'
      : state.isFocused
        ? '#F4D5CC'
        : '#FFFFFF',
    color:'#123E39',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.75rem',
    transition: 'all 0.2s',
    '@media (min-width: 640px)': {
      fontSize: '1rem',
      padding: '0.625rem 1rem',
    },
    '&:active': {
      backgroundColor: '#ECE8DE'
    }
  }),
  singleValue: (base) => ({
    ...base,
    color: '#4B5563',
    margin: '0'
  }),
  placeholder: (base) => ({
    ...base,
    color: '#9CA3AF',
    fontSize: '0.875rem',
    '@media (min-width: 640px)': {
      fontSize: '1rem',
    }
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.75rem',
    overflow: 'hidden',
    border: '1px solid #E29F88',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    marginTop: '0.25rem',
    zIndex: 50
  }),
  menuList: (base) => ({
    ...base,
    padding: '0.25rem',
    borderRadius: '0.75rem'
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: '#4B5563',
    padding: '0.5rem',
    transition: 'transform 0.2s',
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    '&:hover': {
      color: '#123E39'
    }
  }),
  indicatorSeparator: () => ({
    display: 'none'
  })
};

const FilterSelect = ({ value, onChange, options, placeholder = "Select an option", isSearchable = false, isDisabled = false, className = '' }) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      styles={customSelectStyles}
      isSearchable={isSearchable}
      isDisabled={isDisabled}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default FilterSelect;