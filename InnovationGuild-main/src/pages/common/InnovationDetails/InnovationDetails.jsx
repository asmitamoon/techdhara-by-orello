import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import PageHeader from '../../../components/ui/PageHeader'
import InnovationDetailsSection from './_components/InnovationDetailsSection'
import ContactSection from '../../../components/layout/ContactSection'
import { useInnovationById } from '../../../hooks/queries/public'
import { useGetSavedInnovations } from '../../../hooks/queries/common'
import PageLoader from '../../../components/ui/PageLoader'
import { getStateName, getDistrictName } from '../../../utils/LocationData/locationData'
import { POWER_SOURCE_OPTIONS, RENEWABLE_ENERGY_OPTIONS } from '../../../utils/constants/innovationConstants'

const toSlug = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const labelOf = (options, value) => options.find(o => o.value === value)?.label ?? value ?? ''

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`
}

const InnovationDetails = () => {
  const { id, slug } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useInnovationById(id)
  const { isLoading: savedLoading } = useGetSavedInnovations()

  useEffect(() => {
    if (data?.data?.innovation) {
      const correctSlug = toSlug(data.data.innovation.innovationName)
      if (slug !== correctSlug) {
        navigate(`/innovations/${id}/${correctSlug}`, { replace: true })
      }
    }
  }, [data, id, slug, navigate])

  if (isLoading || savedLoading) {
    return (
      <div className="min-h-screen bg-light">
        <PageHeader variant="innovations" title="Innovation Details" isIndividual={true} />
        <PageLoader />
        <ContactSection />
      </div>
    )
  }

  if (isError || !data?.data?.innovation) {
    return (
      <div className="min-h-screen bg-light">
        <PageHeader variant="innovations" title="Innovation Details" isIndividual={true} />
        <div className="container py-20 text-center text-muted">Innovation not found.</div>
        <ContactSection />
      </div>
    )
  }

  const inv = data.data.innovation

  const innovationData = {
    id: inv._id,
    title: inv.innovationName,
    stats: { views: inv.views ?? 0 },
    mediaItems: [
      ...(inv.media?.images ?? []).map(img => ({
        type: 'image',
        url: img.url,
        position: img.position ?? 0,
      })),
      ...(inv.media?.videos ?? []).map(v => ({
        type: 'video',
        url: v.url,
        isExternal: v.isExternal ?? false,
        processingStatus: v.processingStatus ?? 'ORIGINAL',
        position: v.position ?? 0,
      })),
    ].sort((a, b) => a.position - b.position),
    pricing: {
      min: inv.sellingPrice?.min ?? null,
      max: inv.sellingPrice?.max ?? null,
      financingAvailable: inv.financingSupport === 'yes',
    },
    innovator: {
      userId: inv.innovatorId?._id ?? null,
      name: inv.innovatorId?.fullName ?? '',
      location: inv.state
        ? inv.district
          ? `${getDistrictName(inv.district, inv.state)}, ${getStateName(inv.state)}`
          : getStateName(inv.state)
        : '',
      description: inv.innovatorDescription ?? '',
    },
    productDetails: {
      category: {
        main: [
          ...(Array.isArray(inv.category) ? inv.category : [inv.category].filter(Boolean)).filter(v => v !== 'others'),
          ...(inv.categoryOther ? [inv.categoryOther] : []),
        ],
        sub: [
          ...(Array.isArray(inv.subcategory) ? inv.subcategory : [inv.subcategory].filter(Boolean)).filter(v => v !== 'others'),
          ...(inv.subcategoryOther ? [inv.subcategoryOther] : []),
        ],
        operations: inv.coveredOperations ?? [],
      },
      specifications: {
        powerSource: labelOf(POWER_SOURCE_OPTIONS, inv.powerSource),
        pullCapacity: inv.pullCapacity ?? '',
        engineCapacity: inv.engineCapacity ?? '',
        motorCapacity: inv.motorCapacity ?? '',
        renewableType: labelOf(RENEWABLE_ENERGY_OPTIONS, inv.renewableType),
        dimensions: inv.dimensions ?? '',
        weight: inv.weight ?? '',
        attachments: inv.attachments ?? '',
        performanceParams: inv.performanceParams ?? '',
      },
      usage: {
        suitableCrops: inv.suitableCrops ?? '',
        suitableTerrains: inv.suitableTerrains ?? '',
        suitableSoil: inv.suitableSoil ?? '',
        weatherConditions: inv.weatherConditions ?? '',
        otherUsageConditions: inv.otherUsageConditions ?? '',
      },
      overview: inv.description ?? '',
      downloadables: (inv.downloadableResources ?? [])
        .filter(r => r.type !== 'VIDEO')
        .map(r => ({
          title: r.filename,
          type: r.type,
          size: formatFileSize(r.size),
          url: r.url,
        })),
    },
  }

  return (
    <div className="min-h-screen bg-light">
      <PageHeader variant="innovations" title="Innovation Details" isIndividual={true} />
      <InnovationDetailsSection innovationData={innovationData} />
      <ContactSection />
    </div>
  )
}

export default InnovationDetails
