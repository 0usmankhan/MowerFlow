

'use client';

import { notFound, useRouter } from 'next/navigation';
import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Mail, MessageSquare, Loader2, AlertTriangle, PenSquare, Trash2 } from 'lucide-react';
import { LeadQualifier } from '@/components/leads/lead-qualifier';
import { VoiceMemo } from '@/components/leads/voice-memo';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EstimateGenerator } from '@/components/leads/estimate-generator';
import { convertLeadToCustomerAction, deleteLeadAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Customer, Lead } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
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

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isConverting, setIsConverting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  
  const firestore = useFirestore();

  const leadRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'leads', params.id) : null
  , [firestore, params.id]);
  const { data: lead, isLoading: isLeadLoading } = useDoc<Lead>(leadRef);

  const customersQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'customers') : null
  , [firestore]);
  const { data: customers } = useCollection<Customer>(customersQuery);
  
  const existingCustomer = React.useMemo(() => {
    if (!customers || !lead) return null;
    return customers.find(c => (lead.phone && c.phone === lead.phone) || (lead.email && c.email === lead.email));
  }, [customers, lead]);

  const handleConvertToCustomer = async () => {
    if (!lead) return;
    setIsConverting(true);
    try {
      const plainLead = {
          id: lead.id,
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          address: lead.address || '',
          status: lead.status
      };
      const newCustomerId = await convertLeadToCustomerAction(plainLead);
      toast({
        title: 'Lead Converted!',
        description: `${lead.name} has been added as a customer.`,
      });
      router.push(`/customers/${newCustomerId}`);
    } catch (error) {
      console.error('Failed to convert lead:', error);
      toast({
        variant: 'destructive',
        title: 'Conversion Failed',
        description: 'There was a problem converting this lead to a customer.',
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!lead) return;
    setIsDeleting(true);
    try {
        await deleteLeadAction(lead.id);
        toast({
            title: 'Lead Deleted',
            description: `${lead.name} has been permanently deleted.`,
        });
        router.push('/leads');
    } catch (error) {
        console.error('Failed to delete lead:', error);
        toast({
            variant: 'destructive',
            title: 'Deletion Failed',
            description: 'There was a problem deleting this lead.',
        });
        setIsDeleting(false);
    }
  }
  
  const handleCreateJob = async () => {
    if (!lead || !customers) return;
    
    toast({
        title: 'Preparing Job...',
        description: `Finding customer profile for ${lead.name}.`,
    });
    
    try {
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

  if (isLeadLoading) {
    return (
       <div className="p-4 sm:p-6 lg:p-8">
            <Skeleton className="h-10 w-1/3 mb-4" />
            <Skeleton className="h-5 w-1/4 mb-6" />
            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-80 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
       </div>
    );
  }

  if (!lead) {
    notFound();
  }


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader title={lead.name} description={lead.createdAt ? `Lead since ${formatDate(lead.createdAt)}` : ''}>
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isDeleting}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the lead
                        <span className="font-semibold"> {lead.name}</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteLead} disabled={isDeleting}>
                         {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        
        {existingCustomer ? (
            <Button onClick={handleCreateJob}>
              <PenSquare className="mr-2 h-4 w-4" />
              Create Job
            </Button>
        ) : (
            <Button onClick={handleConvertToCustomer} disabled={isConverting}>
                {isConverting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Convert to Customer
            </Button>
        )}
      </PageHeader>
      
      {existingCustomer && (
          <div className="mb-6 rounded-lg border border-accent bg-accent/20 p-4">
            <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-accent-foreground flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-accent-foreground">Existing Customer Record</h4>
                    <p className="text-sm text-accent-foreground/80">
                        This lead matches an existing customer. Actions like "Create Job" will be linked to the existing customer profile.
                    </p>
                    <Button asChild variant="link" className="p-0 h-auto mt-1 text-accent-foreground/90">
                        <Link href={`/customers/${existingCustomer.id}`}>View Customer Profile</Link>
                    </Button>
                </div>
            </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>AI-Powered Qualification</CardTitle>
                    <CardDescription>Use AI to ask custom questions and qualify this lead automatically.</CardDescription>
                </CardHeader>
                <CardContent>
                    <LeadQualifier lead={lead} />
                </CardContent>
            </Card>
            <EstimateGenerator lead={lead} />
            <VoiceMemo />
             <Card>
                <CardHeader>
                    <CardTitle>Initial Message</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start space-x-4">
                        <MessageSquare className="w-5 h-5 mt-1 text-muted-foreground" />
                        <p className="text-muted-foreground italic">&quot;{lead.initialMessage}&quot;</p>
                    </div>
                </CardContent>
            </Card>
        </div>
        
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Lead Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center">
                        <User className="w-4 h-4 mr-3 text-muted-foreground" />
                        <span>{lead.name}</span>
                    </div>
                    {lead.phone && (
                        <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-3 text-muted-foreground" />
                            <a href={`tel:${lead.phone}`} className="text-primary hover:underline">{lead.phone}</a>
                        </div>
                    )}
                    {lead.email && (
                        <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-3 text-muted-foreground" />
                            <a href={`mailto:${lead.email}`} className="text-primary hover:underline">{lead.email}</a>
                        </div>
                    )}
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant="outline">{lead.status}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Urgency</span>
                        <Badge variant="secondary">{lead.urgency}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Assignee</span>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 text-xs">
                                <AvatarFallback>
                                    {lead.assignee && lead.assignee !== 'Unassigned' ? lead.assignee.charAt(0) : <User className="h-3 w-3" />}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{lead.assignee || 'Unassigned'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
