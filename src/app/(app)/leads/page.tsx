
'use client';

import { PageHeader } from '@/components/page-header';
import { LeadsTable } from '@/components/leads/leads-table';

export default function LeadsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Leads"
        description="Capture, qualify, and convert new opportunities."
      />
      <LeadsTable />
    </div>
  );
}

    