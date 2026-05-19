import type { ComponentType } from "react";
import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

export interface IconProps extends SVGProps<SVGSVGElement> {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
};

export default function Icon({ 
  icon: IconComponent, 
  size = "md", 
  className,
  ...props 
}: IconProps) {
  return (
    <IconComponent
      className={cn(sizeClasses[size], className)}
      {...props}
    />
  );
}

