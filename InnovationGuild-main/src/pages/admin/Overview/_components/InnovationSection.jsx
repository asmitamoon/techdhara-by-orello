import React from 'react';
import { Link } from 'react-router';
import track from '../../../../assets/images/track.png';

const InnovationSection = ({ items = [] }) => {
  return (
    <div className="mb-8">
      <div className="bg-white p-4 rounded-2xl border border-accent-green-light">
        <h3 className="text-2xl font-normal mb-4">
          Innovations
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {items.map((innovation, index) => (
            <Link
              key={index}
              to={`/admin/innovations/${innovation.id}`}
              className="rounded-xl p-2 border border-accent-green-light flex items-center gap-2 transition-all "
            >
              <img src={innovation.image || track} className='w-20 h-20 object-cover rounded-lg' alt={innovation.title} />
              <div>
                <div className="font-medium text-base text-accent-green-dark mb-0.5 underline line-clamp-1">
                  {innovation.title}
                </div>
                <div className="text-sm line-clamp-1">
                  {innovation.subtitle}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InnovationSection;