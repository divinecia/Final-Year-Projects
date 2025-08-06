// Genkit configuration file for the Househelp platform
// This file configures the AI matching system

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Configure Genkit with all necessary plugins
export const genkitConfig = genkit({
  plugins: [
    // Google AI for LLM capabilities
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  
  // Set default model
  model: 'googleai/gemini-2.0-flash',
});

export default genkitConfig;
