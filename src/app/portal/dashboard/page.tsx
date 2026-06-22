

import { PageHeader } from '@/components/page-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getJobsForCustomer, getCustomer, getTeamMember } from '@/lib/data';
import { formatDate } from '@/lib/utils';
import { notFound } from 'next/navigation';

export default function CustomerDashboardPage() {
  // For demonstration, we'll fetch data for a specific customer.
  // In a real app, you would get the logged-in customer's ID.
  const customerId = 'cust-1';
  const customer = getCustomer(customerId);

  if (!customer) {
    notFound();
  }

  const jobs = getJobsForCustomer(customer.id);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={`Welcome, ${customer.name}`}
        description="Here is your service history with us."
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => {
                const technician = getTeamMember(job.technicianId);
                return (
                    <TableRow key={job.id}>
                    <TableCell>{formatDate(job.scheduledDate)}</TableCell>
                    <TableCell>{job.serviceType}</TableCell>
                    <TableCell>
                        <Badge variant="outline">{job.status}</Badge>
                    </TableCell>
                    <TableCell>{technician?.name || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                        {job.invoiceAmount
                        ? `$${job.invoiceAmount.toFixed(2)}`
                        : 'N/A'}
                    </TableCell>
                    </TableRow>
                )
              })}
              {jobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    You have no job history.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
