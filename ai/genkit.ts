import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

if (!process.env.GOOGLE_GENAI_API_KEY) {
  throw new Error('Missing GOOGLE_GENAI_API_KEY environment variable');
}

const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});

const { defineFlow, definePrompt, defineTool } = ai;

export { ai, defineFlow, definePrompt, defineTool };