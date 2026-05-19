import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Card } from "@/components/Atoms/Card";
import { Bell, Mail, MessageSquare } from "lucide-react";
import { Icon } from "@/components/Atoms/Icon";

export default function NotificationsSettingsPage() {
  const notificationTypes = [
    { icon: Mail, title: "Email Notifications", description: "Configure email notification preferences" },
    { icon: Bell, title: "Push Notifications", description: "Manage push notification settings" },
    { icon: MessageSquare, title: "In-App Notifications", description: "Control in-app notification display" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Icon icon={Bell} size="lg" className="text-blue-600" />
          <Heading level={1}>Notification Settings</Heading>
        </div>
        <Text variant="lead" color="muted">
          Manage how and when you receive notifications
        </Text>
      </div>

      <div className="space-y-6">
        {notificationTypes.map((type, index) => (
          <Card key={index} hover>
            <div className="flex items-start gap-4">
              <Icon icon={type.icon} size="lg" className="text-blue-600 flex-shrink-0" />
              <div>
                <Heading level={3} className="mb-2">{type.title}</Heading>
                <Text color="muted">{type.description}</Text>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

