const MetricCard = ({ number, label, icon }) => {
  return (
    <div className="flex flex-col items-start text-left gap-2 md:gap-4">
      {/* Icon */}
      <div className='h-[50px] md:h-[45px]'>
        <img
          src={icon}
          alt={label}
          className="object-contain h-12 w-12"
        />
      </div>

      
      {/* Scaled down from 8.3xl on mobile/tablet to avoid overflow */}
      <h3 className="text-8xl sm:text-9xl lg:text-[83px] 2xl:text-[93px] leading-none font-medium text-[#697467] mb-1 md:mb-2">
        {number}
      </h3>

      {/* Label */}
      <p className="text-lg md:text-2xl 2xl:text-2xl leading-normal text-primary w-full max-w-[280px] md:max-w-[380px] pb-2 border-b-[2px] border-[#A3733E]">
        {label}
      </p>
    </div>
  )
}

export default MetricCard