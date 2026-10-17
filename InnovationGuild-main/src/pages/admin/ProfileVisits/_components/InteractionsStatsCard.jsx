import React from 'react';
import peoples2 from '../../../../assets/icons/peoples2.svg';

const InteractionsStatsCard = ({ count }) => {
  return (
    <div className="w-[220px] rounded-xl border border-accent-green-light bg-white p-5">
      <div className="flex items-center justify-between text-md text-black">
        <span>Profile Interactions</span>
        <img src={peoples2} alt="interactions" />
      </div>
      <div className="mt-4 text-4xl font-semibold text-[#1F3D1A]">
        {count}
      </div>
    </div>
  );
};

export default InteractionsStatsCard;
