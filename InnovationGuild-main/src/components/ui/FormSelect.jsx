import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#fef2eb',
    borderColor: state.isFocused ? '#A54025' : '#E29F88',
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
      borderColor: '#E29F88'
    }
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0.25rem 0.5rem'
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#E29F88'
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
    border: '1px solid #E29F88',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    marginTop: '0.25rem',
    zIndex: 50
  }),
   multiValue: (base) => ({
    ...base,
    backgroundColor: '#E29F88',
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
    padding: '0.25rem',
    borderRadius: '0.75rem'
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: '#E29F88',
    padding: '0.5rem',
    transition: 'transform 0.2s',
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    '&:hover': {
      color: '#E29F88'
    }
  }),
  indicatorSeparator: () => ({
    display: 'none'
  })
};

const FormSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select an option",
  isSearchable = false, 
  isDisabled = false,
  isMulti = false, 
  isCreatable = false,
  className = '' 
}) => {
  const SelectComponent = isCreatable ? CreatableSelect : Select;

  return (
    <SelectComponent
      value={value}
      onChange={onChange}
      options={options}
      styles={customSelectStyles}
      isSearchable={isSearchable}
      isDisabled={isDisabled}
      isMulti={isMulti} 
      placeholder={placeholder}
      className={className}
    />
  );
}

export default FormSelect;