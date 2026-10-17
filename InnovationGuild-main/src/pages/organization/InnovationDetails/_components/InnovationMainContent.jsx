import InnovationImageGallery from '../../../common/InnovationDetails/_components/InnovationImageGallery'
import InnovationPricingCard from '../../../common/InnovationDetails/_components/InnovationPricingCard'
import ViewsIcon from '../../../../assets/icons/views.svg'

const InnovationMainContent = ({ innovationData }) => {
  const views = innovationData?.stats?.views || 0

  return (
    <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 sm:mb-6">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight text-heading">
          {innovationData.title}
        </h1>
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
    </div>
  )
}

export default InnovationMainContent
