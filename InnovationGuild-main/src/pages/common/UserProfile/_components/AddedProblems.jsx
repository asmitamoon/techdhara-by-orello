import { useQuery } from '@tanstack/react-query';
import * as commonApi from '../../../../api/common';
import ProblemCard from './ProblemCard';

const AddedProblems = ({ userId }) => {
    const { data: problems = [], isLoading } = useQuery({
        queryKey: ['userProblems', userId],
        queryFn: () => commonApi.getUserProblems(userId),
        enabled: !!userId,
        select: (data) => (data?.data?.problems ?? []).map((p) => ({
            id: p._id,
            title: p.problemTitle,
            author: p.postedBy?.fullName ?? '',
            description: p.problemDescription,
        })),
    });

    return (
        <div className="container pb-4 sm:pb-8">
            <div className="sm:bg-white sm:p-6 lg:p-8 sm:border border-accent-green-dark rounded-2xl">

                <div className="mb-4 sm:mb-6 lg:mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl text-primary mb-4 sm:mb-5 lg:mb-6">
                        Added Problems
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                    {isLoading ? (
                        <div className="col-span-full py-10 sm:py-12 text-center text-muted">
                            Loading...
                        </div>
                    ) : problems.length > 0 ? (
                        problems.map((problem) => (
                            <ProblemCard
                                key={problem.id}
                                id={problem.id}
                                title={problem.title}
                                author={problem.author}
                                description={problem.description}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-10 sm:py-12 text-center text-muted">
                            No problems added yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddedProblems;
