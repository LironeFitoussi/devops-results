import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Card } from "@/components/Atoms/Card";
import { BarChart3 } from "lucide-react";
import { Icon } from "@/components/Atoms/Icon";

export default function DashboardAnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Icon icon={BarChart3} size="lg" className="text-blue-600" />
          <Heading level={1}>Analytics</Heading>
        </div>
        <Text variant="lead" color="muted">
          View detailed analytics and performance metrics
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Heading level={3} className="mb-4">User Analytics</Heading>
          <Text color="muted">
            Track user engagement, growth, and behavior patterns.
          </Text>
        </Card>

        <Card>
          <Heading level={3} className="mb-4">Performance Metrics</Heading>
          <Text color="muted">
            Monitor application performance and response times.
          </Text>
        </Card>

        <Card>
          <Heading level={3} className="mb-4">Traffic Analysis</Heading>
          <Text color="muted">
            Analyze traffic sources, page views, and user flow.
          </Text>
        </Card>

        <Card>
          <Heading level={3} className="mb-4">Conversion Rates</Heading>
          <Text color="muted">
            Track conversion rates and key performance indicators.
          </Text>
        </Card>
      </div>
    </div>
  );
}

