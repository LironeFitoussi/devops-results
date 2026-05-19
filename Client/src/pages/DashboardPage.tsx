import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Card } from "@/components/Atoms/Card";
import { LayoutDashboard, TrendingUp, Users, Activity } from "lucide-react";
import { Icon } from "@/components/Atoms/Icon";

export default function DashboardPage() {
  const stats = [
    { label: "Total Users", value: "1,234", icon: Users, color: "text-blue-600" },
    { label: "Active Sessions", value: "567", icon: Activity, color: "text-green-600" },
    { label: "Growth Rate", value: "+12.5%", icon: TrendingUp, color: "text-purple-600" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Icon icon={LayoutDashboard} size="lg" className="text-blue-600" />
          <Heading level={1}>Dashboard Overview</Heading>
        </div>
        <Text variant="lead" color="muted">
          Welcome to your dashboard. Here's an overview of your application.
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} hover>
            <div className="flex items-center justify-between">
              <div>
                <Text variant="small" color="muted" className="mb-1">
                  {stat.label}
                </Text>
                <Heading level={2} className="text-3xl">
                  {stat.value}
                </Heading>
              </div>
              <Icon icon={stat.icon} size="xl" className={stat.color} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Heading level={3} className="mb-4">Recent Activity</Heading>
          <Text color="muted">
            View your recent activity and updates.
          </Text>
        </Card>

        <Card>
          <Heading level={3} className="mb-4">Quick Actions</Heading>
          <Text color="muted">
            Access frequently used actions and shortcuts.
          </Text>
        </Card>
      </div>
    </div>
  );
}

