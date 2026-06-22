'use server';

/**
 * @fileOverview AI-Powered Lead Qualification Flow.
 *
 * This flow uses an AI bot to automatically qualify leads by asking them custom questions via SMS.
 * It helps service providers quickly identify urgent and high-value opportunities.
 *
 * @param {Lead} input - The lead information including contact details and initial message.
 * @returns {Promise<LeadQualificationResult>} - A promise that resolves to the qualification result containing urgency, service type, and questions asked.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LeadSchema = z.object({
  phoneNumber: z.string().describe('The phone number of the lead.'),
  initialMessage: z.string().describe('The initial message from the lead.'),
});

export type Lead = z.infer<typeof LeadSchema>;

const LeadQualificationResultSchema = z.object({
  urgency: z.string().describe('The urgency level of the lead (e.g., high, medium, low).'),
  serviceType: z.string().describe('The type of service the lead is interested in (e.g., lawn mowing, golf cart repair).'),
  address: z.string().optional().describe('The full service address of the lead, including street, city, state, and ZIP code.'),
  questionsAsked: z.string().describe('The questions that AI bot asked to qualify the lead and their answers.'),
});

export type LeadQualificationResult = z.infer<typeof LeadQualificationResultSchema>;

export async function qualifyLead(lead: Lead): Promise<LeadQualificationResult> {
  return aiPoweredLeadQualificationFlow(lead);
}

const aiPoweredLeadQualificationPrompt = ai.definePrompt({
  name: 'aiPoweredLeadQualificationPrompt',
  input: {schema: LeadSchema},
  output: {schema: LeadQualificationResultSchema},
  prompt: `You are an AI bot designed to qualify leads for a home service business via SMS.
  Your goal is to determine the urgency, service type, and service address the lead requires by asking concise, relevant questions.
  Use the initial message from the lead as context. Keep your questions brief and to the point. Record the questions you asked, and the user's answers. Infer the urgency (high, medium, low), service type, and full address based on their responses.

  Initial Message: {{{initialMessage}}}

  Respond with the urgency, service type, address, and questions asked. Make sure to return a JSON object.
  Example of JSON:
  {
    "urgency": "High",
    "serviceType": "Lawn Mowing",
    "address": "123 Main Street, Anytown, USA 12345",
    "questionsAsked": "Question 1: What is your location?\\nAnswer 1: 123 Main Street, Anytown, USA 12345\\nQuestion 2: When do you need the service?\\nAnswer 2: As soon as possible"
  }
  `,
});

const aiPoweredLeadQualificationFlow = ai.defineFlow(
  {
    name: 'aiPoweredLeadQualificationFlow',
    inputSchema: LeadSchema,
    outputSchema: LeadQualificationResultSchema,
  },
  async input => {
    const {output} = await aiPoweredLeadQualificationPrompt(input);
    return output!;
  }
);
