import StatsGrid from './_components/StatsGrid';
import InnovationSection from './_components/InnovationSection';
import VleSection from './_components/VleSection';
import ProblemStatementSection from './_components/ProblemStatementSection';
import PageLoader from '../../../components/ui/PageLoader';
import graph from '../../../assets/icons/graph.svg';
import { useGetAdminOverview } from '../../../hooks/queries/admin';
import { getStateName, getDistrictName } from '../../../utils/LocationData/locationData';

const DashboardOverview = () => {
  const { data, isLoading } = useGetAdminOverview();

  if (isLoading) return <PageLoader />;

  const rawStats = data?.data?.stats ?? {};
  const recentApprovals = data?.data?.recentApprovals ?? { innovations: [], vles: [], problems: [] };

  const stats = [
    { label: 'Total NOs',                value: String(rawStats.totalNOs             ?? 0), iconName: 'dicon1' },
    { label: 'Total AOs',                value: String(rawStats.totalAOs             ?? 0), iconName: 'dicon2' },
    { label: 'Total VLEs',               value: String(rawStats.totalVLEs            ?? 0), iconName: 'dicon3' },
    { label: 'Total Innovators',         value: String(rawStats.totalInnovators      ?? 0), iconName: 'dicon4' },
    { label: 'Total Innovations',        value: String(rawStats.totalInnovations     ?? 0), iconName: 'dicon5' },
    { label: 'Total Problem Statements', value: String(rawStats.totalProblems        ?? 0), iconName: 'dicon6' },
    { label: 'Total Implementations',    value: String(rawStats.totalImplementations ?? 0), iconName: 'dlogo8' },
    { label: 'Interactions',             value: String(rawStats.totalInteractions    ?? 0), iconName: 'dicon3' },
  ];

  const vles = (recentApprovals.vles || []).map(v => ({
    ...v,
    location: [getStateName(v.stateCode), getDistrictName(v.districtCode, v.stateCode)].filter(Boolean).join(', '),
  }));

  return (
    <div className="bg-page">
      <div className="container">
        <h1 className="text-6xl font-regular mb-6">
          Dashboard Overview
        </h1>

        <div className="border-t mb-6 border-accent-green-dark"></div>
        <StatsGrid stats={stats} />
        <div className="border-b mt-6 border-accent-green-dark"></div>

        <div className="mt-10">
          <h2 className="text-4xl font-regular mb-6 flex items-center">
            <span className="w-8 h-8 rounded-md flex items-center justify-center mr-3">
              <img src={graph} alt="graph" />
            </span>
            Recent Approvals
          </h2>

          <InnovationSection items={recentApprovals.innovations} />
          <VleSection items={vles} />
          <ProblemStatementSection items={recentApprovals.problems} />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
