import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface HeroProps {
  badge?: ReactNode;
  title: ReactNode;
  description: string;
  actions?: ReactNode;
  className?: string;
  variant?: "default" | "gradient";
}

const variantClasses = {
  default: "bg-white",
  gradient: "bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200",
};

export default function Hero({
  badge,
  title,
  description,
  actions,
  className,
  variant = "gradient",
}: HeroProps) {
  return (
    <section className={cn("relative overflow-hidden py-20 px-6", variantClasses[variant], className)}>
      <div className="max-w-7xl mx-auto text-center">
        {badge && <div className="mb-6">{badge}</div>}
        <div className="mb-6">{title}</div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          {description}
        </p>
        {actions && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}

