import { CheckCircle2 } from "lucide-react";
import { Icon } from "@/components/Atoms/Icon";
import { Text } from "@/components/Atoms/Text";
import { cn } from "@/lib/utils";

export interface BenefitItemProps {
  text: string;
  className?: string;
}

export default function BenefitItem({ text, className }: BenefitItemProps) {
  return (
    <li className={cn("flex items-start gap-3", className)}>
      <Icon icon={CheckCircle2} size="md" className="text-green-600 flex-shrink-0 mt-0.5" />
      <Text variant="body" color="default">
        {text}
      </Text>
    </li>
  );
}

