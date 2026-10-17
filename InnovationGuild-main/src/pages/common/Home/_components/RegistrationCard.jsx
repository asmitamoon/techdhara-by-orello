const RegistrationCard = ({ title, subtitle, buttonText, bgColor, iconColor, icon, subtitleColor, onClick }) => {
  return (
    <div className={`${bgColor} max-lg:w-full rounded-2xl px-10.5 pb-8 flex flex-col items-center text-center backdrop-blur-sm`}>
      {/* Icon Circle */}
      <div className={`${iconColor} pb-4 w-18 h-24 lg:w-24 lg:h-30 rounded-b-xl flex items-end justify-center mb-5 lg:mb-20`}>
        <img src={icon} alt={title} className="w-10 h-10 lg:w-16 lg:h-16" />
      </div>

      <h3 className="text-lg lg:text-[32px] 2xl:text-[34px] leading-tight font-normal max-w-70 mb-2 lg:mb-3 text-light">
        {title}
      </h3>

      <p className="text-xs lg:text-base 2xl:text-lg leading-relaxed font-normal mb-4" style={{ color: subtitleColor }}>
        {subtitle}
      </p>

      <div className="w-full h-px mb-4 lg:mb-6" style={{ backgroundColor: subtitleColor }}></div>

      <button
        onClick={onClick}
        className="w-full bg-[#F1F1D1] text-xs lg:text-lg 2xl:text-xl leading-relaxed text-[#0A3718] font-medium py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-md cursor-pointer"
      >
        {buttonText}
      </button>
    </div>
  )
}

export default RegistrationCard