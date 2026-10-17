import rep1 from "../../../assets/icons/rep1.svg";
import rep2 from "../../../assets/icons/rep2.svg";
import rep3 from "../../../assets/icons/rep3.svg";
import rep4 from "../../../assets/icons/rep4.svg";
import rep5 from "../../../assets/icons/rep5.svg";
import rep6 from "../../../assets/icons/rep6.svg";
import Ecosystem from './_components/Ecosystem.jsx'
import ProblemStatement from './_components/ProblemStatement.jsx'
import InnovationGrowth from './_components/InnovationGrowth.jsx'
import InnovatorGrowth from './_components/InnovatorGrowth.jsx'
import VleInnovator from './_components/VleInnovator.jsx'
import Categories from './_components/Categories.jsx'
import Pipeline from './_components/Pipeline.jsx'
import Map from './_components/Map.jsx'
import DetailedReports from './_components/DetailedReports.jsx'
import { useGetAdminAnalytics } from '../../../hooks/queries/admin';

const BuildingIcon = () => (
  <img src={rep1}></img>
);

const LocationIcon = () => (
 <img src={rep2}></img>
);

const PersonIcon = () => (
  <img src={rep3}></img>
);
const PersonIcon2 = () => (
  <img src={rep4}></img>
);

const BulbIcon = () => (
 <img src={rep5}></img>
);

const CheckIcon = () => (
 <img src={rep6}></img>
);

const formatNum = (n) => n != null ? n.toLocaleString() : '—';

const StatCard = ({ label, value, icon, isLoading }) => (
  <div className="bg-white border border-accent-green-light rounded-2xl p-5 flex flex-col gap-1">
    <div className="flex justify-between items-start">
      <h2 className="font-medium text-[#273228] text-md">{label}</h2>
      <span className="text-gray-400">{icon}</span>
    </div>
    {isLoading ? (
      <div className="h-14 bg-gray-100 rounded-xl animate-pulse mt-1" />
    ) : (
      <span className="text-6xl font-semibold text-[#273228] mt-1">{value}</span>
    )}
  </div>
);

export default function ReportsAndAnalytics() {
  const { data, isLoading } = useGetAdminAnalytics();
  const analytics = data?.data;

  const STATS = [
    { label: "Total NOs",         value: formatNum(analytics?.summary?.totalNOs),          icon: <BuildingIcon /> },
    { label: "Total AOs",         value: formatNum(analytics?.summary?.totalAOs),           icon: <BuildingIcon /> },
    { label: "Villages Covered",  value: formatNum(analytics?.summary?.villagesCovered),    icon: <LocationIcon /> },
    { label: "Registered VLEs",   value: formatNum(analytics?.summary?.registeredVLEs),     icon: <PersonIcon /> },
    { label: "Active VLEs",       value: formatNum(analytics?.summary?.activeVLEs),         icon: <PersonIcon2 /> },
    { label: "Commercial VLEs",   value: formatNum(analytics?.summary?.commercialVLEs),     icon: <PersonIcon2 /> },
    { label: "Innovations Live",  value: formatNum(analytics?.summary?.innovationsLive),    icon: <BulbIcon /> },
    { label: "Innovators",        value: formatNum(analytics?.summary?.innovators),          icon: <CheckIcon /> },
    { label: "Problems Added",    value: formatNum(analytics?.summary?.problemsRegistered), icon: <CheckIcon /> },
    { label: "Problems Resolved", value: formatNum(analytics?.summary?.problemsResolved),   icon: <CheckIcon /> },
  ];

  return (
    <div className="">
      <h1 className="text-5xl font-regular text-[#273228] mb-6">Reports and Analytics</h1>
      <hr className="border-accent-green-light mb-8" />

      <h2 className="text-3xl font-normal text-[#273228] mb-1">Executive Summary</h2>
      <p className="text-gray-500 text-sm mb-6">Impact snapshot across the Innovation Guild ecosystem</p>

      <div className="grid grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <StatCard key={i} {...stat} isLoading={isLoading} />
        ))}
      </div>
       <hr className="border-accent-green-light my-8" />
       <Ecosystem />
       <ProblemStatement />
        <style>{`.recharts-wrapper,.recharts-wrapper *,.recharts-surface{outline:none !important;}`}</style>
        <div className="flex gap-6">
          <InnovationGrowth />
          <InnovatorGrowth />
        </div>
        <div className="flex gap-6">
          <VleInnovator />
        </div>
        <Categories />
        <Pipeline />
        <Map />
        <DetailedReports />
    </div>
  );
}
