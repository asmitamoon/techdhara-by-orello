const fmt = (n) => `₹ ${n.toLocaleString('en-IN')}`

const InnovationPricingCard = ({ min = null, max = null, showFinancing = true }) => {
  const priceDisplay = () => {
    if (min !== null && max !== null && min !== max) return `${fmt(min)} – ${fmt(max)}`
    const single = min ?? max
    if (single !== null) return fmt(single)
    return '—'
  }

  return (
    <div className="mt-5 sm:mt-6 lg:mt-8">
      <p className="text-sm sm:text-base lg:text-lg text-muted mb-1 sm:mb-2">Cost</p>
      <div className="flex items-baseline gap-2 sm:gap-3">
        <span className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-tight font-semibold text-heading">
          {priceDisplay()}
        </span>
      </div>
      {showFinancing && (
        <p className="text-xs sm:text-sm lg:text-base text-muted mt-1 sm:mt-2">
          * End User Financing Available
        </p>
      )}
    </div>
  )
}

export default InnovationPricingCard
