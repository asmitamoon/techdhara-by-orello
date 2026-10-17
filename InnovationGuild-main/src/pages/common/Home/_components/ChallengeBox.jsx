const ChallengeBox = ({ label, icon }) => {
  return (
    <div className="flex flex-col items-center gap-3 md:gap-4">
      <img 
        src={icon} 
        alt="" 
        className="w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 2xl:w-30 2xl:h-30 object-contain" 
      />
      
      <p className="text-lg sm:text-xl md:text-3xl 2xl:text-4xl leading-normal font-body text-primary text-center max-w-[200px] md:max-w-[300px]">
        {label}
      </p>
    </div>
  )
}

export default ChallengeBox