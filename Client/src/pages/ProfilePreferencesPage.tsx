import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Card } from "@/components/Atoms/Card";
import { Sliders } from "lucide-react";
import { Icon } from "@/components/Atoms/Icon";

export default function ProfilePreferencesPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Icon icon={Sliders} size="lg" className="text-blue-600" />
          <Heading level={1}>Preferences</Heading>
        </div>
        <Text variant="lead" color="muted">
          Customize your application preferences and settings
        </Text>
      </div>

      <div className="space-y-6">
        <Card>
          <Heading level={3} className="mb-4">Display Preferences</Heading>
          <Text color="muted">
            Adjust display settings, theme, and appearance options.
          </Text>
        </Card>

        <Card>
          <Heading level={3} className="mb-4">Language & Region</Heading>
          <Text color="muted">
            Set your preferred language and regional settings.
          </Text>
        </Card>

        <Card>
          <Heading level={3} className="mb-4">Accessibility</Heading>
          <Text color="muted">
            Configure accessibility options and features.
          </Text>
        </Card>
      </div>
    </div>
  );
}

