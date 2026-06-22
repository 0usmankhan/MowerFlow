
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { leads } from '@/lib/data';
import type { LeadSource } from '@/lib/types';
import * as React from 'react';

const chartConfig = {
  total: {
    label: "Leads",
    color: "hsl(var(--primary))",
  },
};

export function LeadSourceChart() {
    const [chartData, setChartData] = React.useState<any[]>([]);
    
    React.useEffect(() => {
        const leadSourceData = leads.reduce((acc, lead) => {
            const source = lead.source || 'Manual';
            const existingSource = acc.find(s => s.name === source);
            if (existingSource) {
              existingSource.total += 1;
            } else {
              acc.push({ name: source, total: 1 });
            }
            return acc;
          }, [] as { name: LeadSource | 'Manual'; total: number }[]);
        setChartData(leadSourceData);
    }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Sources</CardTitle>
        <CardDescription>A breakdown of where your leads are coming from.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart data={chartData} layout="vertical" accessibilityLayer>
            <XAxis type="number" hide />
            <YAxis 
                dataKey="name" 
                type="category"
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                width={80}
            />
            <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
