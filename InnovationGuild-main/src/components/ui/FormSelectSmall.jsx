import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#F9F8F5',
    borderColor: state.isFocused ? '#649769' : '#8BAD8E',
    borderRadius: '0.75rem',
    minHeight: '38px',
    padding: '0 0.25rem',
    fontSize: '0.875rem',
    color: '#123E39',
    boxShadow:'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: '#649769'
    }
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0.125rem 0.5rem'
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#649769'
      : state.isFocused
        ? '#D9EAD3'
        : '#FFFFFF',
    color: state.isSelected ? '#FFFFFF' : '#123E39',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    borderRadius: '0.75rem',
    transition: 'all 0.2s',
    '&:active': {
      backgroundColor: '#649769'
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
    fontSize: '0.875rem'
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
    backgroundColor: '#D9EAD3',
    borderRadius: '0.5rem',
    padding: '0.0625rem 0.125rem',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#123E39',
    fontSize: '0.75rem',
    padding: '0.125rem',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#123E39',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#649769',
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
    color: '#123E39',
    padding: '0.25rem',
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

const FormSelectSmall = ({ 
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

export default FormSelectSmall;
