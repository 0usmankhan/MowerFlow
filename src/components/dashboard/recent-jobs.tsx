

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { jobs, getCustomer } from '@/lib/data';
import Link from 'next/link';
import { Button } from '../ui/button';
import { getPlaceholderImage } from '@/lib/placeholder-images';

const statusStyles: { [key: string]: string } = {
    'Scheduled': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'Completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'Invoiced': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'Paid': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
}

export function RecentJobs() {
    const recentJobs = jobs.slice(0, 5);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Recent Jobs</CardTitle>
                <CardDescription>An overview of your most recent jobs.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4 overflow-y-auto">
                {recentJobs.map((job) => {
                    const customer = getCustomer(job.customerId);
                    const userAvatar = getPlaceholderImage('user1');
                    if (!customer) return null;
                    return (
                        <div key={job.id} className="flex items-center space-x-4">
                            <Avatar className="h-9 w-9">
                                {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={customer.name} />}
                                <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="text-sm font-medium leading-none">{customer.name}</p>
                                <p className="text-sm text-muted-foreground">{job.serviceType}</p>
                            </div>
                            <Badge variant="outline" className={statusStyles[job.status]}>{job.status}</Badge>
                            {job.invoiceAmount && <div className="text-sm font-medium">${job.invoiceAmount}</div>}
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    );
}
