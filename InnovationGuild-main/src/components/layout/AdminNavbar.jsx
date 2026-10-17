import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, LogOut, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router';
import { logout, selectUser } from '../../store/slices/authSlice';
import { clearToken } from '../../utils/tokenStore';
import { logoutAuth } from '../../api/auth';
import tech from '../../assets/icons/tech.svg'
import { useGetAdminNotifications } from '../../hooks/queries/admin'

const AdminNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectUser);
  const displayName = user?.fullName || user?.email || 'Admin';
  const displayRole = user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Administrator';

  const { data: notifData } = useGetAdminNotifications({ page: 1, limit: 1 })
  const unreadCount = notifData?.data?.unreadCount ?? 0

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutAuth().catch(() => {});
    dispatch(logout());
    clearToken();
    navigate('/admin/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#273228] h-[70px] px-8 flex items-center justify-between shadow-lg">
      {/* Logo Section */}
      <div className="flex items-center gap-3">
        <img src={tech} alt="Tech Dhaara Logo" className="h-10 w-auto" />
      </div>

      {/* User Section */}
      <div className="flex items-center gap-4">
        {/* Notification Icon */}
        <Link to="/admin/notifications" className="relative">
          <div className="relative cursor-pointer group">
            <Bell className={`w-6 h-6 transition-colors ${
              location.pathname === '/admin/notifications'
                ? 'text-accent-green'
                : 'text-page group-hover:text-accent-green'
            }`} />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#E34242] rounded-full border-2 border-button-dark"></div>
            )}
          </div>
        </Link>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-accent-green-dark flex items-center justify-center border border-white/20">
              <User size={18} className="text-white" />
            </div>
            <div className="hidden md:block text-left">
              <span className="block text-white text-sm font-medium leading-none mb-1">
                {displayName}
              </span>
              <span className="block text-white/60 text-[10px] leading-none">
                {displayRole}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-white transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
                }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Logged in as</p>
                <p className="text-sm font-medium text-primary break-all">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 cursor-pointer flex items-center gap-2 hover:bg-red-50 transition-colors text-black text-left group"
              >
                <LogOut className="w-[18px] h-[18px] text-[#E34242] group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium group-hover:text-red-600">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;