
'use client';

import * as React from 'react';
import type { Job } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';

interface DayViewProps {
    currentDate: Date;
    jobsByDate: Record<string, Job[]>;
}

export function DayView({ currentDate, jobsByDate }: DayViewProps) {
    return (
        <Card className="h-full">
            <CardContent className="p-6">
                <h2 className="text-xl font-bold">Day View</h2>
                <p className="text-muted-foreground">This is a placeholder for the day view.</p>
                <p>Current date: {currentDate.toDateString()}</p>
            </CardContent>
        </Card>
    );
}
