
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, documentId } from 'firebase/firestore';

export type Worker = {
    id: string;
    fullName: string;
    profilePictureUrl?: string;
    rating: number;
    reviewsCount: number;
    skills: string[];
    status: 'active' | 'pending' | 'suspended';
    hourlyRate?: number;
};

export async function getActiveWorkers(): Promise<Worker[]> {
  try {
    const workersCollection = collection(db, 'workers');
    const q = query(workersCollection, where('status', '==', 'active'), orderBy('fullName'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return [];
    }

    const workers = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        fullName: data.fullName || 'No Name',
        profilePictureUrl: data.profilePictureUrl || undefined,
        rating: data.rating || 0,
        reviewsCount: data.reviewsCount || 0,
        skills: data.skills || [],
        status: data.status,
        hourlyRate: data.hourlyRate ? (Array.isArray(data.hourlyRate) ? data.hourlyRate[0] : data.hourlyRate) : undefined,
      } as Worker;
    });

    return workers;
  } catch (error) {
    console.error("Error fetching active workers: ", error);
    return [];
  }
}

export async function getPreviouslyHiredWorkers(householdId: string): Promise<Worker[]> {
    if (!householdId) return [];
    
    try {
        // 1. Get completed jobs for the household
        const jobsQuery = query(
            collection(db, 'jobs'),
            where('householdId', '==', householdId),
            where('status', '==', 'completed'),
            orderBy('createdAt', 'desc'),
            limit(10) // Limit to the last 10 for performance
        );
        const jobsSnapshot = await getDocs(jobsQuery);

        if (jobsSnapshot.empty) {
            return [];
        }

        // 2. Get unique worker IDs from those jobs
        const workerIds = [...new Set(jobsSnapshot.docs.map(doc => doc.data().workerId).filter(id => id))];

        if (workerIds.length === 0) {
            return [];
        }

        // 3. Fetch profiles for those workers using the document ID
        const workersQuery = query(collection(db, 'workers'), where(documentId(), 'in', workerIds));
        const workersSnapshot = await getDocs(workersQuery);
        
        return workersSnapshot.docs.map(doc => {
            const data = doc.data();
             return {
                id: doc.id,
                fullName: data.fullName || 'No Name',
                profilePictureUrl: data.profilePictureUrl || undefined,
                rating: data.rating || 0,
                reviewsCount: data.reviewsCount || 0,
                skills: data.skills || [],
                status: data.status,
            } as Worker;
        });
        
    } catch (error) {
        console.error("Error fetching previously hired workers: ", error);
        return [];
    }
}
