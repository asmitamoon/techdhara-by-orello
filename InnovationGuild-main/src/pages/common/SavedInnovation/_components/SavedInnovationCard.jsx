import { Link } from 'react-router';
import greenTrashcan from '../../../../assets/icons/greenTrashcan.svg';

const toSlug = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const SavedInnovationCard = ({ id, title, organization, description, image, onDelete }) => {
  return (
    <div className="border border-accent-green-dark rounded-2xl p-3 sm:p-4 md:p-4 flex justify-center items-center gap-3 md:gap-4 bg-white relative">
      {/* Trash Icon - Always visible for saved items */}
      <div
        className="absolute top-3 right-3 md:top-4 md:right-4 z-10 cursor-pointer hover:opacity-80"
        onClick={onDelete}
      >
        <img src={greenTrashcan} alt="Delete" className="w-5 h-5" />
      </div>

      {/* Left: Image */}
      <div className="w-24 h-24 md:w-32 md:h-32 shrink-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover rounded-xl"
        />
      </div>

      {/* Right: Content */}
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div className="pr-5 md:pr-6">
          <h3 className="text-sm md:text-base font-semibold text-primary leading-tight mb-0.5 sm:mb-1 truncate">
            {title}
          </h3>
          <p className="text-xs md:text-sm text-accent-green font-medium mb-1 md:mb-2 truncate">
            {organization}
          </p>
          <p className="text-[10px] md:text-xs text-muted leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        {/* Button */}
        <div className="mt-2 md:mt-3">
          <Link
            to={`/innovations/${id}/${toSlug(title)}`}
            className="bg-button-dark hover:bg-[#3A4A3C] border border-accent-green text-white text-[10px] md:text-xs font-normal px-3 py-1.5 md:px-4 rounded-lg transition-colors cursor-pointer w-auto inline-block"
          >
            View Innovation
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SavedInnovationCard;
