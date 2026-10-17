import { Link } from 'react-router'
import ForwardArrow from '../../../../assets/icons/forwardarrowWhite.svg'

const toSlug = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
import { IoBookmarkOutline, IoBookmark } from 'react-icons/io5'
import shareiconDarksmall from '../../../../assets/icons/shareiconDarksmall.svg'
import profileHumanIconSmall from '../../../../assets/icons/profileHumanIconSmall.svg'
import LocationIconSmall from '../../../../assets/icons/LocationIconSmall.svg'

const InnovationCard = ({
  id,
  title,
  description,
  image,
  company,
  location,
  isSaved = false,
  isSaving = false,
  onSave,
  onShare
}) => {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden p-3 sm:p-3 h-full flex flex-col transition-all hover:shadow-md border border-transparent hover:border-accent-green/30">
      
      {/* Image Container */}
      <div className="relative">
        <img
          src={image}
          alt={title}
          className="w-full h-48 sm:h-60 lg:h-80 object-cover rounded-xl sm:rounded-2xl"
        />
        
        {/* Action Buttons Overlay */}
        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault(); // Prevent unwanted navigation if inside a Link
              onSave && onSave();
            }}
            disabled={isSaving}
            className={`w-8 h-8 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isSaved ? 'bg-accent-green/20 hover:bg-accent-green/30' : 'bg-white/90 hover:bg-white'}`}
            title="Save Innovation"
          >
            {isSaved ? <IoBookmark className="w-4 h-4 text-accent-green" /> : <IoBookmarkOutline className="w-4 h-4 text-primary" />}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault(); 
              onShare && onShare();
            }}
            className="w-8 h-8 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-lg bg-white/90 flex items-center justify-center hover:bg-white transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            title="Share Innovation"
          >
            <img src={shareiconDarksmall} alt="Share" className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-3 sm:pt-3 lg:pt-4 px-1 flex flex-col grow">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-primary mb-1 sm:mb-1.5 lg:mb-2 line-clamp-1" title={title}>
          {title}
        </h3>

        <p className="text-sm sm:text-base text-secondary mb-3 sm:mb-3 lg:mb-4 line-clamp-2" title={description}>
          {description}
        </p>

        <div className='flex flex-col gap-2 mb-3 sm:mb-4 lg:mb-5'>
          <div className="flex items-center gap-2">
            <img src={profileHumanIconSmall} alt="Company" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm lg:text-base text-muted truncate">{company}</span>
          </div>

          <div className="flex items-center gap-2">
            <img src={LocationIconSmall} alt="Location" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm lg:text-base text-accent-brown line-clamp-1">{location}</span>
          </div>
        </div>

        <Link
          to={`/innovations/${id}/${toSlug(title)}`}
          className="w-full py-2.5 sm:py-3 lg:py-3.5 bg-button-dark text-white border border-accent-green rounded-xl text-sm sm:text-base flex items-center justify-between px-4 sm:px-4 lg:px-5 mt-auto hover:bg-accent-gold transition-colors group"
        >
          <span>View Innovation</span>
          <img src={ForwardArrow} alt="Arrow" className="w-4 sm:w-4 lg:w-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  )
}

export default InnovationCard