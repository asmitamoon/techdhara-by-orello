// Category icons
import catAll from '../../../../assets/icons/catAll.svg'
import catAgriTools from '../../../../assets/icons/catAgriTools.svg'
import catDairy from '../../../../assets/icons/catDairy.svg'
import catOthers from '../../../../assets/icons/catOthers.svg'
import catTextiles from '../../../../assets/icons/catTextiles.svg'
import catFisheries from '../../../../assets/icons/catFisheries.svg'
import catBamboo from '../../../../assets/icons/catBamboo.svg'
import catPoultry from '../../../../assets/icons/catPoultry.svg'


const categories = [
  { id: 'all', name: 'All', color: '#273228', icon: catAll },
  { id: 'agriculture', name: 'Agriculture', color: '#C76D6D', icon: catAgriTools },
  { id: 'textiles', name: 'Textiles', color: '#C78E6D', icon: catTextiles },
  { id: 'fisheries', name: 'Fisheries', color: '#C7BF6D', icon: catFisheries },
  { id: 'bamboo', name: 'Bamboo', color: '#8CBA79', icon: catBamboo },
  { id: 'poultry', name: 'Poultry', color: '#6DB9C7', icon: catPoultry },
  { id: 'dairy', name: 'Dairy', color: '#6D79C7', icon: catDairy },
  { id: 'others', name: 'Others', color: '#AA6DC7', icon: catOthers },
]

const activeTabStyles = `
  /* --- Mobile Styles --- */
  .category-tab-active {
    position: relative;
    background: var(--color-header);
    padding: 18px 16px;
    border-radius: 0 0 40px 40px; 
    /* Pulls the tab up */
    margin-top: -36px; 
  }

  .category-tab-active::before {
    content: '';
    position: absolute;
    top: 0;
    left: -12px;
    width: 12px;
    height: 12px;
    background: var(--color-page);
    border-top-right-radius: 12px;
    box-shadow: 4px -4px 0 var(--color-header);
  }

  .category-tab-active::after {
    content: '';
    position: absolute;
    top: 0;
    right: -12px;
    width: 12px;
    height: 12px;
    background: var(--color-page);
    border-top-left-radius: 12px;
    box-shadow: -4px -4px 0 var(--color-header);
  }

  /* --- Desktop Styles (md and up) --- */
  @media (min-width: 768px) {
    .category-tab-active {
      padding: 20px 24px;
      border-radius: 0 0 80px 80px;
      margin-top: -42px;
    }

    .category-tab-active::before {
      left: -20px;
      width: 20px;
      height: 20px;
      border-top-right-radius: 20px;
      box-shadow: 5px -5px 0 var(--color-header);
    }

    .category-tab-active::after {
      right: -20px;
      width: 20px;
      height: 20px;
      border-top-left-radius: 20px;
      box-shadow: -5px -5px 0 var(--color-header);
    }
  }

  /* --- Custom Horizontal Scrollbar --- */
  .custom-scrollbar::-webkit-scrollbar {
    height: 4px; /* Thinner scrollbar for cleaner look */
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
    margin: 0 20px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #D1D5DC;
    border-radius: 10px;
  }
`

const InnovationsCategorySection = ({ selectedCategory = 'all', onCategoryChange }) => {
  const handleCategoryClick = (categoryId) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId)
    }
  }

  return (
    <>
      <style>{activeTabStyles}</style>
      <div className="bg-page pb-6 shadow-lg relative z-10">
        <div className="container">
          <div className="flex items-start gap-6 min-[900px]:gap-0 min-[900px]:justify-between overflow-x-auto custom-scrollbar pt-8 md:pt-10 pb-6 px-5">
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="flex flex-col items-center gap-3 cursor-pointer group transition-all flex-shrink-0 min-w-[70px] md:min-w-[80px]"
                >
                  {/* Icon Wrapper */}
                  <div
                    className={`${isSelected ? 'category-tab-active' : ''}`}
                  >
                    {/* Circular Icon */}
                    <div
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-transform duration-300 ${
                        !isSelected ? 'group-hover:scale-110' : ''
                      }`}
                      style={{ backgroundColor: category.color }}
                    >
                      <img 
                        src={category.icon} 
                        alt={category.name} 
                        className="w-6 h-6 md:w-7 md:h-7 object-contain" 
                      />
                    </div>
                  </div>

                  {/* Category Label */}
                  <span
                    className={`text-xs md:text-sm 2xl:text-base leading-normal font-body whitespace-nowrap transition-colors duration-200 ${
                      isSelected
                        ? 'text-primary font-bold'
                        : 'text-secondary font-medium'
                    }`}
                  >
                    {category.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export default InnovationsCategorySection