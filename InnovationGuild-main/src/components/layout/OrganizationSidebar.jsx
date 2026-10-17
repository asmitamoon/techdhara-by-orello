import React, { useState, useMemo } from "react";
import { Link, useLocation } from "react-router";

import {
  LayoutDashboard,
  Users,
  FileText,
  Plane,
  Network,
} from "lucide-react";

const NAVBAR_HEIGHT = 70;

const OrganizationSidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Detect role based on current route prefix
  const isNoRole = location.pathname.startsWith('/no');
  const routePrefix = isNoRole ? '/no' : '/ao';

  // Dynamic menu items based on role
  const menuItems = useMemo(() => {
    const baseItems = [
      { icon: Users, label: "VLEs", path: `${routePrefix}/vles` },
      { icon: FileText, label: "Problems", path: `${routePrefix}/problems` },
      { icon: Plane, label: "Pilots", path: `${routePrefix}/pilots` },
    ];

    // Add "Affiliated Organizations" menu item only for NO role
    if (isNoRole) {
      return [
        { icon: Network, label: "Affiliated Organizations", path: "/no/affiliated-organizations" },
        ...baseItems
      ];
    }

    return baseItems;
  }, [isNoRole, routePrefix]);

  const activeItem = useMemo(() => {
    const path = location.pathname;
    if (path === routePrefix) return "Dashboard Overview";
    const matched = menuItems.find(item => item.path && (path === item.path || path.startsWith(item.path + "/")));
    return matched ? matched.label : "";
  }, [location.pathname, routePrefix, menuItems]);

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
          border-r border-[#769063]/30
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
          <Link to={routePrefix}
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
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={handleItemClick}
                    className={`w-full flex cursor-pointer items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
                      ${
                        activeItem === item.label
                          ? "bg-accent-green-dark text-white shadow-md shadow-accent-green-dark/20"
                          : "text-secondary hover:bg-header/50"
                      }`}
                  >
                    <IconComponent size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};

export default OrganizationSidebar;
