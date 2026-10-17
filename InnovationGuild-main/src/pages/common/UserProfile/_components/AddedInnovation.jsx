import { useQuery } from '@tanstack/react-query';
import * as commonApi from '../../../../api/common';
import InnovationCard from './InnovationCard';

const AddedInnovation = ({ userId }) => {
    const { data: innovations = [], isLoading } = useQuery({
        queryKey: ['userInnovations', userId],
        queryFn: () => commonApi.getUserInnovations(userId),
        enabled: !!userId,
        select: (data) => (data?.data?.innovations ?? []).map((i) => ({
            id: i._id,
            title: i.innovationName,
            organization: i.innovatorId?.fullName ?? '',
            description: i.description,
            image: i.media?.images?.[0]?.url ?? null,
        })),
    });

    return (
        <div className="container pb-4 sm:pb-8">
            <div className="sm:bg-white sm:p-6 lg:p-8 sm:border border-accent-green-dark rounded-2xl">

                <div className="mb-4 sm:mb-6 lg:mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl text-primary mb-4 sm:mb-5 lg:mb-6">
                        Added Innovations
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                    {isLoading ? (
                        <div className="col-span-full py-10 sm:py-12 text-center text-muted">
                            Loading...
                        </div>
                    ) : innovations.length > 0 ? (
                        innovations.map((innovation) => (
                            <InnovationCard
                                key={innovation.id}
                                id={innovation.id}
                                title={innovation.title}
                                organization={innovation.organization}
                                description={innovation.description}
                                image={innovation.image}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-10 sm:py-12 text-center text-muted">
                            No innovations added yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddedInnovation;
