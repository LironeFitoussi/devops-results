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
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <div className="flex items-center gap-3">
              {icon}
              <span>{label}</span>
            </div>
            {isExpanded ? (
              <Icon icon={ChevronDown} size="sm" />
            ) : (
              <Icon icon={ChevronRight} size="sm" />
            )}
          </button>
          {isExpanded && (
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
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isActive
              ? "bg-blue-50 text-blue-600"
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          {icon}
          <span>{label}</span>
        </Link>
      )}
    </li>
  );
}

