import { Link } from 'react-router';
import greenTrashcan from '../../../assets/icons/greenTrashcan.svg';
import { useGetFacingSimilarProblems } from '../../../hooks/queries/vle';
import { useToggleFacingSimilar } from '../../../hooks/mutations/vle';
import PageLoader from '../../../components/ui/PageLoader';

const toSlug = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const SimilarProblemsFaced = () => {
  const { data, isLoading } = useGetFacingSimilarProblems();
  const toggleMutation = useToggleFacingSimilar();

  const records = data?.data?.problems ?? [];

  return (
    <div className="min-h-screen bg-light pt-navbar">
      <div className="container">

        {/* Main Container with Green Border */}
        <div className="bg-white border border-[#8CA877] rounded-[24px] md:rounded-[32px] p-4 md:p-8">

          {/* Header Section */}
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <h1 className="text-2xl md:text-5xl font-normal text-[#1A2E28]">
              Similar Problems Faced
            </h1>
            {/* Count Badge */}
            <div className="border border-[#5B7E50] rounded-full px-2 py-0.5 text-xs md:text-sm font-medium text-[#5B7E50]">
              {String(records.length).padStart(2, '0')}
            </div>
          </div>

          {isLoading ? (
            <PageLoader className="py-10 sm:py-12" />
          ) : records.length === 0 ? (
            <div className="py-10 text-center text-muted">No similar problems faced yet.</div>
          ) : (
            <div className="grid grid-cols-1 min-[900px]:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {records.map((record) => {
                const problem = record.problemId;
                const problemId = problem?._id ?? problem;
                const postedBy = problem?.postedBy;
                const authorName = postedBy?.fullName
                  ?? (postedBy?.firstName && postedBy?.lastName ? `${postedBy.firstName} ${postedBy.lastName}` : '')
                  ?? '';
                return (
                  <div
                    key={record._id}
                    className="border border-[#B8CEA8] rounded-2xl p-5 md:p-6 flex flex-col bg-white relative"
                  >
                    {/* Trash Icon */}
                    <div
                      onClick={() => toggleMutation.mutate(problemId)}
                      className="absolute top-4 right-4 z-10 cursor-pointer hover:opacity-80"
                    >
                      <img src={greenTrashcan} alt="Delete" />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1">
                      <div className="pr-8 mb-4">
                        <h3 className="text-base font-bold text-[#1A2E28] leading-tight mb-1">
                          {problem?.problemTitle ?? ''}
                        </h3>
                        <p className="text-sm text-[#7A9366] font-medium mb-3">
                          {authorName}
                        </p>
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                          {problem?.problemDescription ?? ''}
                        </p>
                      </div>

                      {/* Button pushed to bottom */}
                      <div className="mt-auto">
                        <Link
                          to={`/problems/${problemId}${problem?.problemTitle ? `/${toSlug(problem.problemTitle)}` : ''}`}
                          className="bg-[#273228] hover:bg-[#3A4A3C] border border-[#649769] text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer w-auto inline-block"
                        >
                          View Problem
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimilarProblemsFaced;
