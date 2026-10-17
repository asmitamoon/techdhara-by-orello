import { Bell } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router';
import tech from '../../assets/icons/tech.svg'
import { useGetMyNotifications } from '../../hooks/queries/common'

const OrganizationNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: notifData } = useGetMyNotifications({ page: 1, limit: 1 })
  const unreadCount = notifData?.data?.unreadCount ?? 0

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#273228] h-[70px] px-8 flex items-center justify-between shadow-lg">
      {/* Logo Section */}
      <div className="flex items-center gap-3">
        <img src={tech} alt="Tech Dhaara Logo" className="h-10 w-auto" />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notification Icon */}
        <Link
          to={`${location.pathname.startsWith('/no') ? '/no' : '/ao'}/notifications`}
          className="relative"
        >
          <div className="relative cursor-pointer group">
            <Bell className={`w-6 h-6 transition-colors ${
              location.pathname.endsWith('/notifications')
                ? 'text-accent-green'
                : 'text-page group-hover:text-accent-green'
            }`} />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#E34242] rounded-full border-2 border-button-dark"></div>
            )}
          </div>
        </Link>

        {/* Back to Website Button */}
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 text-sm font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          Back to Website
        </button>
      </div>
    </nav>
  );
};

export default OrganizationNavbar;
