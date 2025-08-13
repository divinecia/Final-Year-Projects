'use server';

import { db } from '@/lib/firebase';
import {
    collection,
    getDocs,
    getDoc,
    query,
    orderBy,
    Timestamp,
    doc,
    deleteDoc,
    updateDoc,
    addDoc,
    DocumentData,
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export type Job = {
    id: string;
    jobTitle: string;
    householdName: string;
    householdId: string;
    workerName?: string | null;
    workerId?: string | null;
    serviceType: string;
    servicePackage?: string;
    amount?: number;
    duration?: string;
    tax?: number;
    location?: string;
    status: 'pending' | 'open' | 'assigned' | 'completed' | 'cancelled';
    createdAt: string;
    completedAt?: string;
};

type Notification = {
    userId: string;
    title: string;
    description: string;
    createdAt: Timestamp;
    read: boolean;
};

// Helper function to create a notification
async function createNotification(notification: Notification) {
    try {
        await addDoc(collection(db, 'notifications'), notification);
    } catch (error) {
        console.error("Error creating notification: ", error);
    }
}

export async function approveJob(jobId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const jobRef = doc(db, 'jobs', jobId);
        await updateDoc(jobRef, {
            status: 'open',
            updatedAt: Timestamp.now(),
        });

        // Fetch job data once
        const jobSnap = await getDoc(jobRef);
        const jobData = jobSnap.data() as DocumentData | undefined;

        // Revalidate relevant pages to show updated data
        revalidatePath('/admin/jobs');
        revalidatePath('/admin/dashboard');

        if (jobData?.householdId) {
            await createNotification({
                userId: jobData.householdId,
                title: 'Job Approved',
                description: `Your job "${jobData.jobTitle}" has been approved and is now visible to workers.`,
                createdAt: Timestamp.now(),
                read: false,
            });
        }
        return { success: true };
    } catch (error) {
        console.error("Error approving job: ", error);
        return { success: false, error: (error as Error).message || 'Failed to approve job.' };
    }
}

export async function getJobs(): Promise<Job[]> {
    try {
        const jobsCollection = collection(db, 'jobs');
        const q = query(jobsCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(docSnap => {
            const data = docSnap.data();
            const createdAt = data.createdAt as Timestamp;
            const completedAt = data.completedAt as Timestamp | undefined;
            return {
                id: docSnap.id,
                jobTitle: data.jobTitle || 'N/A',
                householdName: data.householdName || 'N/A',
                householdId: data.householdId || '',
                workerName: data.workerName || null,
                workerId: data.workerId || null,
                serviceType: data.serviceType || 'N/A',
                servicePackage: data.servicePackage || '',
                amount: typeof data.amount === 'number' ? data.amount : undefined,
                duration: data.duration || '',
                tax: typeof data.tax === 'number' ? data.tax : undefined,
                location: data.location || '',
                status: data.status || 'open',
                createdAt: createdAt?.toDate().toLocaleDateString() || '',
                completedAt: completedAt ? completedAt.toDate().toLocaleDateString() : undefined,
            } as Job;
        });
    } catch (error) {
        console.error("Error fetching jobs: ", error);
        return [];
    }
}

export async function deleteJob(jobId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await deleteDoc(doc(db, 'jobs', jobId));
        
        // Revalidate relevant pages to show updated data
        revalidatePath('/admin/jobs');
        revalidatePath('/admin/dashboard');
        
        return { success: true };
    } catch (error) {
        console.error("Error deleting job: ", error);
        return { success: false, error: (error as Error).message || 'Failed to delete job.' };
    }
}

export async function assignWorkerToJob(
    jobId: string,
    workerId: string,
    workerName: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const jobRef = doc(db, 'jobs', jobId);
        const jobSnap = await getDoc(jobRef);
        const jobData = jobSnap.data() as DocumentData | undefined;

        await updateDoc(jobRef, {
            workerId,
            workerName,
            status: 'assigned',
            updatedAt: Timestamp.now(),
        });

        if (jobData) {
            await createNotification({
                userId: workerId,
                title: "New Job Assignment!",
                description: `You have been assigned to the job: "${jobData.jobTitle}". Check your schedule for details.`,
                createdAt: Timestamp.now(),
                read: false,
            });
        }

        // Revalidate relevant pages to show updated data
        revalidatePath('/admin/jobs');
        revalidatePath('/admin/dashboard');

        return { success: true };
    } catch (error) {
        console.error("Error assigning worker to job: ", error);
        return { success: false, error: (error as Error).message || 'Failed to assign worker.' };
    }
}
