import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/redux/hooks";
import { ChevronDown, ChevronRight } from "lucide-react";
import { getSidebarMenuItems, routeConfig } from "@/config/routesConfig";
import type { SidebarMenuItem, SidebarSubMenuItem } from "@/config/routesConfig";

export default function Sidebar() {
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

  // Get menu items from shared route config
  const menuItems: SidebarMenuItem[] = getSidebarMenuItems(
    routeConfig,
    isAuthenticated,
    user?.role // Assuming user has a role property, adjust if needed
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
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-40">
      {/* Logo Section */}
      <div className="h-16 border-b border-gray-200 flex items-center px-6">
        <Link
          to="/"
          className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
        >
          YourApp
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const hasSubMenus = item.subMenus && item.subMenus.length > 0;
            const isExpanded = expandedMenus.has(item.label);
            const isItemActive = isActive(item.path) || isSubMenuActive(item.subMenus);

            return (
              <li key={item.label}>
                {hasSubMenus ? (
                  <>
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isItemActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    {isExpanded && (
                      <ul className="mt-1 ml-8 space-y-1">
                        {item.subMenus?.map((subMenu) => (
                          <li key={subMenu.path}>
                            <Link
                              to={subMenu.path}
                              className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                                isActive(subMenu.path)
                                  ? "bg-blue-50 text-blue-600 font-medium"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              {subMenu.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path || "#"}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
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

