import LeftArrow from '../../../../assets/icons/leftArrow.svg'

const StoryCard = ({ image, title, region, link }) => {
  return (
    <div className="bg-[#FFFCF5] p-4 rounded-2xl overflow-hidden w-full h-full flex flex-col">
      {/* Story Image */}
      <div className="h-[240px] md:h-[308px] rounded-xl overflow-hidden mb-4 flex-shrink-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Card Content */}
      <div className="flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-xl md:text-[22px] 2xl:text-2xl leading-relaxed max-w-[95%] font-bold text-primary mb-2 flex-grow">
          {title}
        </h3>

        {/* Region */}
        {region && (
          <p className="text-sm md:text-base leading-relaxed text-primary mb-5">
            Region: {region}
          </p>
        )}

        {/* Read More Button */}
        <a href={link} target="_blank" rel="noopener noreferrer" className="mt-auto">
          <button className="w-full bg-[#4A4A4A] text-white py-3 px-4 rounded-lg flex items-center justify-between hover:bg-[#333333] cursor-pointer transition-colors">
            <span className="text-sm md:text-base leading-relaxed font-body font-regular">Read the full story</span>
            <img src={LeftArrow} alt="arrow" className="w-4 h-4 md:w-5 md:h-5 rotate-180" />
          </button>
        </a>
      </div>
    </div>
  )
}

export default StoryCard