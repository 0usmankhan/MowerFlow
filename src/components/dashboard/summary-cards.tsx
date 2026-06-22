
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, FileText, Activity } from 'lucide-react';

const kpiData = [
  {
    title: 'New Leads',
    value: '12',
    change: '+18.2% from last month',
    icon: Users,
  },
  {
    title: 'Upcoming Jobs',
    value: '8',
    change: '+5 since yesterday',
    icon: Calendar,
  },
  {
    title: 'Pending Invoices',
    value: '$2,420',
    change: '3 overdue',
    icon: FileText,
  },
  {
    title: 'Completed Today',
    value: '5',
    change: '$1,250 revenue',
    icon: Activity,
  },
];

export function SummaryCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpiData.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground">{kpi.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
