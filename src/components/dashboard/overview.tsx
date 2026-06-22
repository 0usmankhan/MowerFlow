
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import * as React from 'react';

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--primary))",
  },
};

export function Overview() {
  const [chartData, setChartData] = React.useState<any[]>([]);

  React.useEffect(() => {
    // Math.random() can cause hydration errors if not used in useEffect
    const data = [
      { name: 'Jan', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Feb', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Mar', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Apr', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'May', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Jun', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Jul', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Aug', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Sep', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Oct', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Nov', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Dec', total: Math.floor(Math.random() * 5000) + 1000 },
    ];
    setChartData(data);
  }, []);

  return (
    <Card className="h-full flex flex-col">
        <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Your monthly revenue for the year.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-full">
              <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                  />
                  <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
        </CardContent>
    </Card>
  );
}
