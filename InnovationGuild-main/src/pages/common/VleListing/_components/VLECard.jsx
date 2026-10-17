import { Link } from 'react-router'
import { IoBookmarkOutline, IoBookmark } from 'react-icons/io5'
import LocationIcon from '../../../../assets/icons/location.svg'
import shareiconDarksmall from '../../../../assets/icons/shareiconDarksmall.svg'
import callIconSmall from '../../../../assets/icons/callIconSmall.svg'
import viewProfileIcon from '../../../../assets/icons/viewProfileIcon.svg'

const VLECard = ({ vle, isSaved = false, isSaving = false, onSave, onShare, onViewContact }) => {
  
  // Handle Share Icon Click
  const handleShareClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onShare) onShare()
  }

  // Handle Contact Button Click
  const handleContactClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onViewContact) onViewContact()
  }

  const handleBookmark = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onSave) onSave()
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-input-border overflow-hidden relative h-full flex flex-col transition-all hover:border-accent-green/50">
      <div className="bg-gradient-to-r from-[#E4E9E2] to-[#F4EADF] h-16 sm:h-20 lg:h-22 relative">
        <div className="absolute z-20 top-2.5 right-2.5 sm:top-3 sm:right-3 lg:top-4 lg:right-4 flex items-center gap-2">
          
          {/* SHARE BUTTON: Triggers handleShareClick -> onShare */}
          <button
            onClick={handleShareClick}
            className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Share Profile"
          >
            <img src={shareiconDarksmall} alt="Share" className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
          </button>

          <button
            onClick={handleBookmark}
            disabled={isSaving}
            className={`w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full shadow-md flex items-center justify-center hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isSaved ? 'bg-accent-green/20' : 'bg-white'}`}
            title="Save Profile"
          >
            {isSaved ? <IoBookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-accent-green" /> : <IoBookmarkOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-primary" />}
          </button>
        </div>
      </div>

      <div className="px-4 pb-4 sm:px-5 sm:pb-5 lg:px-6 lg:pb-6 relative flex flex-col flex-grow">
        <div className="-mt-12 sm:-mt-14 lg:-mt-18 mb-3 sm:mb-3 lg:mb-4 relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-25 lg:h-25 rounded-full bg-[#C4A574] overflow-hidden border-4 border-white shadow-lg">
            {vle.profileImage ? (
              <img
                src={vle.profileImage}
                alt={vle.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl font-bold text-white select-none">
                {vle.name?.charAt(0) ?? '?'}
              </div>
            )}
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl leading-tight font-semibold text-[#123E39] mb-2.5 sm:mb-3 lg:mb-4">
          {vle.name}
        </h3>

        <div className="flex flex-col gap-2 sm:gap-2.5 lg:gap-4 mb-3 sm:mb-3 lg:mb-4">
          <div className="flex items-center gap-2">
            <img src={LocationIcon} alt="Location" className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 opacity-70 shrink-0" />
            <span className="text-sm sm:text-base lg:text-lg xl:text-xl text-accent-brown line-clamp-1">{vle.location}</span>
          </div>

          {vle.languages && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-accent-brown shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
              </svg>
              <span className="text-sm sm:text-base lg:text-lg xl:text-xl text-accent-brown line-clamp-1">{vle.languages}</span>
            </div>
          )}
        </div>

        <p className="text-sm sm:text-base lg:text-lg text-heading mb-3 sm:mb-4 lg:mb-6 line-clamp-2">
          {vle.description}
        </p>

        <div className="flex flex-col flex-wrap sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 mt-auto">
          {/* CONTACT BUTTON: Triggers handleContactClick -> onViewContact */}
          <button
            onClick={handleContactClick}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 sm:px-3 sm:py-2.5 lg:px-4 lg:py-4 border-2 border-[#D1D5DC] text-[#364153] rounded-xl hover:bg-header transition-colors cursor-pointer"
          >
            <img src={callIconSmall} alt="Call" className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            <span className="text-sm sm:text-base lg:text-lg xl:text-xl leading-none font-medium whitespace-nowrap">Contact Details</span>
          </button>

          <Link to={`/profile/${vle.id}`} className="flex-1 px-3 py-2.5 sm:px-3 sm:py-2.5 lg:px-4 lg:py-4 bg-button-dark border-2 border-transparent text-white rounded-xl flex items-center justify-center gap-2 hover:bg-accent-gold transition-all">
            <img src={viewProfileIcon} alt="View Profile" className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            <span className="text-sm sm:text-base lg:text-lg xl:text-xl text-nowrap leading-none font-medium">View Profile</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default VLECard