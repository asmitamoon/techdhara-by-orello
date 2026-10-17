import { useNavigate, useParams } from 'react-router';
import InnovationMainContent from './_components/InnovationMainContent'
import InnovationProductDetails from '../../common/InnovationDetails/_components/InnovationProductDetails'
import { useGetOrgInnovationById } from '../../../hooks/queries/org';
import PageLoader from '../../../components/ui/PageLoader';

const OrganizationInnovationDetails = () => {
    const navigate = useNavigate();
    const { id: innovationId } = useParams();

    const { data, isLoading } = useGetOrgInnovationById(innovationId);
    const inv = data?.data?.innovation;

    const innovationData = inv ? {
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
        productDetails: {
            category: {
                main: Array.isArray(inv.category) ? inv.category : (inv.category ? [inv.category] : []),
                sub: Array.isArray(inv.subcategory) ? inv.subcategory : (inv.subcategory ? [inv.subcategory] : []),
                operations: inv.coveredOperations ?? [],
            },
            specifications: {
                powerSource: inv.powerSource ?? '',
                pullCapacity: inv.pullCapacity ?? '',
                engineCapacity: inv.engineCapacity ?? '',
                motorCapacity: inv.motorCapacity ?? '',
                renewableType: inv.renewableType ?? '',
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
            downloadables: [],
        }
    } : null;

    return (
        <div className="min-h-screen bg-page">
            <div className="flex flex-col gap-8">
                <div>
                    <div className="flex items-center gap-3 sm:gap-4 mb-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex-shrink-0 p-2 hover:bg-light rounded-lg transition-colors group cursor-pointer"
                            aria-label="Go back"
                        >
                            <svg
                                className="w-7 h-7 sm:w-8 sm:h-8 text-muted group-hover:text-dark transition-colors"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                        </button>
                        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-regular text-black">
                            Innovation Details
                        </h1>
                    </div>
                    <div className="border-t mt-6 border-accent-green-dark"></div>
                </div>

                {isLoading ? (
                    <PageLoader className="py-20" />
                ) : innovationData ? (
                    <div className="py-6">
                        <div className="flex flex-col gap-6">
                            <InnovationMainContent innovationData={innovationData} />
                            <InnovationProductDetails productData={innovationData.productDetails} />
                        </div>
                    </div>
                ) : (
                    <div className="py-20 text-center text-muted">Innovation not found.</div>
                )}
            </div>
        </div>
    )
}

export default OrganizationInnovationDetails
