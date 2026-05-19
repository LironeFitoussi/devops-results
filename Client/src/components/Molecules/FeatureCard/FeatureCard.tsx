import type { ComponentType } from "react";
import type { SVGProps } from "react";
import { Card } from "@/components/Atoms/Card";
import { Icon } from "@/components/Atoms/Icon";
import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { cn } from "@/lib/utils";

export interface FeatureCardProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  iconColor?: string;
  iconBgColor?: string;
  className?: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-50",
  className,
}: FeatureCardProps) {
  return (
    <Card variant="outlined" hover className={className}>
      <div className={cn("w-12 h-12", iconBgColor, "rounded-xl flex items-center justify-center mb-4")}>
        <Icon icon={icon} size="lg" className={iconColor} />
      </div>
      <Heading level={3} className="mb-2">
        {title}
      </Heading>
      <Text variant="body" color="muted">
        {description}
      </Text>
    </Card>
  );
}

