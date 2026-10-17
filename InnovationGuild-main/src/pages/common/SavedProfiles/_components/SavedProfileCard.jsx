import { Link } from 'react-router';
import greenTrashcan from '../../../../assets/icons/greenTrashcan.svg';

// Icons (Inline SVGs for Location & Language)
const Icons = {
  Location: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#A47E53" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  ),
  Language: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#A47E53" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
    </svg>
  )
};

const SavedProfileCard = ({ id, name, tags, location, languages, image, onDelete }) => {
  return (
    <div className="border border-accent-green-dark rounded-2xl p-4 md:p-5 flex items-center gap-4 md:gap-6 bg-white relative">
      {/* Trash Icon - Always visible for saved items */}
      <div
        className="absolute top-3 right-3 md:top-4 md:right-4 z-10 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onDelete}
      >
        <img src={greenTrashcan} alt="Delete" className="w-4 h-4 md:w-5 md:h-5" />
      </div>

      {/* Left: Circular Photo Placeholder */}
      <div className="w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-full bg-light-gray border border-primary flex items-center justify-center relative overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-primary text-sm md:text-base font-medium tracking-wide">PHOTO</span>
        )}
      </div>

      {/* Right: Content */}
      <div className="flex flex-col justify-center flex-1 min-w-0 space-y-1">

        {/* Name */}
        <h3 className="text-base md:text-lg font-semibold text-primary leading-tight truncate pr-6">
          {name}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className={`text-[10px] md:text-xs font-medium px-2 py-0.5 rounded-full ${
                tag === 'Sales' ? 'bg-[#E0B0FF]/20 text-[#9F7AEA]' : 'bg-[#9ae6b4]/20 text-[#48BB78]'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Location & Language Info */}
        {(location || languages) && (
          <div className="space-y-1 pt-1">
            {location && (
              <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted">
                <Icons.Location />
                <span className="truncate">{location}</span>
              </div>
            )}
            {languages && (
              <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted">
                <Icons.Language />
                <span className="truncate">{languages}</span>
              </div>
            )}
          </div>
        )}

        {/* Button */}
        <div className="pt-1">
          <Link
            to={`/profile/${id}`}
            className="bg-button-dark hover:bg-[#1A2E28] border border-accent-green text-white text-[10px] md:text-xs font-normal px-4 py-1.5 rounded-lg transition-colors cursor-pointer w-auto inline-block"
          >
            View Profile
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SavedProfileCard;
