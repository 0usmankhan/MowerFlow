
'use client';

import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import { add, startOfMonth, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonthView } from '@/components/schedule/month-view';
import { WeekView } from '@/components/schedule/week-view';
import { DayView } from '@/components/schedule/day-view';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collectionGroup } from 'firebase/firestore';
import type { Job } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function SchedulePage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = React.useState<Date>(startOfMonth(today));
  const [view, setView] = React.useState('month');
  const firestore = useFirestore();

  const ticketsQuery = useMemoFirebase(() => 
    firestore ? collectionGroup(firestore, 'tickets') : null
  , [firestore]);
  
  const { data: jobs, isLoading } = useCollection<Job>(ticketsQuery);

  const jobsByDate = React.useMemo(() => {
    if (!jobs) return {};
    return jobs.reduce((acc, job) => {
      const dateKey = format(new Date(job.scheduledDate), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(job);
      return acc;
    }, {} as Record<string, Job[]>);
  }, [jobs]);

  const handlePrev = () => {
      if (view === 'month') {
          setCurrentDate(add(currentDate, { months: -1 }));
      } else if (view === 'week') {
          setCurrentDate(add(currentDate, { weeks: -1 }));
      } else {
          setCurrentDate(add(currentDate, { days: -1 }));
      }
  };

  const handleNext = () => {
      if (view === 'month') {
          setCurrentDate(add(currentDate, { months: 1 }));
      } else if (view === 'week') {
          setCurrentDate(add(currentDate, { weeks: 1 }));
      } else {
          setCurrentDate(add(currentDate, { days: 1 }));
      }
  };
  
  const handleToday = () => {
    setCurrentDate(startOfMonth(today));
  };

  const renderView = () => {
    if (isLoading) {
        return <Skeleton className="h-[70vh] w-full" />;
    }
    switch (view) {
      case 'day':
        return <DayView currentDate={currentDate} jobsByDate={jobsByDate} />;
      case 'week':
        return <WeekView currentDate={currentDate} jobsByDate={jobsByDate} />;
      case 'month':
      default:
        return <MonthView currentDate={currentDate} onDateChange={setCurrentDate} jobsByDate={jobsByDate} />;
    }
  };
  
  const getHeaderDate = () => {
      if (view === 'month') return format(currentDate, 'MMMM yyyy');
      if (view === 'week') {
        const start = currentDate;
        const end = add(start, {days: 6});
        return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
      }
      return format(currentDate, 'MMMM d, yyyy');
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-[calc(100vh-2rem)]">
      <PageHeader
        title="Schedule"
        description="View and manage your upcoming jobs."
      >
         <div className="flex items-center gap-4">
            <div className="flex items-center rounded-md border">
                <Button variant="ghost" size="icon" onClick={handlePrev}><ChevronLeft className="h-4 w-4" /></Button>
                <div className="w-px h-6 bg-border" />
                 <Button variant="ghost" className="hidden sm:inline-flex" onClick={handleToday}>Today</Button>
                <div className="w-px h-6 bg-border hidden sm:inline-flex" />
                <Button variant="ghost" size="icon" onClick={handleNext}><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <h2 className="text-xl font-semibold w-48 hidden md:block text-center">{getHeaderDate()}</h2>
            <Tabs defaultValue="month" onValueChange={setView}>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
        </div>
      </PageHeader>
      <div className="flex-grow">
        {renderView()}
      </div>
    </div>
  );
}
