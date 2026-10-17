import { Link } from 'react-router';
import editiconGreen from '../../../../assets/icons/editiconGreen.svg';

const toSlug = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const ProblemCard = ({ id, title, description, status, type }) => {
  const viewLink = type === 'service'
    ? `/service-requests/${id}`
    : `/problems/${id}/${toSlug(title)}`;

  return (
    <div className="border border-accent-green-dark rounded-2xl p-4 sm:p-5 flex flex-col bg-white relative">
      {/* Edit Icon - Only show for drafts */}
      {status === 'drafts' && (
        <Link
          to={`/submit-problem/${type}/${id}`}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10"
        >
          <img src={editiconGreen} alt="Edit" className="w-5 h-5" />
        </Link>
      )}

      {/* Content */}
      <div className="flex flex-col flex-1">
        <div className="pr-7 sm:pr-8 mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base font-semibold text-primary leading-tight mb-0.5 sm:mb-1 line-clamp-2">
            {title}
          </h3>
          <p className="text-[10px] sm:text-xs text-muted leading-relaxed line-clamp-3">
            {description}
          </p>
        </div>

        {/* Button */}
        {status === 'approved' && (
          <div className="mt-auto">
            <Link
              to={viewLink}
              className="bg-button-dark hover:bg-[#3A4A3C] border border-accent-green text-white text-[10px] sm:text-xs font-medium px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors cursor-pointer w-auto inline-block"
            >
              View Problem
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemCard;
