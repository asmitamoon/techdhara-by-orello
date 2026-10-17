import MetricCard from './MetricCard'
import IndiaMap from '../../../../assets/images/IndiaMap.png'
import IndiaIcon from '../../../../assets/icons/indiaIcon.svg'
import AoIcon from '../../../../assets/icons/aoIcon.svg'
import ActiveVleIcon from '../../../../assets/icons/activeVleIcon.svg'
import TechGapsIcon from '../../../../assets/icons/techgapsIdentifiedIcon.svg'
import InnovationOnboardIcon from '../../../../assets/icons/innovationOnboardIcon.svg'
import TechImplementedIcon from '../../../../assets/icons/technologiesImplementedIcon.svg'
import { useImpactStats } from '../../../../hooks/queries/public'

const fmt = (n) => (n != null ? n.toLocaleString('en-IN') : '—')

const ImpactMetricsSection = () => {
  const { data } = useImpactStats()

  const metrics = [
    { id: 1, number: fmt(data?.states),                  label: 'States',                   icon: IndiaIcon },
    { id: 2, number: fmt(data?.nodalOrgs),               label: 'Nodal Organizations',       icon: AoIcon },
    { id: 3, number: fmt(data?.affiliatedOrgs),          label: 'Affiliated Organizations',  icon: AoIcon },
    { id: 4, number: fmt(data?.activeVles),              label: 'Active VLEs',               icon: ActiveVleIcon },
    { id: 5, number: fmt(data?.problemsIdentified),      label: 'Problems Identified',       icon: TechGapsIcon },
    { id: 6, number: fmt(data?.innovatorsOnboarded),     label: 'Innovators Onboarded',      icon: InnovationOnboardIcon },
    { id: 7, number: fmt(data?.technologiesImplemented), label: 'Technologies Implemented',  icon: TechImplementedIcon }
  ]

  return (
    <section className="relative bg-[#FCF4E9] pt-16 md:pt-26 pb-20 lg:pb-45">
      {/* Background Map Layer */}
      <div className="absolute overflow-hidden top-10 bottom-0 left-0 inset-0 pointer-events-none">
        <img
          src={IndiaMap}
          alt="India Map"
          className="object-contain "
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 lg:gap-16">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.id}
              number={metric.number}
              label={metric.label}
              icon={metric.icon}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ImpactMetricsSection
