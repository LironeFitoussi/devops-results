import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Card } from "@/components/Atoms/Card";
import { FileText } from "lucide-react";
import { Icon } from "@/components/Atoms/Icon";

export default function DashboardReportsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Icon icon={FileText} size="lg" className="text-blue-600" />
          <Heading level={1}>Reports</Heading>
        </div>
        <Text variant="lead" color="muted">
          Generate and view detailed reports
        </Text>
      </div>

      <div className="space-y-6">
        <Card hover>
          <Heading level={3} className="mb-2">Monthly Report</Heading>
          <Text color="muted" className="mb-4">
            Comprehensive monthly performance report
          </Text>
          <Text variant="small" color="muted">
            Last generated: January 2024
          </Text>
        </Card>

        <Card hover>
          <Heading level={3} className="mb-2">User Activity Report</Heading>
          <Text color="muted" className="mb-4">
            Detailed user activity and engagement metrics
          </Text>
          <Text variant="small" color="muted">
            Last generated: January 2024
          </Text>
        </Card>

        <Card hover>
          <Heading level={3} className="mb-2">Financial Report</Heading>
          <Text color="muted" className="mb-4">
            Revenue and financial performance analysis
          </Text>
          <Text variant="small" color="muted">
            Last generated: January 2024
          </Text>
        </Card>
      </div>
    </div>
  );
}

