import cat1 from "../../../../assets/icons/cat1.svg";
import cat2 from "../../../../assets/icons/cat2.svg";
import cat3 from "../../../../assets/icons/cat3.svg";
import cat4 from "../../../../assets/icons/cat4.svg";
import cat5 from "../../../../assets/icons/cat5.svg";
import cat6 from "../../../../assets/icons/cat6.svg";
import catOthers from "../../../../assets/icons/catOthers.svg";
import { useGetAdminCategoryStats } from '../../../../hooks/queries/admin';

const AgricultureIcon = () => <img src={cat1} />;
const TextilesIcon   = () => <img src={cat2} />;
const FisheriesIcon  = () => <img src={cat3} />;
const BambooIcon     = () => <img src={cat4} />;
const PoultryIcon    = () => <img src={cat5} />;
const DairyIcon      = () => <img src={cat6} />;
const OthersIcon     = () => <img src={catOthers} />;

const CATEGORIES_META = [
  { name: "Agriculture", icon: <AgricultureIcon />, bg: "bg-red-50",    border: "border-red-200",    numColor: "text-red-500"    },
  { name: "Textiles",    icon: <TextilesIcon />,   bg: "bg-orange-50", border: "border-orange-200", numColor: "text-orange-500" },
  { name: "Fisheries",   icon: <FisheriesIcon />,  bg: "bg-yellow-50", border: "border-yellow-200", numColor: "text-yellow-600" },
  { name: "Bamboo",      icon: <BambooIcon />,     bg: "bg-green-50",  border: "border-green-200",  numColor: "text-green-600"  },
  { name: "Poultry",     icon: <PoultryIcon />,    bg: "bg-cyan-50",   border: "border-cyan-200",   numColor: "text-cyan-500"   },
  { name: "Dairy",       icon: <DairyIcon />,      bg: "bg-indigo-50", border: "border-indigo-200", numColor: "text-indigo-500" },
  { name: "Other",       icon: <OthersIcon />,     bg: "bg-purple-50", border: "border-purple-200", numColor: "text-purple-500" },
];

const CategoryCard = ({ category, isLoading }) => (
  <div className={`${category.bg} ${category.border} border-2 rounded-2xl p-4 flex flex-col gap-3`}>
    <div className="w-12 h-12 rounded-xl flex items-center justify-center">
      {category.icon}
    </div>
    <p className="font-semibold text-gray-800 text-base">{category.name}</p>
    {isLoading ? (
      <div className="h-8 bg-gray-200 rounded animate-pulse" />
    ) : (
      <div className="flex gap-3">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Problems</p>
          <p className={`text-xl font-bold ${category.numColor}`}>{category.problems}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Innovations</p>
          <p className={`text-xl font-bold ${category.numColor}`}>{category.innovations}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Resolved</p>
          <p className={`text-xl font-bold ${category.numColor}`}>{category.resolved}</p>
        </div>
      </div>
    )}
  </div>
);

export default function CategoriesAndProblemStatements() {
  const { data, isLoading } = useGetAdminCategoryStats();
  const categoryStats = data?.data?.categoryStats;
  const problemsRegistered = data?.data?.problemsRegistered;
  const problemsResolved = data?.data?.problemsResolved;

  const categories = CATEGORIES_META.map(meta => ({
    ...meta,
    problems:    categoryStats?.[meta.name.toLowerCase()]?.problems    ?? 0,
    innovations: categoryStats?.[meta.name.toLowerCase()]?.innovations ?? 0,
    resolved:    categoryStats?.[meta.name.toLowerCase()]?.resolved    ?? 0,
  }));

  const formatNum = (n) => n != null ? n.toLocaleString() : '—';

  return (
    <div className="flex gap-6 mt-10 items-stretch">
      {/* Left: Categories */}
      <div className="flex-1 min-w-0 flex flex-col">
        <h2 className="text-3xl font-regular text-[#273228] mb-1">Categories</h2>
        <p className="text-gray-500 text-sm mb-6">Journey progression and skill development tracking</p>

        <div className="bg-white border border-accent-green-light rounded-2xl p-5 flex-1">
          <div className="grid grid-cols-3 gap-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.name} category={cat} isLoading={isLoading} />
            ))}
          </div>
        </div>
      </div>

      {/* Right: Problem Statements */}
      <div className="w-80 flex-shrink-0 flex flex-col">
        <h2 className="text-3xl font-regular text-[#273228] mb-1">Problem Statements</h2>
        <p className="text-gray-500 text-sm mb-6">Journey progression and skill development tracking</p>

        <div className="bg-white border border-accent-green-light rounded-2xl p-4 flex flex-col gap-4 flex-1">
          {/* Registered */}
          <div className="bg-blue-50 rounded-2xl px-5 py-1 flex-1 flex flex-col justify-center">
            <p className="text-gray-500 text-sm mb-3">Total No. of Registered<br />Problem Statements</p>
            {isLoading ? (
              <div className="h-10 bg-blue-100 rounded animate-pulse" />
            ) : (
              <p className="text-blue-600 text-4xl font-bold">{formatNum(problemsRegistered)}</p>
            )}
          </div>

          {/* Resolved */}
          <div className="bg-green-50 rounded-2xl px-5 py-1 flex-1 flex flex-col justify-center">
            <p className="text-gray-500 text-sm mb-3">Total No. of Resolved<br />Problem Statements</p>
            {isLoading ? (
              <div className="h-10 bg-green-100 rounded animate-pulse" />
            ) : (
              <p className="text-green-600 text-4xl font-bold">{formatNum(problemsResolved)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
