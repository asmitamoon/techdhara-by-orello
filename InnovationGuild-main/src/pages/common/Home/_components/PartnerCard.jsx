const PartnerCard = ({ badgeText, description, logoSrc, logoAlt, logoClassName, logoWrapperClassName }) => {
  const badgeColors = {
    'Foundation Partner': 'bg-[#A3733E] text-[#F9F3E4]',
    'Implementation Partner': 'bg-[#DEC27B] text-[#273228]'
  }

  const badgeColorClass = badgeColors[badgeText] || 'bg-gray-600 text-white'

  return (
    <div className="bg-[#FFFCF5] w-full md:max-w-[432px] rounded-2xl p-6 md:p-9 flex flex-col h-full">
      <div className={logoWrapperClassName || "mb-16 md:mb-14"}>
        <img
          src={logoSrc}
          alt={logoAlt}
          className={logoClassName || "h-12 md:h-25 w-auto object-contain"}
        />
      </div>

      <div className={`${badgeColorClass} rounded-full px-4 md:px-5 py-1.5 md:py-2 text-sm md:text-lg 2xl:text-xl leading-relaxed font-body font-normal mb-4 inline-block self-start`}>
        {badgeText}
      </div>

      <p className="text-base md:text-lg 2xl:text-xl leading-relaxed md:leading-[32px] font-body text-[#1E1E1E]">
        {description}
      </p>
    </div>
  )
}

export default PartnerCard