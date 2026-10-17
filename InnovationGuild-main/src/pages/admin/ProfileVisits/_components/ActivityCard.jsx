import { Eye, User } from 'lucide-react';
import { Link } from 'react-router';

const getProfileLink = (role, id) =>
  role === 'VLE' ? `/admin/vles/${id}` : `/admin/innovators/${id}`;

const ActivityCard = ({ activity }) => {
  const { viewer, viewerId, viewerRole, target, targetId, targetRole } = activity;

  return (
    <div className="flex items-start gap-4 rounded-xl border border-accent-green-light bg-white p-4">
      {/* Avatar */}
      <div className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${viewerRole === 'VLE' ? 'bg-blue-100' : 'bg-green-100'}`}>
        <User className="h-5 w-5 text-green-700" />
      </div>

      {/* Content */}
      <div className="flex-1">
        <p className="text-sm text-gray-700">
          <Link to={getProfileLink(viewerRole, viewerId)} className="font-medium hover:underline">
            {viewer}
          </Link>{" "}
          <span className="text-gray-500">({viewerRole})</span>{" "}
          <span className="text-gray-500">viewed</span>{" "}
          <Link to={getProfileLink(targetRole, targetId)} className="font-medium text-green-700 hover:underline">
            {target}
          </Link>{" "}
          <span className="text-gray-500">({targetRole})</span>
        </p>

        <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{targetRole} profile</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
