import type { ReactNode } from "react";
import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { cn } from "@/lib/utils";

export interface SectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  variant?: "default" | "gradient";
}

const variantClasses = {
  default: "bg-background",
  gradient: "bg-gradient-to-br from-blue-50 to-blue-100",
};

export default function Section({
  title,
  subtitle,
  children,
  className,
  titleClassName,
  variant = "default",
}: SectionProps) {
  return (
    <section className={cn("py-20 px-6", variantClasses[variant], className)}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Heading level={2} className={titleClassName}>
            {title}
          </Heading>
          {subtitle && (
            <Text variant="lead" color="muted" className="max-w-2xl mx-auto mt-4">
              {subtitle}
            </Text>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

