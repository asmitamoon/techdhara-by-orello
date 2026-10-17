import { useNavigate, useParams } from 'react-router';
import { useGetOrgProblemView } from '../../../hooks/queries/org';
import PageLoader from '../../../components/ui/PageLoader';
import { getStateName, getDistrictName } from '../../../utils/LocationData/locationData';

const formatDate = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const OrgProblemView = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data, isLoading } = useGetOrgProblemView(id);
    const p = data?.data?.problem;

    const problemData = p ? {
        title: p.problemTitle ?? '',
        description: p.problemDescription ?? '',
        date: formatDate(p.createdAt),
        operations: p.machineOperations ?? [],
        crops: p.crops ?? '',
        specificInfo: p.specificInfo ?? '',
        problemSize: p.problemSize ?? '',
        pullCapacity: p.pullCapacity ?? '',
        engineCapacity: p.engineCapacity ?? '',
        motorCapacity: p.motorCapacity ?? '',
        energySource: p.energySource ?? [],
        currentMethodology: p.currentMethodology ?? '',
        machineChallenge: p.machineChallenge ?? '',
        regionVillage: p.regionVillage ?? '',
        regionDistrict: p.regionDistrict ?? '',
        regionState: p.regionState ?? '',
        coverImage: p.coverImage ?? null,
    } : null;

    const capacity = problemData
        ? [problemData.pullCapacity, problemData.engineCapacity, problemData.motorCapacity]
            .filter(Boolean).join(' / ') || '—'
        : '—';

    const location = problemData
        ? [
            problemData.regionVillage,
            getDistrictName(problemData.regionDistrict, problemData.regionState) ?? problemData.regionDistrict,
            getStateName(problemData.regionState) ?? problemData.regionState,
        ].filter(Boolean).join(', ') || '—'
        : '—';

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
                            Problem Details
                        </h1>
                    </div>
                    <div className="border-t mt-6 border-accent-green-dark"></div>
                </div>

                {isLoading ? (
                    <PageLoader className="py-20" />
                ) : problemData ? (
                    <div className="py-6">
                        <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl space-y-6">
                            <div>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight text-heading">
                                    {problemData.title}
                                </h1>
                                {problemData.date && (
                                    <p className="text-base sm:text-lg text-heading mt-2">{problemData.date}</p>
                                )}
                            </div>

                            {problemData.description && (
                                <p className="text-base sm:text-lg lg:text-xl text-heading">
                                    {problemData.description}
                                </p>
                            )}

                            <div className="grid grid-cols-1 gap-6 lg:gap-8">
                                <div>
                                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-heading mb-3 sm:mb-4">
                                        Requirements
                                    </h3>
                                    <div className="text-sm sm:text-base lg:text-xl">
                                        <div className="flex justify-between py-2 border-b border-input-border">
                                            <span className="text-heading">Operations:</span>
                                            <span className="text-heading text-right ml-4">
                                                {problemData.operations.length ? problemData.operations.join(', ') : '—'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-input-border">
                                            <span className="text-heading">Raw Materials:</span>
                                            <span className="text-heading text-right ml-4">{problemData.crops || '—'}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-input-border">
                                            <span className="text-heading">Any other usability conditions:</span>
                                            <span className="text-heading text-right ml-4">{problemData.specificInfo || '—'}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-input-border">
                                            <span className="text-heading">Number of machines required:</span>
                                            <span className="text-heading text-right ml-4">{problemData.problemSize || '—'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-heading mb-3 sm:mb-4">
                                        Specifications Required
                                    </h3>
                                    <div className="text-sm sm:text-base lg:text-xl">
                                        <div className="flex justify-between py-2 border-b border-input-border">
                                            <span className="text-heading">Capacity of the machine:</span>
                                            <span className="text-heading text-right ml-4">{capacity}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-input-border">
                                            <span className="text-heading">Energy source:</span>
                                            <span className="text-heading text-right ml-4">
                                                {problemData.energySource.length ? problemData.energySource.join(', ') : '—'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {problemData.currentMethodology && (
                                    <div>
                                        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-heading mb-3 sm:mb-4">
                                            Current Methodology
                                        </h3>
                                        <p className="text-sm sm:text-base lg:text-xl text-heading">
                                            {problemData.currentMethodology}
                                        </p>
                                    </div>
                                )}

                                {problemData.machineChallenge && (
                                    <div>
                                        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-heading mb-3 sm:mb-4">
                                            Challenges with current methodology
                                        </h3>
                                        <p className="text-sm sm:text-base lg:text-xl text-heading">
                                            {problemData.machineChallenge}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-heading mb-3 sm:mb-4">
                                        Locations to be covered
                                    </h3>
                                    <p className="text-sm sm:text-base lg:text-xl text-heading">{location}</p>
                                </div>
                            </div>

                            {problemData.coverImage && (
                                <div className="w-full rounded-lg overflow-hidden">
                                    <img
                                        src={problemData.coverImage}
                                        alt="Problem"
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="py-20 text-center text-muted">Problem not found.</div>
                )}
            </div>
        </div>
    );
};

export default OrgProblemView;
