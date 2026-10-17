import React from 'react';

const StatCard = ({ label, value, icon, onClick }) => (
  <div onClick={onClick} className="p-6 rounded-xl cursor-pointer shadow-sm border bg-white border-accent-green-light">
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-medium">
        {label}
      </span>
      <img src={icon} alt={label} />
    </div>
    <div className="text-7xl font-medium text-[#2B2B2B]">
      {value}
    </div>
  </div>
);

export default StatCard;
