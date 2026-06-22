
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Bot, AlertTriangle, MapPin } from 'lucide-react';
import { qualifyLeadAction } from '@/app/actions';
import type { Lead } from '@/lib/types';
import type { LeadQualificationResult } from '@/ai/flows/ai-powered-lead-qualification';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';

export function LeadQualifier({ lead }: { lead: Lead }) {
  const [result, setResult] = React.useState<LeadQualificationResult | null>(lead.qualificationQuestions ? {
      urgency: lead.urgency || 'Unknown',
      serviceType: lead.serviceType || 'Unknown',
      questionsAsked: lead.qualificationQuestions,
      address: lead.address,
  } : null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleQualify = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const qualificationResult = await qualifyLeadAction({
        initialMessage: lead.initialMessage,
        phoneNumber: lead.phone,
      });
      setResult(qualificationResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!result && !isLoading && (
        <div className="text-center p-4 border-2 border-dashed rounded-lg">
          <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Ready to qualify?</h3>
          <p className="mt-1 text-sm text-muted-foreground">Click the button to let the AI bot ask questions and qualify this lead.</p>
          <div className="mt-6">
            <Button onClick={handleQualify} disabled={isLoading}>
              <Sparkles className="mr-2 h-4 w-4" />
              {isLoading ? 'Qualifying...' : 'Qualify with AI'}
            </Button>
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="space-y-4">
          <div className="flex space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-3/4" />
              </div>
          </div>
          <div className="flex space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
              </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div>
            <h4 className="font-bold">Qualification Failed</h4>
            <p>{error}</p>
          </div>
        </div>
      )}

      {result && !error && (
        <div>
            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Service Type</p>
                            <Badge>{result.serviceType}</Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Urgency</p>
                            <Badge variant={result.urgency === 'High' ? 'destructive' : 'secondary'}>{result.urgency}</Badge>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleQualify} disabled={isLoading}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Re-qualify
                    </Button>
                </div>

                {result.address && (
                    <>
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Property Address</h4>
                            <div className="flex items-start gap-3 text-sm">
                                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                <span>{result.address}</span>
                            </div>
                        </div>
                        <Separator />
                    </>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center"><Bot className="mr-2 h-5 w-5"/> AI Conversation Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="whitespace-pre-wrap font-body text-sm text-foreground bg-muted/50 p-4 rounded-md">{result.questionsAsked}</pre>
                    </CardContent>
                </Card>
            </div>
        </div>
      )}
    </div>
  );
}
