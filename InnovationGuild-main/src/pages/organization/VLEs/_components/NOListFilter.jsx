import { ChevronLeft, ChevronRight} from 'lucide-react';
import { useRef, useState } from 'react';

const NOListFilter=( )=> {
  const scrollContainerRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const noOrganizations = [
    'WASSAN', 'WASSAN', 'WASSAN',
    'WASSAN', 'WASSAN', 'WASSAN',
    'WASSAN', 'WASSAN', 'WASSAN'
  ];

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="my-8 bg-white border border-accent-green-dark rounded-3xl p-4">
      <h2 className="text-lg font-medium text-gray-900 mb-2">NO List</h2>

      <div className="flex items-center gap-3">
        <button
          onClick={() => scroll('left')}
          className="p-2 rounded-[30%] bg-accent-green-dark flex-shrink-0"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto flex-1 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {noOrganizations.map((org, index) => (
            <div
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`px-6 py-2 cursor-pointer rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${activeIndex === index
                  ? 'bg-accent-green-dark text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {org}
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="p-2 rounded-[30%] bg-accent-green-dark flex-shrink-0"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}

export default NOListFilter