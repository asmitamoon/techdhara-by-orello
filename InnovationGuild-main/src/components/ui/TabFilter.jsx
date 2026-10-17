const TabFilter = ({ options, activeTab, onChange, className = '' }) => {
  return (
    <div className={`hidden sm:inline-flex bg-header rounded-full p-1 border border-input-border ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-1.5 sm:px-5 lg:px-6 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
            activeTab === option.value
              ? 'bg-accent-green text-white shadow-sm'
              : 'text-muted hover:text-secondary'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default TabFilter;
