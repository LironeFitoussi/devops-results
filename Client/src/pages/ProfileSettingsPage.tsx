import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Card } from "@/components/Atoms/Card";
import { Settings } from "lucide-react";
import { Icon } from "@/components/Atoms/Icon";

export default function ProfileSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Icon icon={Settings} size="lg" className="text-blue-600" />
          <Heading level={1}>Profile Settings</Heading>
        </div>
        <Text variant="lead" color="muted">
          Manage your profile settings and preferences
        </Text>
      </div>

      <div className="space-y-6">
        <Card>
          <Heading level={3} className="mb-4">Account Information</Heading>
          <Text color="muted">
            Update your account information and personal details.
          </Text>
        </Card>

        <Card>
          <Heading level={3} className="mb-4">Privacy Settings</Heading>
          <Text color="muted">
            Control your privacy and data sharing preferences.
          </Text>
        </Card>

        <Card>
          <Heading level={3} className="mb-4">Account Preferences</Heading>
          <Text color="muted">
            Customize your account experience and preferences.
          </Text>
        </Card>
      </div>
    </div>
  );
}

