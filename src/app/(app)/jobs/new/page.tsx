
'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { add } from 'date-fns';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { cn, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { createJobAction } from '@/app/actions';
import type { Customer, TeamMember } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const jobSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  description: z.string().optional(),
  scheduledDate: z.date({ required_error: 'A date is required.' }),
  technicianId: z.string().min(1, 'A technician must be assigned'),
});

type JobFormData = z.infer<typeof jobSchema>;

export default function NewJobPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const firestore = useFirestore();

  const customerId = searchParams.get('customerId');
  const description = searchParams.get('description');
  const serviceType = searchParams.get('serviceType');

  const customerRef = useMemoFirebase(() => customerId ? doc(firestore, 'customers', customerId) : null, [firestore, customerId]);
  const { data: customer, isLoading: isCustomerLoading } = useDoc<Customer>(customerRef);
  
  const techniciansQuery = useMemoFirebase(() => firestore ? collection(firestore, 'technicians') : null, [firestore]);
  const { data: technicians, isLoading: areTechniciansLoading } = useCollection<TeamMember>(techniciansQuery);

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      customerId: customerId || '',
      serviceType: serviceType || '',
      description: description || '',
      scheduledDate: add(new Date(), { days: 1 }),
      technicianId: '',
    },
  });

  React.useEffect(() => {
    if (customerId) form.setValue('customerId', customerId);
    if (description) form.setValue('description', description);
    if (serviceType) form.setValue('serviceType', serviceType);
  }, [customerId, description, serviceType, form]);

  const onSubmit = async (values: JobFormData) => {
    setIsSubmitting(true);
    try {
      await createJobAction({
        ...values,
        scheduledDate: values.scheduledDate.toISOString(),
      });
      toast({
        title: 'Job Created!',
        description: `The job has been scheduled for ${customer?.name}.`,
      });
      router.push('/schedule');
    } catch (error) {
      console.error('Failed to create job:', error);
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: 'There was a problem creating the job.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCustomerLoading && customerId) {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <PageHeader title="New Job" description="Schedule a new job for a customer." />
            <Skeleton className="h-96 w-full" />
        </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader title="New Job" description="Schedule a new job for a customer." />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
              <CardDescription>This job will be for {customer ? customer.name : 'the selected customer'}.</CardDescription>
            </CardHeader>
            <CardContent>
                {isCustomerLoading ? <Skeleton className="h-8 w-1/2" /> : (
                    <FormField
                        control={form.control}
                        name="customerId"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Customer</FormLabel>
                                <Input {...field} disabled value={customer?.name || 'Loading...'} />
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>Provide the details for this service.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Service Type</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Lawn Mowing, Tune-up" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description / Notes</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Details about the job..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
          </Card>

          <Card>
             <CardHeader>
                <CardTitle>Scheduling & Assignment</CardTitle>
                <CardDescription>When will this job be done and who will do it?</CardDescription>
            </CardHeader>
             <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="scheduledDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Scheduled Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[240px] pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? formatDate(field.value) : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="technicianId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Assign Technician</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger disabled={areTechniciansLoading}>
                                    <SelectValue placeholder={areTechniciansLoading ? 'Loading technicians...' : 'Select a technician'} />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {technicians?.map((tech) => (
                                    <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Job
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
