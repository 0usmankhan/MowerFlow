'use server';
/**
 * @fileOverview A flow to generate an estimate email from lead data.
 *
 * - generateEstimateEmail - A function that handles the email generation process.
 * - GenerateEstimateInput - The input type for the generateEstimateEmail function.
 * - GenerateEstimateOutput - The return type for the generateEstimateEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateEstimateInputSchema = z.object({
  leadName: z.string().describe('The name of the lead.'),
  initialMessage: z.string().describe('The initial message from the lead.'),
  serviceType: z.string().optional().describe('The type of service the lead is interested in.'),
  qualificationQuestions: z.string().optional().describe('The AI-generated questions and answers for qualification.'),
  notes: z.string().optional().describe('Additional notes, possibly from a transcribed voice memo.'),
});

export type GenerateEstimateInput = z.infer<typeof GenerateEstimateInputSchema>;

const GenerateEstimateOutputSchema = z.object({
  subject: z.string().describe('The generated subject line for the email.'),
  body: z.string().describe('The generated body of the email.'),
});

export type GenerateEstimateOutput = z.infer<typeof GenerateEstimateOutputSchema>;

export async function generateEstimateEmail(input: GenerateEstimateInput): Promise<GenerateEstimateOutput> {
  return generateEstimateEmailFlow(input);
}

const generateEstimateEmailPrompt = ai.definePrompt({
  name: 'generateEstimateEmailPrompt',
  input: { schema: GenerateEstimateInputSchema },
  output: { schema: GenerateEstimateOutputSchema },
  prompt: `You are a helpful assistant for a home service business called MowerFlow. Your task is to write a friendly and professional estimate email to a potential customer.

Use the following information to draft the email. The email should be polite, reference the customer's initial request, and provide a clear (though placeholder) estimate. Address the customer by name.

**Lead Information:**
- Name: {{{leadName}}}
- Initial Request: {{{initialMessage}}}
- Service of Interest: {{{serviceType}}}
- Qualification Details: {{{qualificationQuestions}}}
- Additional Notes: {{{notes}}}

**Instructions:**
1.  Create a clear and concise subject line.
2.  Write a professional email body.
3.  Address the customer by their name ({{{leadName}}}).
4.  Reference their initial inquiry to show you've paid attention.
5.  If a service type is known, mention it.
6.  Politely present a placeholder for the cost (e.g., "The estimated cost for this service is [COST]."). Do not make up a price.
7.  End with a friendly closing and sign off from "The MowerFlow Team".
8.  Return the response as a JSON object with 'subject' and 'body' fields.
`,
});

const generateEstimateEmailFlow = ai.defineFlow(
  {
    name: 'generateEstimateEmailFlow',
    inputSchema: GenerateEstimateInputSchema,
    outputSchema: GenerateEstimateOutputSchema,
  },
  async (input) => {
    const { output } = await generateEstimateEmailPrompt(input);
    return output!;
  }
);
