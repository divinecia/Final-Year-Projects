
'use server';
/**
 * @fileOverview An AI flow to match workers to job postings.
 *
 * - matchWorkersToJob - A function that handles the worker matching process.
 * - MatchWorkerInput - The input type for the matchWorkersToJob function.
 * - MatchResult - The return type for the matchWorkersTo-Job function.
 */

import { ai } from '@/ai/genkit';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { z } from 'zod';

// Define schemas for input and output

const MatchWorkerInputSchema = z.object({
  jobId: z.string().describe("The ID of the job to match workers against."),
});
export type MatchWorkerInput = z.infer<typeof MatchWorkerInputSchema>;

const MatchResultItemSchema = z.object({
    workerId: z.string().describe("The unique ID of the matched worker."),
    workerName: z.string().describe("The full name of the matched worker."),
    profilePictureUrl: z.string().optional().describe("The URL of the worker's profile picture."),
    score: z.number().min(0).max(100).describe("A matching score from 0 to 100, where 100 is a perfect match."),
    justification: z.string().describe("A brief, one-sentence explanation for why the worker is a good match."),
});

const MatchResultSchema = z.array(MatchResultItemSchema)
    .describe("A ranked list of the top 3 most suitable workers for the job.");

export type MatchResult = z.infer<typeof MatchResultItemSchema>;
export type MatchResults = z.infer<typeof MatchResultSchema>;


// Helper function to get job details
async function getJobDetails(jobId: string) {
    const jobRef = doc(db, 'jobs', jobId);
    const jobSnap = await getDoc(jobRef);
    if (!jobSnap.exists()) throw new Error(`Job with ID ${jobId} not found.`);
    return jobSnap.data();
}

// Helper function to get all active workers
async function getActiveWorkers() {
    const workersCol = collection(db, 'worker');
    const q = query(workersCol, where('status', '==', 'active'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
}


// The main exported function that the UI will call
export async function matchWorkersToJob(input: MatchWorkerInput): Promise<MatchResults> {
  return matchWorkerFlow(input);
}


// Define the Genkit prompt
const prompt = ai.definePrompt({
  name: 'matchWorkerPrompt',
  input: {
    schema: z.object({
        jobDetails: z.any(),
        workerProfiles: z.any()
    })
  },
  output: { schema: MatchResultSchema },
  prompt: `
    You are an expert HR manager for a home services platform called Househelp. 
    Your task is to find the best worker for a given job posting.

    Analyze the following job details and the list of available worker profiles.
    Based on skills, experience, bio, and availability, identify the top 3 best-matched workers.

    Provide a matching score from 0-100 for each worker. A score of 100 is a perfect match.
    Also, provide a short, one-sentence justification for your choice.

    **Job Details:**
    \`\`\`json
    {{{json jobDetails}}}
    \`\`\`

    **Available Worker Profiles:**
    \`\`\`json
    {{{json workerProfiles}}}
    \`\`\`

    Return your answer as a JSON array of the top 3 matches, ordered from highest score to lowest.
  `,
});

// Define the Genkit flow
const matchWorkerFlow = ai.defineFlow(
  {
    name: 'matchWorkerFlow',
    inputSchema: MatchWorkerInputSchema,
    outputSchema: MatchResultSchema,
  },
  async (input) => {
    // 1. Fetch data from Firestore
    const jobDetails = await getJobDetails(input.jobId);
    const activeWorkers = await getActiveWorkers();

    if (activeWorkers.length === 0) {
        return [];
    }

    // 2. Format data for the prompt
    const workerProfiles = activeWorkers.map(w => ({
        id: w.id,
        fullName: w.fullName,
        profilePictureUrl: w.profilePictureUrl,
        bio: w.bio,
        skills: w.skills,
        experienceYears: w.experienceYears,
        availability: w.availability,
    }));

    // 3. Call the AI model
    const { output } = await prompt({
        jobDetails,
        workerProfiles
    });

    return output ?? [];
  }
);
