import type { ReactNode } from "react";
import { Link } from "react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Icon } from "@/components/Atoms/Icon";
import { cn } from "@/lib/utils";

export interface MenuItemProps {
  label: string;
  path?: string;
  icon?: ReactNode;
  subMenus?: Array<{ label: string; path: string }>;
  isExpanded?: boolean;
  isActive?: boolean;
  isCollapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

export default function MenuItem({
  label,
  path,
  icon,
  subMenus,
  isExpanded = false,
  isActive = false,
  isCollapsed = false,
  onToggle,
  className,
}: MenuItemProps) {
  const hasSubMenus = subMenus && subMenus.length > 0;

  return (
    <li className={className}>
      {hasSubMenus ? (
        <>
          <button
            onClick={onToggle}
            title={isCollapsed ? label : undefined}
            aria-label={label}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isCollapsed && "justify-center px-2",
              isActive
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <div className={cn("flex items-center gap-3", isCollapsed && "gap-0")}>
              {icon}
              {!isCollapsed && <span>{label}</span>}
            </div>
            {!isCollapsed &&
              (isExpanded ? (
                <Icon icon={ChevronDown} size="sm" />
              ) : (
                <Icon icon={ChevronRight} size="sm" />
              ))}
          </button>
          {!isCollapsed && isExpanded && (
            <ul className="mt-1 ml-8 space-y-1">
              {subMenus.map((subMenu) => (
                <li key={subMenu.path}>
                  <Link
                    to={subMenu.path}
                    className="block px-3 py-2 rounded-md text-sm transition-colors text-gray-600 hover:bg-gray-100"
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
          to={path || "#"}
          title={isCollapsed ? label : undefined}
          aria-label={label}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isCollapsed && "justify-center gap-0 px-2",
            isActive
              ? "bg-blue-50 text-blue-600"
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          {icon}
          {!isCollapsed && <span>{label}</span>}
        </Link>
      )}
    </li>
  );
}

