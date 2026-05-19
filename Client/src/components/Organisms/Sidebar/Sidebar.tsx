import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/redux/hooks";
import { getSidebarMenuItems, routeConfig } from "@/config/routesConfig";
import type { SidebarMenuItem, SidebarSubMenuItem } from "@/config/routesConfig";
import { MenuItem } from "@/components/Molecules/MenuItem";

export interface SidebarProps {
  appName?: string;
  className?: string;
}

export default function Sidebar({ appName = "YourApp", className }: SidebarProps) {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();
  const { user } = useAppSelector((state) => state.user);
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  const menuItems: SidebarMenuItem[] = getSidebarMenuItems(
    routeConfig,
    isAuthenticated,
    user?.role
  );

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const isSubMenuActive = (subMenus?: SidebarSubMenuItem[]) => {
    if (!subMenus) return false;
    return subMenus.some((subMenu) => location.pathname === subMenu.path);
  };

  return (
    <aside className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-40 ${className || ""}`}>
      {/* Logo Section */}
      <div className="h-16 border-b border-gray-200 flex items-center px-6">
        <Link
          to="/"
          className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
        >
          {appName}
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isExpanded = expandedMenus.has(item.label);
            const isItemActive = isActive(item.path) || isSubMenuActive(item.subMenus);

            return (
              <MenuItem
                key={item.label}
                label={item.label}
                path={item.path}
                icon={item.icon}
                subMenus={item.subMenus?.map((sub) => ({ label: sub.label, path: sub.path }))}
                isExpanded={isExpanded}
                isActive={isItemActive}
                onToggle={() => toggleMenu(item.label)}
              />
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-200 p-4">
        {isAuthenticated ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-2">
              {user?.profilePicture && (
                <img
                  src={user.profilePicture}
                  alt={user.firstName}
                  className="w-10 h-10 rounded-full border-2 border-gray-200"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              variant="outline"
              className="w-full"
            >
              Logout
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => loginWithRedirect()}
            className="w-full"
          >
            Login
          </Button>
        )}
      </div>
    </aside>
  );
}

