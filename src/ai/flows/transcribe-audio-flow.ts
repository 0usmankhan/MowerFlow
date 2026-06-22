'use server';
/**
 * @fileOverview A flow to transcribe audio to text using AI.
 *
 * - transcribeAudio - A function that handles the audio transcription process.
 * - TranscribeAudioInput - The input type for the transcribeAudio function.
 * - TranscribeAudioResult - The return type for the transcribeAudio function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranscribeAudioInputSchema = z.object({
  audioDataUri: z.string().describe("An audio file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});

export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioResultSchema = z.object({
  transcription: z.string().describe('The transcribed text from the audio.'),
});

export type TranscribeAudioResult = z.infer<typeof TranscribeAudioResultSchema>;

export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioResult> {
  return transcribeAudioFlow(input);
}

const transcribeAudioPrompt = ai.definePrompt({
  name: 'transcribeAudioPrompt',
  input: { schema: TranscribeAudioInputSchema },
  output: { schema: TranscribeAudioResultSchema },
  prompt: `Transcribe the following audio recording.

Audio: {{media url=audioDataUri}}`,
});

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioResultSchema,
  },
  async (input) => {
    const { output } = await transcribeAudioPrompt(input);
    return output!;
  }
);
