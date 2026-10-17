import { useLocation } from 'react-router';
import StatsGrid from './_components/StatsGrid';
import VleSection from './_components/VleSection';
import ProblemStatementSection from './_components/ProblemStatementSection';
import PageLoader from '../../../components/ui/PageLoader';
import graph from '../../../assets/icons/graph.svg';
import { useGetOrgOverview } from '../../../hooks/queries/org';
import { getStateName, getDistrictName } from '../../../utils/LocationData/locationData';

const OrganizationOverview = () => {
  const location = useLocation();
  const isNoRole = location.pathname.startsWith('/no');

  const { data, isLoading } = useGetOrgOverview();

  if (isLoading) return <PageLoader />;

  const stats = data?.data?.stats ?? {};
  const recentApprovals = data?.data?.recentApprovals ?? { vles: [], problems: [] };

  const baseStats = [
    { label: 'Total VLEs', value: String(stats.totalVLEs ?? 0), iconName: 'dicon3' },
    { label: 'Total Problem Statements', value: String(stats.totalProblems ?? 0), iconName: 'dicon6' },
    { label: 'Total Implementations', value: String(stats.totalImplementations ?? 0), iconName: 'dlogo8' }
  ];

  const statsData = isNoRole
    ? [{ label: 'Total AOs', value: String(stats.totalAOs ?? 0), iconName: 'dicon4' }, ...baseStats]
    : baseStats;

  return (
    <div className="bg-page">
      <div>
        <h1 className="text-6xl font-regular mb-6">
          Dashboard Overview
        </h1>

        <div className="border-t mb-6 border-accent-green-dark"></div>
        <StatsGrid stats={statsData} />
        <div className="border-b mt-6 border-accent-green-dark"></div>

        <div className="mt-10">
          <h2 className="text-4xl font-regular mb-6 flex items-center">
            <span className="w-8 h-8 rounded-md flex items-center justify-center mr-3">
              <img src={graph} alt="graph" />
            </span>
            Recent Approvals
          </h2>

          <VleSection items={(recentApprovals.vles || []).map(v => ({
            ...v,
            location: [getStateName(v.stateCode), getDistrictName(v.districtCode, v.stateCode)].filter(Boolean).join(', ')
          }))} />
          <ProblemStatementSection items={recentApprovals.problems} />
        </div>
      </div>
    </div>
  );
};

export default OrganizationOverview;