
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Bot, AlertTriangle, Copy } from 'lucide-react';
import { generateEstimateEmailAction } from '@/app/actions';
import type { Lead } from '@/lib/types';
import type { GenerateEstimateOutput } from '@/ai/flows/generate-estimate-email-flow';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export function EstimateGenerator({ lead }: { lead: Lead }) {
  const [result, setResult] = React.useState<GenerateEstimateOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const estimateResult = await generateEstimateEmailAction({
        leadName: lead.name,
        initialMessage: lead.initialMessage,
        serviceType: lead.serviceType,
        qualificationQuestions: lead.qualificationQuestions,
        // In a real app, you would get this from the voice memo component's state
        notes: 'Customer mentioned the lawn is about 1/2 acre.',
      });
      setResult(estimateResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: 'Copied to Clipboard',
        description: `${fieldName} has been copied.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Estimate Generator</CardTitle>
        <CardDescription>Draft a professional estimate email using the lead's information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result && !isLoading && (
          <div className="text-center p-4 border-2 border-dashed rounded-lg">
            <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">Generate an Email</h3>
            <p className="mt-1 text-sm text-muted-foreground">Click the button to let AI create a draft estimate email for this lead.</p>
            <div className="mt-6">
              <Button onClick={handleGenerate} disabled={isLoading}>
                <Sparkles className="mr-2 h-4 w-4" />
                {isLoading ? 'Generating...' : 'Generate with AI'}
              </Button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div>
              <h4 className="font-bold">Generation Failed</h4>
              <p>{error}</p>
            </div>
          </div>
        )}

        {result && !error && (
          <div className="space-y-4">
            <div className="flex justify-end">
                 <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={isLoading}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Regenerate
                </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <div className="flex items-center gap-2">
                <Input id="subject" value={result.subject} readOnly />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(result.subject, 'Subject')}>
                    <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <div className="relative">
                 <Textarea id="body" value={result.body} readOnly rows={10} />
                 <Button variant="outline" size="icon" className="absolute top-2 right-2" onClick={() => copyToClipboard(result.body, 'Body')}>
                    <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
