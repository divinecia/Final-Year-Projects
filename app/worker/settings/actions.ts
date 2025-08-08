
'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

import type { WorkerProfile, WorkerSettingsData } from '@/lib/schemas/worker';
import { updateDoc } from './update-doc';
import { revalidatePath } from './revalidate-path';


export async function getWorkerProfile(workerId: string): Promise<WorkerProfile | null> {
    if (!workerId) {
        console.error("No worker ID provided for profile fetch.");
        return null;
    }

    try {
        const workerRef = doc(db, 'workers', userId);
        const docSnap = await getDoc(workerRef);

        if (!docSnap.exists()) {
            console.error("Worker document does not exist:", workerId);
            return null;
        }

        const data = docSnap.data();
        
        return {
            id: docSnap.id,
            fullName: data.fullName || '',
            email: data.email || '',
            phone: data.phone || '', // phone is read-only for now
            bio: data.bio || '',
            services: data.skills || [],
            languages: data.languages || [],
            oneTimeJobs: data.availability?.preferences?.includes('one-time') ?? false,
            recurringJobs: data.availability?.preferences?.includes('recurring') ?? false,
            hourlyRate: data.hourlyRate && data.hourlyRate.length > 0 ? data.hourlyRate : [1500],
        };
    } catch (error) {
        console.error("Error fetching worker profile:", error);
        return null;
    }
}


export async function updateWorkerProfile(workerId: string, data: WorkerSettingsData): Promise<{ success: boolean }> {
  try {
    const workerRef = doc(db, 'workers', workerId);
    
    // We need to map the form data back to the database structure
    const dataToUpdate = {
        fullName: data.fullName,
        email: data.email,
        bio: data.bio,
        skills: data.services,
        languages: data.languages,
        'availability.preferences': [
            ...(data.oneTimeJobs ? ['one-time'] : []),
            ...(data.recurringJobs ? ['recurring'] : []),
        ],
        hourlyRate: data.hourlyRate[0],
    };

    await updateDoc(workerRef, dataToUpdate);
    revalidatePath('/worker/settings');
    return { success: true };
  } catch (error) {
    console.error("Error updating worker profile: ", error);
    return { success: false };
  }
}
