
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { createLeadFromWebformAction } from '@/app/actions';
import { Loader2 } from 'lucide-react';

const webformSchema = z.object({
  name: z.string().min(1, 'Full Name is required'),
  phone: z.string().min(1, 'Phone Number is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional(),
  message: z.string().min(1, 'Please tell us how we can help'),
  referralCode: z.string().optional(),
});

type WebformValues = z.infer<typeof webformSchema>;

function LeadCaptureForm() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<WebformValues>({
        resolver: zodResolver(webformSchema),
        defaultValues: {
            name: '',
            phone: '',
            email: '',
            address: '',
            message: '',
            referralCode: '',
        },
    });

    const onSubmit = async (values: WebformValues) => {
        setIsSubmitting(true);
        try {
            await createLeadFromWebformAction(values);
            toast({
                title: 'Request Submitted!',
                description: "We've received your quote request and will be in touch shortly.",
            });
            form.reset();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Submission Failed',
                description: 'There was a problem submitting your form. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-lg shadow-none border-0">
            <CardHeader>
                <CardTitle>Request a Quote</CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you shortly.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
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
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input type="tel" placeholder="(555) 123-4567" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                         <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Service Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123 Main St, Anytown, USA" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>How can we help?</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="e.g., My lawnmower won't start..." rows={4} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="referralCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Referral Code (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter code" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Request
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}


export default function WebformEmbedPage() {
  return (
    <div className="p-4 bg-background min-h-screen flex items-center justify-center">
        <LeadCaptureForm />
    </div>
  );
}
