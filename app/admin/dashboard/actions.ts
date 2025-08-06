'use server';

import { db } from '@/lib/firebase';
import {
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    where,
    getCountFromServer,
    Timestamp,
    QueryDocumentSnapshot,
    DocumentData,
} from 'firebase/firestore';
import type { Job } from '../jobs/actions';
import type { Worker } from '../workers/workermanage/actions';

// Helper to safely format Firestore Timestamp or Date
function formatDate(date: Timestamp | Date | undefined): string {
    if (!date) return '';
    if (date instanceof Timestamp) {
        return date.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
    if (date instanceof Date) {
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
    // Fallback for unexpected types
    return '';
}

export type DashboardStats = {
    totalWorkers: number;
    totalHouseholds: number;
    jobsCompleted: number;
    totalRevenue: number;
};

/**
 * Fetches dashboard statistics for admin overview.
 * Returns total workers, households, completed jobs, and revenue.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        const [workersSnap, householdsSnap, completedJobsSnap] = await Promise.all([
            getCountFromServer(collection(db, 'worker')),
            getCountFromServer(collection(db, 'household')),
            getCountFromServer(query(collection(db, 'jobs'), where('status', '==', 'completed'))),
        ]);

        // Calculate total revenue from completed payments
        let totalRevenue = 0;
        try {
            const paymentsQuery = query(
                collection(db, 'servicePayments'),
                where('status', '==', 'completed')
            );
            const paymentsSnap = await getDocs(paymentsQuery);
            totalRevenue = paymentsSnap.docs.reduce((sum, doc) => {
                const amount = Number(doc.data().amount);
                return sum + (isNaN(amount) ? 0 : amount);
            }, 0);
        } catch (error) {
            // Fallback to estimated revenue if payments collection is empty or error
            totalRevenue = (completedJobsSnap.data().count ?? 0) * 25000; // Average job value
            console.warn("Falling back to estimated revenue:", error);
        }

        return {
            totalWorkers: workersSnap.data().count ?? 0,
            totalHouseholds: householdsSnap.data().count ?? 0,
            jobsCompleted: completedJobsSnap.data().count ?? 0,
            totalRevenue,
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return { totalWorkers: 0, totalHouseholds: 0, jobsCompleted: 0, totalRevenue: 0 };
    }
}

/**
 * Helper to safely map Firestore worker document to Worker type.
 */
function mapWorkerDoc(doc: QueryDocumentSnapshot<DocumentData>): Worker {
    const data = doc.data();
    return {
        id: doc.id,
        fullName: data.fullName ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        status: data.status ?? 'pending',
        dateJoined: formatDate(data.dateJoined),
    } as Worker;
}

/**
 * Fetches the 5 most recent worker registrations.
 * Returns an array of Worker objects with safe defaults.
 */
export async function getRecentWorkerRegistrations(): Promise<Worker[]> {
    try {
        const workersCollection = collection(db, 'worker');
        const q = query(workersCollection, orderBy('dateJoined', 'desc'), limit(5));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return [];
        }

        return querySnapshot.docs.map(mapWorkerDoc);
    } catch (error) {
        console.error("Error fetching recent workers:", error);
        return [];
    }
}

/**
 * Helper to safely map Firestore job document to Job type.
 */
function mapJobDoc(doc: QueryDocumentSnapshot<DocumentData>): Job {
    const data = doc.data();
    return {
        id: doc.id,
        jobTitle: data.jobTitle ?? 'N/A',
        householdName: data.householdName ?? 'N/A',
        workerName: data.workerName ?? null,
        serviceType: data.serviceType ?? 'N/A',
        status: data.status ?? 'open',
        createdAt: formatDate(data.createdAt),
    } as Job;
}

/**
 * Fetches the 5 most recent job postings.
 * Returns an array of Job objects with safe defaults.
 */
export async function getRecentJobPostings(): Promise<Job[]> {
    try {
        const jobsCollection = collection(db, 'jobs');
        const q = query(jobsCollection, orderBy('createdAt', 'desc'), limit(5));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return [];
        }

        return querySnapshot.docs.map(mapJobDoc);
    } catch (error) {
        console.error("Error fetching recent jobs:", error);
        return [];
    }
}
