import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "outlined" | "elevated";
  hover?: boolean;
}

const variantClasses = {
  default: "bg-white",
  outlined: "bg-white border border-gray-200",
  elevated: "bg-white shadow-md",
};

export default function Card({ 
  children, 
  className, 
  variant = "default",
  hover = false 
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-all duration-300",
        variantClasses[variant],
        hover && "hover:shadow-lg hover:border-gray-300",
        className
      )}
    >
      {children}
    </div>
  );
}

