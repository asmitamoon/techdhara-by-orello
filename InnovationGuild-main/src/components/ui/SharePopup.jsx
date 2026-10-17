import { useState } from 'react';
import SharePopupFacebook from '../../assets/icons/SharePopupFacebook.svg';
import SharePopupX from '../../assets/icons/SharePopupX.svg';
import SharePopupWhatsapp from '../../assets/icons/SharePopupWhatsapp.svg';
import SharePopupTelegram from '../../assets/icons/SharePopupTelegram.svg';
import SharePopupLinkedin from '../../assets/icons/SharePopupLinkedin.svg';
import SharePopupCopy from '../../assets/icons/SharePopupCopy.svg';
import SharePopupShare from '../../assets/icons/SharePopupShare.svg';

const SharePopup = ({ isOpen, onClose, url }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = url || window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent("Check this out on Tech Dhaara!");
    let targetLink = "";

    switch (platform) {
      case 'facebook':
        targetLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'x':
        targetLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'whatsapp':
        targetLink = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'telegram':
        targetLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'linkedin':
        targetLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      default:
        return;
    }
    window.open(targetLink, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[500px] rounded-[32px] border-2 border-[#649769] p-6 sm:p-8 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="flex flex-col items-center">
          {/* Main Icon */}
          <div className="w-16 h-16 sm:w-25 sm:h-25 mb-4">
            <img src={SharePopupShare} alt="Share" className="h-full w-full" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A2E28] mb-6 sm:mb-8 font-heading">Share</h2>

          <div className="w-full space-y-6">
            
            {/* Link Input Section */}
            <div>
              <label className="block text-base sm:text-lg font-semibold text-[#1A2E28] mb-3">Share the link</label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={shareUrl} 
                  readOnly 
                  className="w-full bg-[#F9F8F5] border border-[#A19882] rounded-xl py-3 px-4 text-gray-600 outline-none focus:border-[#649769] transition-colors pr-12 font-body text-sm sm:text-base"
                />
                <button 
                  onClick={handleCopy}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                  title="Copy to clipboard"
                >
                  <img src={SharePopupCopy} alt="Copy" className="w-5 h-5" />
                </button>
                {copied && (
                  <span className="absolute -top-8 right-0 text-xs bg-black text-white px-2 py-1 rounded shadow-lg">Copied!</span>
                )}
              </div>
            </div>

            {/* Social Buttons Section */}
            <div>
              <label className="block text-base sm:text-lg font-semibold text-[#1A2E28] mb-4">Share to</label>
              
              {/* Single Row - Responsive Sizes */}
              <div className="flex justify-between items-center w-full">
                
                <button 
                  onClick={() => handleShare('facebook')}
                  className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <img src={SharePopupFacebook} alt="Facebook" className="w-full h-full" />
                </button>

                <button 
                  onClick={() => handleShare('x')}
                  className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <img src={SharePopupX} alt="X" className="w-full h-full" />
                </button>

                <button 
                  onClick={() => handleShare('whatsapp')}
                  className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <img src={SharePopupWhatsapp} alt="WhatsApp" className="w-full h-full" />
                </button>

                <button 
                  onClick={() => handleShare('telegram')}
                  className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <img src={SharePopupTelegram} alt="Telegram" className="w-full h-full" />
                </button>

                <button 
                  onClick={() => handleShare('linkedin')}
                  className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <img src={SharePopupLinkedin} alt="LinkedIn" className="w-full h-full" />
                </button>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePopup;