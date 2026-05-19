import type { ComponentType } from "react";
import type { SVGProps } from "react";
import { Icon } from "@/components/Atoms/Icon";
import { cn } from "@/lib/utils";

export interface TechBadgeProps {
  name: string;
  category: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  iconColor?: string;
  className?: string;
}

export default function TechBadge({ name, category, icon, iconColor, className }: TechBadgeProps) {
  return (
    <div
      className={cn(
        "bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200 text-center hover:shadow-md transition-all duration-300 flex flex-col items-center gap-2",
        className
      )}
    >
      {icon && (
        <Icon 
          icon={icon} 
          size="lg" 
          className={iconColor ? "" : "text-gray-700"}
          style={iconColor ? { color: iconColor } : undefined}
        />
      )}
      <p className="font-semibold text-gray-900">{name}</p>
      <p className="text-sm text-gray-500 mt-1">{category}</p>
    </div>
  );
}

