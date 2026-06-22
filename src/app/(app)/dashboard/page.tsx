
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { Overview } from '@/components/dashboard/overview';
import { RecentJobs } from '@/components/dashboard/recent-jobs';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { LeadSourceChart } from '@/components/dashboard/lead-source-chart';

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader title="Dashboard" description="Here's a snapshot of your business today.">
        <Button asChild>
            <Link href="/leads">
                <PlusCircle className="mr-2 h-4 w-4" /> New Lead
            </Link>
        </Button>
      </PageHeader>
      <div className="space-y-6">
        <SummaryCards />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <Overview />
          </div>
          <div className="col-span-4 lg:col-span-3">
             <div className="grid gap-6">
                <LeadSourceChart />
                <RecentJobs />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
