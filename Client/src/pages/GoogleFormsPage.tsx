import { FileText } from "lucide-react";
import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Icon } from "@/components/Atoms/Icon";
import { GoogleFormsPanel } from "@/components/Organisms/GoogleFormsPanel";

export default function GoogleFormsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Icon icon={FileText} size="lg" className="text-blue-600" />
          <Heading level={1}>Google Forms</Heading>
        </div>
        <Text variant="lead" color="muted">
          Read your Google Forms and their responses.
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <GoogleFormsPanel />
      </div>
    </div>
  );
}
