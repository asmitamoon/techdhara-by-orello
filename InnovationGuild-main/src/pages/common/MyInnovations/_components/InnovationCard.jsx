import { Link } from 'react-router';
import editiconGreen from '../../../../assets/icons/editiconGreen.svg';

const toSlug = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const InnovationCard = ({ id, title, description, image, status, onDeleteRequest }) => {
  const isEditable = status === 'draft' || status === 'rejected';

  return (
    <div className="border border-accent-green-dark rounded-2xl p-3 sm:p-4 md:p-4 flex justify-center items-center gap-3 md:gap-4 bg-white relative">
      {/* Top-right action icons */}
      {isEditable && (
        <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10 flex items-center gap-2">
          <Link to={`/submit-innovation/${id}`}>
            <img src={editiconGreen} alt="Edit" className="w-5 h-5 cursor-pointer" />
          </Link>
          <button
            onClick={() => onDeleteRequest(id, title)}
            className="cursor-pointer text-red-400 hover:text-red-600 transition-colors"
            aria-label="Delete"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      )}

      {/* Left: Image */}
      <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-xl overflow-hidden bg-gray-200">
        {image && <img src={image} alt={title} className="w-full h-full object-cover" />}
      </div>

      {/* Right: Content */}
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div className={isEditable ? 'pr-14 md:pr-16' : 'pr-2'}>
          <h3 className="text-sm md:text-base font-semibold text-primary leading-tight mb-1 sm:mb-2 truncate">
            {title}
          </h3>
          <p className="text-[10px] md:text-xs text-muted leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        <div className="mt-2 md:mt-3">
          <Link
            to={isEditable ? `/submit-innovation/${id}` : `/innovations/${id}/${toSlug(title)}`}
            className="bg-button-dark hover:bg-accent-gold border border-accent-green text-white text-[10px] md:text-xs font-normal px-3 py-1.5 md:px-4 rounded-lg transition-colors cursor-pointer w-auto inline-block"
          >
            {isEditable ? 'Edit Innovation' : 'View Innovation'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InnovationCard;
