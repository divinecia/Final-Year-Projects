import { config } from 'dotenv';
config();

// Import and initialize Genkit
import './genkit';
import './flows/match-worker-flow';

// Start the Genkit development server
console.log('🚀 Genkit AI development server starting...');
console.log('🤖 Worker matching flow loaded');
console.log('📊 Available at: http://localhost:4000 (Genkit UI)');

// Export for development purposes
export * from './genkit';
export * from './flows/match-worker-flow';
