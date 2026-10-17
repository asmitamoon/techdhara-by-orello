import { Link } from 'react-router';

const toSlug = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')


const ProblemCard = ({ id, title, author, description}) => {
  return (
    <div className="border border-accent-green-dark rounded-2xl p-4 sm:p-5 flex flex-col bg-white relative">
      {/* Content */}
      <div className="flex flex-col flex-1">
        <div className="mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base font-semibold text-primary leading-tight mb-0.5 sm:mb-1 line-clamp-2">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-accent-green font-medium mb-2 sm:mb-3">
            {author}
          </p>
          <p className="text-[10px] sm:text-xs text-muted leading-relaxed line-clamp-3">
            {description}
          </p>
        </div>

        {/* Button */}
        <div className="mt-auto">
          <Link
            to={`/problems/${id}/${toSlug(title)}`}
            className="bg-button-dark hover:bg-[#3A4A3C] border border-accent-green text-white text-[10px] sm:text-xs font-medium px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors cursor-pointer w-auto inline-block"
          >
            View Problem
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProblemCard;
