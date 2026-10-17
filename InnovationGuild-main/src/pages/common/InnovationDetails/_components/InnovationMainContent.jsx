import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import InnovationImageGallery from './InnovationImageGallery'
import InnovationPricingCard from './InnovationPricingCard'
import SharePopup from '../../../../components/ui/SharePopup'
import { IoBookmarkOutline, IoBookmark } from 'react-icons/io5'
import ShareIcon from '../../../../assets/icons/shareIconBig.svg'
import ViewsIcon from '../../../../assets/icons/views.svg'
import { useSaveInnovation, useUnsaveInnovation } from '../../../../hooks/mutations/common'
import { useGetSavedInnovations } from '../../../../hooks/queries/common'
import { selectIsLoggedIn, selectUser } from '../../../../store/slices/authSlice'
import toast from 'react-hot-toast'

const InnovationMainContent = ({ innovationData }) => {
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false)
  const views = innovationData?.stats?.views || 0
  const innovationId = innovationData?.id

  const isLoggedIn = useSelector(selectIsLoggedIn)
  const user = useSelector(selectUser)
  const navigate = useNavigate()
  const { data: savedData } = useGetSavedInnovations()
  const isSaved = savedData?.data?.savedInnovations?.some(
    s => (s.innovationId?._id ?? s.innovationId) === innovationId
  ) ?? false
  const saveMutation = useSaveInnovation()
  const unsaveMutation = useUnsaveInnovation()

  const handleSave = () => {
    if (!isLoggedIn) { toast.error('Please login to continue'); navigate('/login'); return }
    if (user?.status !== 'APPROVED') { toast.error('Your account is not approved yet'); return }
    if (isSaved) {
      unsaveMutation.mutate(innovationId)
    } else {
      saveMutation.mutate(innovationId)
    }
  }

  const handleShare = () => {
    setIsSharePopupOpen(true)
  }

  return (
    <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl">
      <div className="flex sm:hidden justify-end gap-2 mb-4">
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending || unsaveMutation.isPending}
          className={`w-10 h-10 rounded-full border border-accent-green flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isSaved ? 'bg-accent-green hover:bg-accent-green/80' : 'bg-button-dark hover:bg-accent-gold'}`}
        >
          {isSaved ? <IoBookmark className="w-5 h-5 text-white" /> : <IoBookmarkOutline className="w-5 h-5 text-white" />}
        </button>
        <button
          onClick={handleShare}
          className="w-10 h-10 rounded-full bg-button-dark border border-accent-green flex items-center justify-center hover:bg-accent-gold transition-all cursor-pointer"
        >
          <img src={ShareIcon} alt="Share" className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 sm:mb-6">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight text-heading">
          {innovationData.title}
        </h1>

        <div className="hidden sm:flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending || unsaveMutation.isPending}
            className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full border border-accent-green flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isSaved ? 'bg-accent-green hover:bg-accent-green/80' : 'bg-button-dark hover:bg-accent-gold'}`}
          >
            {isSaved ? <IoBookmark className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" /> : <IoBookmarkOutline className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />}
          </button>
          <button
            onClick={handleShare}
            className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-button-dark border border-accent-green flex items-center justify-center hover:bg-accent-gold transition-all cursor-pointer"
          >
            <img src={ShareIcon} alt="Share" className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
          </button>
        </div>
      </div>

      <div className="bg-header rounded-xl px-4 py-2 inline-flex items-center gap-3">
        <div 
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-light flex items-center justify-center shrink-0" 
          style={{ color: '#CB913D' }} 
        >
          <img src={ViewsIcon} alt="Views" className="w-3 h-3 sm:w-3 sm:h-3" />
        </div>

        <div className="flex flex-col">
          <span className="text-xs sm:text-sm text-muted leading-tight">
            Views
          </span>
          <span className="text-sm sm:text-base text-heading font-medium leading-tight">
            {views}
          </span>
        </div>
      </div>

      <div className="mt-3 lg:mt-4">
        <InnovationImageGallery mediaItems={innovationData.mediaItems} />
      </div>

      <InnovationPricingCard
        min={innovationData.pricing.min}
        max={innovationData.pricing.max}
        showFinancing={innovationData.pricing.financingAvailable}
      />

      <SharePopup 
        isOpen={isSharePopupOpen} 
        onClose={() => setIsSharePopupOpen(false)}
        url={window.location.href} 
      />
    </div>
  )
}

export default InnovationMainContent