import React from 'react';

const Tabs = ({ 
  tabs = [], 
  activeTab, 
  onChange, 
  className = "max-w-xl",
  containerClassName = "mt-6"
}) => {
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
  const tabWidthPercent = 100 / tabs.length;

  // Calculate the left position for the animated indicator
  // This logic accommodates both 2 and 3 tab layouts
  const getIndicatorStyle = () => {
    if (tabs.length === 2) {
      return {
        left: activeIndex === 0 ? '4px' : 'calc(50% + 2px)',
        width: 'calc(50% - 6px)',
      };
    }
    if (tabs.length === 3) {
      return {
        left: activeIndex === 0 
          ? '4px' 
          : activeIndex === 1 
            ? 'calc(33.33% + 1.33px)' 
            : 'calc(66.66% - 1.33px)',
        width: 'calc(33.33% - 2.66px)',
      };
    }
    // Fallback for other counts
    return {
      left: `calc(${activeIndex * tabWidthPercent}% + 2px)`,
      width: `calc(${tabWidthPercent}% - 4px)`,
    };
  };

  return (
    <div className={`relative flex gap-0 mb-6 bg-[#F4D5CC] border border-accent-green-light rounded-full p-1 ${className} ${containerClassName}`}>
      {/* Animated background indicator */}
      <div
        className="absolute top-1 bottom-1 bg-accent-green-dark border border-accent-green-light rounded-full transition-all duration-300 ease-in-out"
        style={getIndicatorStyle()}
      />
      
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 px-4 py-2.5 rounded-full cursor-pointer font-semibold transition-colors duration-300 relative z-10 ${
            activeTab === tab.id
              ? 'text-white'
              : 'text-black '
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
