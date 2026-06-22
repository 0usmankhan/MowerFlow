
'use server';

/**
 * @fileOverview A flow for a conversational AI chat widget.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ChatMessageSchema, type ChatMessage } from './chat-types';

export async function continueChat(history: ChatMessage[]): Promise<string> {
  return chatFlow(history);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: z.array(ChatMessageSchema),
    outputSchema: z.string(),
  },
  async (history) => {
    const systemPrompt = `You are a helpful assistant for a home service business called MowerFlow.
The user is asking questions on the company's website.
Keep your answers concise and friendly.`;

    const response = await ai.generate({
      prompt: {
        messages: [
            { role: 'system', content: systemPrompt },
            ...history
        ],
      },
      model: 'googleai/gemini-2.5-flash',
      config: {
        temperature: 0.7,
      },
    });

    return response.text;
  }
);
