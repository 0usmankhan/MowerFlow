
'use client';

import * as React from 'react';
import type { Job } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';

interface WeekViewProps {
    currentDate: Date;
    jobsByDate: Record<string, Job[]>;
}

export function WeekView({ currentDate, jobsByDate }: WeekViewProps) {
    return (
        <Card className="h-full">
            <CardContent className="p-6">
                <h2 className="text-xl font-bold">Week View</h2>
                <p className="text-muted-foreground">This is a placeholder for the week view.</p>
                <p>Current week starts around: {currentDate.toDateString()}</p>
            </CardContent>
        </Card>
    );
}
