import { useVleStats } from '../../../../hooks/queries/public'

const fmt = (n) => (n != null ? n.toLocaleString('en-IN') : '—')

const VLEStatsBar = () => {
  const { data } = useVleStats()

  const stats = [
    { value: fmt(data?.activeVles),       label: 'Active VLEs' },
    { value: fmt(data?.statesCovered),    label: 'States Covered' },
    { value: fmt(data?.problemsSubmitted),label: 'Problems Submitted' },
    { value: fmt(data?.successStories),   label: 'Success Stories' },
  ]

  return (
    <div className="container relative -mt-10 sm:-mt-12 lg:-mt-16 mb-6 sm:mb-8 lg:mb-9 z-10">
      <div className="bg-[#403F32] rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-none text-white mb-1.5 sm:mb-2 lg:mb-3">
                {stat.value}
              </div>
              <div className="text-sm sm:text-base lg:text-lg xl:text-xl text-light/90">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VLEStatsBar
