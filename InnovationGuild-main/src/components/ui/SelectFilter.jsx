import Select from 'react-select';

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#ECE8DE',
    borderColor: state.isFocused ? '#649769' : '#A19882',
    borderRadius: '0.75rem',
    minHeight: '38px',
    padding: '0 0.25rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#123E39',
    boxShadow: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: '#649769'
    }
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0.25rem 0.75rem'
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
    padding: '0.625rem 1rem',
    borderRadius: '0.75rem',
    transition: 'all 0.2s',
    '&:active': {
      backgroundColor: '#649769'
    }
  }),
  singleValue: (base) => ({
    ...base,
    color: '#123E39',
    fontWeight: '500',
    margin: '0'
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.75rem',
    overflow: 'hidden',
    border: '1px solid #A19882',
    marginTop: '0.25rem'
  }),
  menuList: (base) => ({
    ...base,
    padding: '0.25rem',
    borderRadius: '0.75rem'
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

const SelectFilter = ({ value, onChange, options, className = '' }) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      styles={customSelectStyles}
      isSearchable={false}
      className={className}
    />
  );
};

export default SelectFilter;
