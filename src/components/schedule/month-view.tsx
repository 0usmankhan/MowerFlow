
'use client';

import * as React from 'react';
import { format, isSameMonth } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Customer, Job, JobStatus, TeamMember } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

const statusColors: Record<JobStatus, string> = {
  Scheduled: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300',
  'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300',
  Completed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300',
  Invoiced: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300',
  Paid: 'bg-gray-200 text-gray-800 border-gray-300 dark:bg-gray-700/50 dark:text-gray-400',
};


function CalendarJob({ job }: { job: Job }) {
  const firestore = useFirestore();

  const customerRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'customers', job.customerId) : null,
    [firestore, job.customerId]
  );
  const { data: customer, isLoading: isCustomerLoading } = useDoc<Customer>(customerRef);

  const technicianRef = useMemoFirebase(() =>
    firestore && job.technicianId ? doc(firestore, 'technicians', job.technicianId) : null,
    [firestore, job.technicianId]
  );
  const { data: technician, isLoading: isTechLoading } = useDoc<TeamMember>(technicianRef);

  if (isCustomerLoading || isTechLoading) {
    return <Skeleton className="h-16 w-full mb-1" />
  }

  if (!customer) return null;

  return (
    <div className={cn("text-xs p-1 mb-1 rounded-md border", statusColors[job.status])}>
      <p className="font-semibold truncate">{job.serviceType}</p>
      <p className="text-muted-foreground truncate">{customer.name}</p>
      {technician && <p className="text-muted-foreground truncate font-medium">{technician.name}</p>}
    </div>
  );
}

interface MonthViewProps {
    currentDate: Date;
    onDateChange: (date: Date) => void;
    jobsByDate: Record<string, Job[]>;
}

export function MonthView({ currentDate, onDateChange, jobsByDate }: MonthViewProps) {
  
  const DayWithJobs = ({ date, displayMonth }: { date: Date, displayMonth: Date}) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const jobsForDay = jobsByDate[dateKey] || [];
    const isCurrentMonth = isSameMonth(date, displayMonth);

    return (
      <div className={cn("min-h-[8rem] w-full p-1 flex flex-col", isCurrentMonth ? "" : "text-muted-foreground/50 bg-muted/20")}>
        <div className={cn("font-semibold text-sm", format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'text-primary' : '')}>
          {format(date, 'd')}
        </div>
        <div className="flex-grow overflow-y-auto space-y-1">
          {jobsForDay.map(job => (
            <CalendarJob key={job.id} job={job} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="flex-grow flex flex-col h-full">
        <DayPicker
          month={currentDate}
          onMonthChange={onDateChange}
          className="p-0"
          classNames={{
            months: 'flex-1',
            month: 'flex flex-col h-full',
            table: 'w-full border-collapse flex-1 flex flex-col',
            head_row: 'grid grid-cols-7 text-sm font-semibold text-muted-foreground border-b',
            head_cell: 'p-2',
            body: 'flex-1 grid grid-rows-5',
            row: 'grid grid-cols-7 flex-1',
            cell: 'p-0 align-top relative border-r border-b',
            day: 'hidden', // We hide the default day and render our own in the component
            caption: 'hidden'
          }}
          components={{
            Day: (props) => <DayWithJobs date={props.date} displayMonth={props.displayMonth} />,
            IconLeft: () => <ChevronLeft className="h-4 w-4" />,
            IconRight: () => <ChevronRight className="h-4 w-4" />,
          }}
          showOutsideDays
        />
      </Card>
  );
}
