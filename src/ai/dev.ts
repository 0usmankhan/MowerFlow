import { config } from 'dotenv';
config();

import '@/ai/flows/ai-powered-lead-qualification.ts';
import '@/ai/flows/transcribe-audio-flow.ts';
import '@/ai/flows/chat-flow.ts';
import '@/ai/flows/generate-estimate-email-flow.ts';
