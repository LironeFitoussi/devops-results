import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Card } from "@/components/Atoms/Card";
import { Settings } from "lucide-react";
import { Icon } from "@/components/Atoms/Icon";

export default function GeneralSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Icon icon={Settings} size="lg" className="text-blue-600" />
          <Heading level={1}>General Settings</Heading>
        </div>
        <Text variant="lead" color="muted">
          Configure general application settings
        </Text>
      </div>

      <div className="space-y-6">
        <Card>
          <Heading level={3} className="mb-4">Application Settings</Heading>
          <Text color="muted">
            Configure basic application preferences and defaults.
          </Text>
        </Card>

        <Card>
          <Heading level={3} className="mb-4">Regional Settings</Heading>
          <Text color="muted">
            Set timezone, date format, and regional preferences.
          </Text>
        </Card>

        <Card>
          <Heading level={3} className="mb-4">Default Preferences</Heading>
          <Text color="muted">
            Manage default settings for new users and sessions.
          </Text>
        </Card>
      </div>
    </div>
  );
}

