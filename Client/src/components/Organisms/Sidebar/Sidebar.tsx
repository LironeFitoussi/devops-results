import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { LogIn, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/redux/hooks";
import { getSidebarMenuItems, routeConfig } from "@/config/routesConfig";
import type { SidebarMenuItem, SidebarSubMenuItem } from "@/config/routesConfig";
import { MenuItem } from "@/components/Molecules/MenuItem";
import { cn } from "@/lib/utils";

export interface SidebarProps {
  appName?: string;
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
  className?: string;
}

export default function Sidebar({
  appName = "YourApp",
  isCollapsed = false,
  onToggleCollapsed,
  className,
}: SidebarProps) {
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
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Logo Section */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-gray-200",
          isCollapsed ? "justify-center px-3" : "justify-between px-6"
        )}
      >
        {!isCollapsed && (
          <Link
            to="/"
            className="truncate text-xl font-bold text-gray-800 transition-colors hover:text-blue-600"
          >
            {appName}
          </Link>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleCollapsed}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="shrink-0"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className={cn("space-y-1", isCollapsed ? "px-2" : "px-3")}>
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
                isCollapsed={isCollapsed}
                onToggle={() => toggleMenu(item.label)}
              />
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className={cn("border-t border-gray-200", isCollapsed ? "p-3" : "p-4")}>
        {isAuthenticated ? (
          <div className="space-y-3">
            <div
              className={cn(
                "flex items-center gap-3 px-2",
                isCollapsed && "justify-center px-0"
              )}
            >
              {user?.profilePicture && (
                <img
                  src={user.profilePicture}
                  alt={user.firstName}
                  className="w-10 h-10 rounded-full border-2 border-gray-200"
                />
              )}
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
              )}
            </div>
            <Button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              variant="outline"
              size={isCollapsed ? "icon" : "default"}
              className={isCollapsed ? "mx-auto" : "w-full"}
              aria-label="Logout"
              title={isCollapsed ? "Logout" : undefined}
            >
              {isCollapsed ? <LogOut className="h-4 w-4" /> : "Logout"}
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => loginWithRedirect()}
            size={isCollapsed ? "icon" : "default"}
            className={isCollapsed ? "mx-auto" : "w-full"}
            aria-label="Login"
            title={isCollapsed ? "Login" : undefined}
          >
            {isCollapsed ? <LogIn className="h-4 w-4" /> : "Login"}
          </Button>
        )}
      </div>
    </aside>
  );
}

