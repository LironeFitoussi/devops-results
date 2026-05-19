import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router";
import { cn } from "@/lib/utils";

export interface LinkProps {
  children: ReactNode;
  to: string;
  className?: string;
  variant?: "default" | "primary" | "muted";
  external?: boolean;
}

const variantClasses = {
  default: "text-gray-700 hover:text-blue-600",
  primary: "text-blue-600 hover:text-blue-700",
  muted: "text-gray-600 hover:text-gray-900",
};

export default function Link({ 
  children, 
  to, 
  className,
  variant = "default",
  external = false 
}: LinkProps) {
  const baseClasses = cn(
    "transition-colors",
    variantClasses[variant],
    className
  );

  if (external) {
    return (
      <a href={to} className={baseClasses} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <RouterLink to={to} className={baseClasses}>
      {children}
    </RouterLink>
  );
}

