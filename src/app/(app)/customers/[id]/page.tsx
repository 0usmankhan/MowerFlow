
'use client';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getJobsForCustomer, getRecurringJobsForCustomer, type Job, type RecurringJob, getTeamMember } from '@/lib/data';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Phone, Mail, MapPin, Wrench, PlusCircle, Gift, Repeat } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { useFirestore, useCollection, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc, collection, addDoc, Firestore, CollectionReference } from 'firebase/firestore';
import type { Customer, Equipment } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';


function RecurringJobs({ recurringJobs }: { recurringJobs: RecurringJob[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Recurring Jobs</CardTitle>
            <CardDescription>Templates for jobs that repeat automatically.</CardDescription>
        </div>
        <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4"/> New Template</Button>
      </CardHeader>
      <CardContent>
          <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Next Date</TableHead>
                    <TableHead>Technician</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {recurringJobs.map(job => {
                    const technician = getTeamMember(job.technicianId);
                    return (
                        <TableRow key={job.id}>
                            <TableCell>{job.serviceType}</TableCell>
                            <TableCell>{job.frequency}</TableCell>
                            <TableCell>{formatDate(job.startDate)}</TableCell>
                            <TableCell>{technician?.name || 'N/A'}</TableCell>
                        </TableRow>
                    )
                })}
                 {recurringJobs.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                        <div className="flex flex-col items-center gap-2">
                             <Repeat className="h-8 w-8 text-muted-foreground" />
                            <span>No recurring jobs found.</span>
                        </div>
                    </TableCell>
                </TableRow>
             )}
            </TableBody>
          </Table>
      </CardContent>
    </Card>
  );
}

function JobHistory({ jobs }: { jobs: Job[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => {
                const technician = getTeamMember(job.technicianId);
                return (
                    <TableRow key={job.id}>
                        <TableCell>{formatDate(job.scheduledDate)}</TableCell>
                        <TableCell>{job.serviceType}</TableCell>
                        <TableCell>{technician?.name || 'N/A'}</TableCell>
                        <TableCell><Badge variant="outline">{job.status}</Badge></TableCell>
                        <TableCell className="text-right">{job.invoiceAmount ? `$${job.invoiceAmount.toFixed(2)}` : 'N/A'}</TableCell>
                    </TableRow>
                )
            })}
             {jobs.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">No job history found.</TableCell>
                </TableRow>
             )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function addEquipment(equipmentCollection: CollectionReference, equipment: Omit<Equipment, 'id'>) {
    addDocumentNonBlocking(equipmentCollection, equipment);
}


function EquipmentRegistry({ customer }: { customer: Customer }) {
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newEquipName, setNewEquipName] = React.useState('');
  const [newEquipModel, setNewEquipModel] = React.useState('');
  const [newEquipSerial, setNewEquipSerial] = React.useState('');

  const equipmentQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'customers', customer.id, 'equipment') : null
  , [firestore, customer.id]);

  const { data: equipmentList, isLoading: loading } = useCollection<Equipment>(equipmentQuery);

  const handleAddEquipment = async () => {
    if (!equipmentQuery) return;
    const randomImage = getPlaceholderImage('mower2');
    const newEquipment: Omit<Equipment, 'id'> = {
        name: newEquipName,
        model: newEquipModel,
        serialNumber: newEquipSerial,
        imageUrl: randomImage?.imageUrl || '',
        imageHint: randomImage?.imageHint || '',
    };
    
    addEquipment(equipmentQuery, newEquipment);
    
    setNewEquipName('');
    setNewEquipModel('');
    setNewEquipSerial('');
    setIsDialogOpen(false);
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Equipment Registry</CardTitle>
            <CardDescription>All equipment registered for this customer.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4"/> Add Equipment</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Equipment</DialogTitle>
                    <DialogDescription>Fill in the details for the new equipment.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="equip-name">Equipment Name</Label>
                        <Input id="equip-name" value={newEquipName} onChange={(e) => setNewEquipName(e.target.value)} placeholder="e.g., Riding Mower" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="equip-model">Model</Label>
                        <Input id="equip-model" value={newEquipModel} onChange={(e) => setNewEquipModel(e.target.value)} placeholder="e.g., ZT1 50" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="equip-serial">Serial Number</Label>
                        <Input id="equip-serial" value={newEquipSerial} onChange={(e) => setNewEquipSerial(e.target.value)} placeholder="e.g., SN-12345" />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleAddEquipment}>Save Equipment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}
        {!loading && equipmentList && equipmentList.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {equipmentList.map((equip) => (
              <Card key={equip.id} className="overflow-hidden">
                <div className="aspect-video relative">
                    <Image
                        src={equip.imageUrl}
                        alt={equip.name}
                        fill
                        className="object-cover"
                        data-ai-hint={equip.imageHint}
                    />
                </div>
                <div className="p-4">
                    <h3 className="font-semibold">{equip.name}</h3>
                    <p className="text-sm text-muted-foreground">Model: {equip.model}</p>
                    <p className="text-sm text-muted-foreground">S/N: {equip.serialNumber}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : !loading && (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">No Equipment Registered</h3>
            <p className="mt-1 text-sm text-muted-foreground">Add this customer's equipment to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CustomerDetailPage({ params: { id } }: { params: { id: string } }) {
  const firestore = useFirestore();
  const customerRef = useMemoFirebase(() =>
    firestore ? doc(firestore, 'customers', id) : null
  , [firestore, id]);
  const { data: customer, isLoading: loading } = useDoc<Customer>(customerRef);


  if (loading) {
      return (
          <div className="p-4 sm:p-6 lg:p-8">
              <Skeleton className="h-10 w-1/3 mb-6" />
               <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-1 space-y-6">
                        <Card>
                            <CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-2 space-y-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
               </div>
          </div>
      )
  }

  if (!customer) {
    notFound();
  }

  // NOTE: These are still using static data.
  // In a future step, we'll fetch these from sub-collections in Firestore.
  const jobs = getJobsForCustomer(customer.id);
  const recurringJobs = getRecurringJobsForCustomer(customer.id);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader title={customer.name} />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3 text-muted-foreground" />
                <a href={`tel:${customer.phone}`} className="text-primary hover:underline">{customer.phone}</a>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-muted-foreground" />
                <a href={`mailto:${customer.email}`} className="text-primary hover:underline">{customer.email}</a>
              </div>
              <div className="flex items-start">
                <MapPin className="w-4 h-4 mr-3 mt-1 text-muted-foreground" />
                <span>{customer.address}</span>
              </div>
              {customer.referralCode && (
                <>
                    <Separator />
                    <div className="flex items-center">
                        <Gift className="w-4 h-4 mr-3 text-muted-foreground" />
                        <span className="text-sm">Referral Code: <Badge variant="secondary">{customer.referralCode}</Badge></span>
                    </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2 space-y-6">
          <RecurringJobs recurringJobs={recurringJobs} />
          <EquipmentRegistry customer={customer} />
          <JobHistory jobs={jobs} />
        </div>
      </div>
    </div>
  );
}
