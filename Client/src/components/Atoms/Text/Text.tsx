import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TextProps {
  children: ReactNode;
  variant?: "body" | "lead" | "small" | "caption";
  className?: string;
  color?: "default" | "muted" | "primary";
}

const variantClasses = {
  body: "text-base",
  lead: "text-lg",
  small: "text-sm",
  caption: "text-xs",
};

const colorClasses = {
  default: "text-gray-900",
  muted: "text-gray-600",
  primary: "text-blue-600",
};

export default function Text({ 
  children, 
  variant = "body",
  className,
  color = "default"
}: TextProps) {
  return (
    <p
      className={cn(
        variantClasses[variant],
        colorClasses[color],
        className
      )}
    >
      {children}
    </p>
  );
}

