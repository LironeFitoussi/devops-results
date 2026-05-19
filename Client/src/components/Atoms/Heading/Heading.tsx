import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface HeadingProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  gradient?: boolean;
}

const levelClasses = {
  1: "text-5xl md:text-6xl font-bold",
  2: "text-4xl font-bold",
  3: "text-3xl font-semibold",
  4: "text-2xl font-semibold",
  5: "text-xl font-semibold",
  6: "text-lg font-semibold",
};

export default function Heading({ 
  children, 
  level = 1, 
  className,
  gradient = false 
}: HeadingProps) {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  const baseClasses = levelClasses[level];
  
  return (
    <Tag
      className={cn(
        baseClasses,
        gradient && "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500",
        !gradient && "text-foreground",
        className
      )}
    >
      {children}
    </Tag>
  );
}

