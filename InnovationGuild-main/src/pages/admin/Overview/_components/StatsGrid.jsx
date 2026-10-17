import React from 'react';
import { useNavigate } from 'react-router';
import StatCard from './StatCard';
import dicon1 from '../../../../assets/icons/dicon1.svg';
import dicon2 from '../../../../assets/icons/dicon2.svg';
import dicon3 from '../../../../assets/icons/dicon3.svg';
import dicon4 from '../../../../assets/icons/dicon4.svg';
import dicon5 from '../../../../assets/icons/dicon5.svg';
import dicon6 from '../../../../assets/icons/dicon6.svg';
import dlogo8 from '../../../../assets/icons/dlogo8.svg';

const iconMap = {
  dicon1,
  dicon2,
  dicon3,
  dicon4,
  dicon5,
  dicon6,
  dlogo8
};

const linkMap = {
  'Total NOs': '/admin/nodal-organizations',
  'Total AOs': '/admin/affiliated-organizations',
  'Total VLEs': '/admin/vles',
  'Total Innovators': '/admin/innovators',
  'Total Innovations': '/admin/innovations',
  'Total Problem Statements': '/admin/problems',
  'Total Implementations': '/admin/pilots',
  'Interactions': '/admin/profile-visits'
};

const StatsGrid = ({ stats = [] }) => {
  const navigate = useNavigate();

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