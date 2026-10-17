import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import StatCard from './StatCard';
import dicon3 from '../../../../assets/icons/dicon3.svg';
import dicon4 from '../../../../assets/icons/dicon4.svg';
import dicon6 from '../../../../assets/icons/dicon6.svg';
import dlogo8 from '../../../../assets/icons/dlogo8.svg';

const iconMap = {
  dicon3,
  dicon4,
  dicon6,
  dlogo8
};

const StatsGrid = ({ stats = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const routePrefix = location.pathname.startsWith('/no') ? '/no' : '/ao';

  const linkMap = {
    'Total AOs': `${routePrefix}/affiliated-organizations`,
    'Total VLEs': `${routePrefix}/vles`,
    'Total Problem Statements': `${routePrefix}/problems`,
    'Total Implementations': `${routePrefix}/pilots`,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          label={stat.label}
          value={stat.value}
          icon={iconMap[stat.iconName] || dicon3}
          onClick={() => linkMap[stat.label] && navigate(linkMap[stat.label])}
        />
      ))}
    </div>
  );
};

export default StatsGrid;