

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, MoreHorizontal, User, Upload, Download, Loader2, PenSquare, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { formatDate } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Customer, Lead } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { convertLeadToCustomerAction, createManualLeadAction, deleteLeadAction } from '@/app/actions';

const statusStyles: { [key: string]: string } = {
  New: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Qualified: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  Contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  Converted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  Archived: 'bg-gray-100 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400',
};

const leadSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  phone: z.string().min(1, { message: 'Phone is required' }),
  email: z.string().email().optional().or(z.literal('')),
  initialMessage: z.string().min(1, { message: 'Message is required' }),
});

type LeadFormData = z.infer<typeof leadSchema>;


export function LeadsTable() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  
  const firestore = useFirestore();

  const leadsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'leads') : null),
    [firestore]
  );
  
  const { data: leads, isLoading } = useCollection<Lead>(leadsQuery);
  const { data: customers } = useCollection<Customer>(useMemoFirebase(() => firestore ? collection(firestore, 'customers') : null, [firestore]));

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      initialMessage: '',
    },
  });

  const onSubmit = async (values: LeadFormData) => {
    try {
        const newLeadId = await createManualLeadAction(values);
        toast({
            title: 'Lead Created',
            description: `${values.name} has been added to your leads.`,
        });
        form.reset();
        setIsDialogOpen(false);
        router.push(`/leads/${newLeadId}`);
    } catch(e) {
        console.error("Failed to save lead:", e);
        toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: 'There was a problem saving the lead. Please try again.',
        });
    }
  }

  const handleCreateJob = async (lead: Lead) => {
    if (!customers) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Customer data is not loaded yet. Please try again in a moment.'
        });
        return;
    }

    toast({
        title: 'Preparing Job...',
        description: `Finding customer profile for ${lead.name}.`,
    });
    
    try {
        const existingCustomer = customers.find(c => (lead.phone && c.phone === lead.phone) || (lead.email && c.email === lead.email));
        let customerId = existingCustomer?.id;

        if (!customerId) {
            const plainLead = {
                id: lead.id,
                name: lead.name,
                phone: lead.phone,
                email: lead.email,
                address: lead.address || '',
                status: lead.status
            };
            const newCustomerId = await convertLeadToCustomerAction(plainLead);
            customerId = newCustomerId;
            toast({
                title: 'Customer Created!',
                description: `${lead.name} was automatically added as a new customer.`,
            });
        }
        
        const queryParams = new URLSearchParams({
            customerId: customerId,
            description: lead.initialMessage,
            serviceType: lead.serviceType || ''
        });

        router.push(`/jobs/new?${queryParams.toString()}`);

    } catch (error) {
        console.error('Failed to create job from lead:', error);
        toast({
            variant: 'destructive',
            title: 'Job Creation Failed',
            description: 'There was an error creating the job.',
        });
    }
  };

  const handleDeleteLead = async (lead: Lead) => {
    setIsDeleting(lead.id);
    try {
        await deleteLeadAction(lead.id);
        toast({
            title: 'Lead Deleted',
            description: `${lead.name} has been deleted.`,
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Deletion Failed',
            description: 'Could not delete the lead. Please try again.'
        });
    } finally {
        setIsDeleting(null);
    }
  };

  return (
    <>
      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>Add New Lead</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to add a new lead to your pipeline.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="initialMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                           <Textarea id="message" placeholder="Initial inquiry..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Lead
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({length: 5}).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
              ))}
              {!isLoading && leads?.map((lead: Lead) => (
                <TableRow key={lead.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <Link href={`/leads/${lead.id}`} className="block hover:underline">
                      {lead.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 text-xs">
                            <AvatarFallback>
                                {lead.assignee && lead.assignee !== 'Unassigned' ? lead.assignee.charAt(0) : <User className="h-4 w-4" />}
                            </AvatarFallback>
                        </Avatar>
                        <span>{lead.assignee || 'Unassigned'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={lead.urgency === 'High' ? 'border-red-500 text-red-500' : lead.urgency === 'Medium' ? 'border-yellow-500 text-yellow-500' : ''}>
                    {lead.urgency || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[lead.status]}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                      {lead.createdAt ? formatDate(lead.createdAt) : 'N/A'}
                  </TableCell>
                  <TableCell>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/leads/${lead.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleCreateJob(lead)}>
                          <PenSquare className="mr-2 h-4 w-4" />
                          Create Job
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete the lead for <span className="font-semibold">{lead.name}</span>. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive hover:bg-destructive/90"
                                        onClick={() => handleDeleteLead(lead)}
                                        disabled={isDeleting === lead.id}
                                    >
                                        {isDeleting === lead.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Yes, delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && leads?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">No leads found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
