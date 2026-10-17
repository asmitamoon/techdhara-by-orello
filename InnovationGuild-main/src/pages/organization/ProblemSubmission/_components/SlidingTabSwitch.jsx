const SlidingTabSwitch = ({ tabs, activeTab, onChange }) => {
  const activeIndex = tabs.findIndex(tab => tab.value === activeTab);

  return (
    <div className="flex justify-center mb-6 sm:mb-8 lg:mb-10">
      <div className="bg-header p-1 sm:p-1.5 rounded-full flex w-full max-w-full sm:max-w-[600px] lg:max-w-[800px] relative">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`flex-1 py-2 px-3 sm:py-2.5 sm:px-4 lg:py-3 lg:px-6 rounded-full text-sm sm:text-base lg:text-lg font-medium transition-all duration-300 z-10 ${
              activeTab === tab.value
                ? 'text-white'
                : 'text-muted hover:text-secondary cursor-pointer'
            }`}
          >
            {tab.label}
          </button>
        ))}

        <div
          className="absolute top-1 bottom-1 sm:top-1.5 sm:bottom-1.5 bg-accent-green rounded-full transition-transform duration-300 ease-in-out"
          style={{
            width: `calc(${100 / tabs.length}% - ${tabs.length === 2 ? '4px' : '6px'})`,
            transform: `translateX(${activeIndex * 100}%)`
          }}
        />
      </div>
    </div>
  );
};

export default SlidingTabSwitch;
