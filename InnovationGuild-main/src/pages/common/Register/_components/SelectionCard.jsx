const SelectionCard = ({ title, description, icon, cardBg, iconBg, titleColor, borderColor, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full sm:w-[290px] lg:w-[320px] h-auto sm:h-[370px] lg:h-[410px] rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-transform hover:scale-105 focus:outline-none${borderColor ? ' border-2' : ''}`}
      style={{ backgroundColor: cardBg, ...(borderColor ? { borderColor } : {}) }}
    >
      <div className="p-2.5 sm:p-3 lg:p-3.5 rounded-xl sm:rounded-2xl mb-4 sm:mb-5 lg:mb-6" style={{ backgroundColor: iconBg }}>
        <img src={icon} alt="" aria-hidden="true" className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9" />
      </div>
      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 leading-tight" style={{ color: titleColor }}>
        {title}
      </h3>
      <p className="text-sm sm:text-base lg:text-lg leading-snug" style={{ color: '#69655C' }}>
        {description}
      </p>
    </button>
  );
};

export default SelectionCard;
