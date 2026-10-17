import { useState, useEffect } from 'react'
import location from '../../assets/icons/location.svg';
import mobileIcon from '../../assets/icons/mobileIcon.svg';
import mailIcon from '../../assets/icons/mailIcon.svg';

const ContactIcons = {
  Close: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  )
};

const ViewContactPopup = ({
  isOpen,
  onClose,
  data = {
    name: 'Name of the Innovator',
    location: 'Ballari, Karnataka, India',
    phone: '00000-00000',
    email: 'ao@gmail.com',
    image: null
  }
}) => {
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (isOpen) setImageError(false)
  }, [isOpen])

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      {/* Container */}
      <div className="bg-white w-full max-w-[650px] rounded-[32px] border-2 border-[#649769] p-6 sm:p-8 relative shadow-xl animate-in fade-in zoom-in-95 duration-200">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <ContactIcons.Close />
        </button>

        {/* Content Wrapper */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mt-2">

          {/* Left: Photo Circle */}
          <div className="flex-shrink-0">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-[#649769] flex items-center justify-center bg-[#D9D9D9] overflow-hidden relative">
              {/* Inner White Circle Ring */}
              <div className="absolute inset-1 rounded-full border-2 border-white pointer-events-none"></div>

              {data.image && !imageError ? (
                <img
                  src={data.image}
                  alt={data.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex items-center justify-center text-[#9CA3AF] z-10">
                  <svg className="w-14 h-14 sm:w-16 sm:h-16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Right: Details (Informational Only) */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left w-full pt-1">

            {/* Name */}
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2B2B2B] mb-3 font-heading">
              {data.name}
            </h2>

            {/* Location */}
            <div className="flex items-center gap-2 mb-4 text-[#2B2B2B]">
              <img src={location} alt="Location" className="w-5 h-5 object-contain" />
              <span className="text-base sm:text-lg font-medium">{data.location}</span>
            </div>

            {/* Contact Details Row */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-x-6 gap-y-3 text-sm sm:text-base text-[#5C5853] w-full">

              {/* Phone */}
              {data.phone && (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <img src={mobileIcon} alt="Phone" className="w-4.5 h-4.5 object-contain opacity-60" />
                  <span className="text-[#7E7E7E]">Mobile Number</span>
                  <span className="text-black font-medium">{data.phone}</span>
                </div>
              )}

              {/* Email */}
              {data.email && (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <img src={mailIcon} alt="Mail" className="w-4.5 h-4.5 object-contain opacity-60" />
                  <span className="text-[#7E7E7E]">Mail</span>
                  <span className="text-black font-medium">{data.email}</span>
                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewContactPopup;
