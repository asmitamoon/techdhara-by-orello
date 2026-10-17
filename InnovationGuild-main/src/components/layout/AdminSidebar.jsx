import React, { useState, useMemo } from "react";
import { Link, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { selectUserRole } from "../../store/slices/authSlice";

import {
  LayoutDashboard,
  Building2,
  Network,
  Users,
  UserPlus,
  Lightbulb,
  FileText,
  TrendingUp,
  Settings,
  Plane,
  Eye,
  Mail,
} from "lucide-react";

const NAVBAR_HEIGHT = 70; 

const AdminSidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const userRole = useSelector(selectUserRole);

  const menuItems = [
    { icon: Building2, label: "Nodal Organizations", path: "/admin/nodal-organizations" },
    { icon: Network, label: "Affiliated Organizations",path: "/admin/affiliated-organizations" },
    { icon: Users, label: "VLEs", path: "/admin/vles" },
    { icon: UserPlus, label: "Innovators", path: "/admin/innovators" },
    { icon: Lightbulb, label: "Innovations", path: "/admin/innovations" },
    { icon: Plane, label: "Pilots", path:"/admin/pilots" },
    { icon: FileText, label: "Problems",path: "/admin/problems" },
    { icon: Eye, label: "Profile Visits", path: "/admin/profile-visits" },
    { icon: TrendingUp, label: "Reports", path: "/admin/report-analitics" },
    { icon: Mail, label: "Newsletter", path: "/admin/newsletter" },
  ];

  const activeItem = useMemo(() => {
    const path = location.pathname;
    if (path === "/admin") return "Dashboard Overview";
    if (path === "/admin/admin-management") return "Admin Management";
    const matched = menuItems.find(item => item.path && (path === item.path || path.startsWith(item.path + "/")));
    return matched ? matched.label : "";
  }, [location.pathname]);

  const handleItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <aside
        style={{
          top: NAVBAR_HEIGHT,
          height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
        }}
        className={`
          fixed 
          left-0
          bg-page
          border-r border-accent-green-light
          w-72
          flex flex-col
          transition-transform duration-300
          z-40
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Top Section */}
        <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-hide">
          {/* Dashboard Overview */}
          <Link to="/admin"
            onClick={handleItemClick}
            className={`w-full flex items-center cursor-pointer gap-3 px-4 py-3 rounded-xl mb-6 transition-all duration-200
              ${
                activeItem === "Dashboard Overview"
                  ? "bg-accent-green-dark text-white shadow-md shadow-accent-green-dark/20"
                  : "text-secondary hover:bg-header/50"
              }`}
          >
            <LayoutDashboard size={20} />
            <span className="text-sm font-semibold">Dashboard Overview</span>
          </Link>

          {/* Menu Items */}
          <div className="space-y-1">
            <p className="px-4 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Management</p>
            <nav className="space-y-1">
              {menuItems.map(({ icon: Icon, label, path }) => (
                <Link
                  key={label}
                  to={path}
                  onClick={handleItemClick}
                  className={`w-full flex cursor-pointer items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
                    ${
                      activeItem === label
                        ? "bg-accent-green-dark text-white shadow-md shadow-accent-green-dark/20"
                        : "text-secondary hover:bg-header/50"
                    }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        {userRole === 'super_admin' && (
          <div className="border-t border-accent-green-light p-4">
            <Link to="/admin/admin-management"
              onClick={handleItemClick}
              className={`w-full flex items-center cursor-pointer gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
                ${
                  activeItem === "Admin Management"
                    ? "bg-accent-green-dark text-white shadow-md shadow-accent-green-dark/20"
                    : "text-secondary hover:bg-header/50"
                }`}
            >
              <Settings size={18} />
              <span className="text-sm font-medium">Admin Management</span>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
};

export default AdminSidebar;