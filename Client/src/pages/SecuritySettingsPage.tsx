import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Card } from "@/components/Atoms/Card";
import { Shield, Lock, KeyRound } from "lucide-react";
import { Icon } from "@/components/Atoms/Icon";

export default function SecuritySettingsPage() {
  const securityFeatures = [
    { icon: Lock, title: "Password Management", description: "Change your password and manage password policies" },
    { icon: Shield, title: "Two-Factor Authentication", description: "Enable 2FA for enhanced account security" },
    { icon: KeyRound, title: "API Keys", description: "Manage your API keys and access tokens" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Icon icon={Shield} size="lg" className="text-blue-600" />
          <Heading level={1}>Security Settings</Heading>
        </div>
        <Text variant="lead" color="muted">
          Manage your account security and authentication settings
        </Text>
      </div>

      <div className="space-y-6">
        {securityFeatures.map((feature, index) => (
          <Card key={index} hover>
            <div className="flex items-start gap-4">
              <Icon icon={feature.icon} size="lg" className="text-blue-600 flex-shrink-0" />
              <div>
                <Heading level={3} className="mb-2">{feature.title}</Heading>
                <Text color="muted">{feature.description}</Text>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

