import { Link } from 'react-router';
import greenTrashcan from '../../../../assets/icons/greenTrashcan.svg';

const toSlug = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const SavedProblemCard = ({ id, title, author, description, onDelete }) => {
  return (
    <div className="border border-accent-green-dark rounded-2xl p-4 sm:p-5 flex flex-col bg-white relative">
      {/* Trash Icon - Always visible for saved items */}
      <div
        className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 cursor-pointer hover:opacity-80"
        onClick={onDelete}
      >
        <img src={greenTrashcan} alt="Delete" className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <div className="pr-7 sm:pr-8 mb-3 sm:mb-4">
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

export default SavedProblemCard;
