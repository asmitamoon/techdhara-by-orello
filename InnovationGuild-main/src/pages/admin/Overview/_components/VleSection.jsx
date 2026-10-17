import React from 'react';
import { Link } from 'react-router';
import { Users } from 'lucide-react';

const VleSection = ({ items = [] }) => {
  return (
    <div className="mb-8 bg-white p-4 border border-accent-green-light rounded-3xl">
      <h3 className="text-2xl font-normal mb-4">
        VLEs
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((vle, index) => (
          <Link
            key={index}
            to={`/admin/vles/${vle.id}`}
            className="flex items-center gap-2 rounded-xl p-2 bg-white border border-accent-green-light transition-all hover:bg-accent-green/5"
          >
            <div
              className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center"
              style={{ backgroundColor: '#E8E8E8' }}
            >
              <Users className="w-6 h-6" style={{ color: '#5E9E26' }} />
            </div>
            <div>
              <p className="font-medium text-base text-accent-green-dark line-clamp-1 underline">{vle.name}</p>
              <p className="text-sm text-black font-medium line-clamp-1">{vle.location}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VleSection;