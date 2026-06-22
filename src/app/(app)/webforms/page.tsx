

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Code, Copy, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createLeadFromWebformAction } from '@/app/actions';


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
        <Card className="w-full max-w-lg">
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

export default function WebformsPage() {
  const { toast } = useToast();
  const [embedCode, setEmbedCode] = React.useState('');
  
  React.useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    setEmbedCode(`<iframe
  src="${origin}/webforms/embed"
  width="100%"
  height="650px"
  frameborder="0"
  style="border: 1px solid #e5e7eb; border-radius: 0.5rem;"
></iframe>`);
  }, []);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: 'Copied to Clipboard',
        description: `${fieldName} has been copied.`,
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Webforms"
        description="Capture leads directly from your website."
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold mb-4">Website Form Preview</h2>
                <div className="flex justify-center">
                    <LeadCaptureForm />
                </div>
            </div>
        </div>
        <div className="space-y-8">
             <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Code className="h-5 w-5" /> HTML Embed Code
                    </CardTitle>
                    <CardDescription>Copy and paste this code into your website's HTML where you want the form to appear.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <pre className="bg-muted text-muted-foreground p-4 rounded-md text-sm overflow-x-auto">
                            <code>{embedCode}</code>
                        </pre>
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => copyToClipboard(embedCode, 'Embed code')}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
