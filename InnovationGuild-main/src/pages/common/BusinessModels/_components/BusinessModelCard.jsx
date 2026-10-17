import { Link } from 'react-router';
import greenTrashcan from '../../../../assets/icons/greenTrashcan.svg';

const BusinessModelCard = ({ id, title, organization, description, image, onDelete, linkState = {}, submitted = false }) => {
  return (
    <div className="border border-accent-green-dark rounded-2xl p-3 sm:p-4 md:p-4 flex justify-center items-center gap-3 md:gap-4 bg-white relative">

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
            to={`/business-models/${id}`}
            state={linkState}
            className={submitted
              ? "bg-white hover:bg-header border border-accent-green text-accent-green text-[10px] md:text-xs font-normal px-3 py-1.5 md:px-4 rounded-lg transition-colors cursor-pointer w-auto inline-block"
              : "bg-button-dark hover:bg-[#3A4A3C] border border-accent-green text-white text-[10px] md:text-xs font-normal px-3 py-1.5 md:px-4 rounded-lg transition-colors cursor-pointer w-auto inline-block"
            }
          >
            {submitted ? 'View Business Model' : 'Add Business Model'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BusinessModelCard;
