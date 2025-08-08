
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, getDoc, doc, Timestamp, limit, orderBy } from 'firebase/firestore';
import type { Job } from '../jobs/actions';

export type WorkerDashboardStats = {
    jobInvitations: number;
    upcomingJobs: number;
    rating: number;
    monthEarnings: number;
};

export async function getWorkerDashboardStats(workerId: string): Promise<WorkerDashboardStats> {
    if (!workerId) {
        return { jobInvitations: 0, upcomingJobs: 0, rating: 0, monthEarnings: 0 };
    }

    try {
        // For "Job Invitations", we'll count all open jobs as potential invitations
        const openJobsQuery = query(collection(db, 'jobs'), where('status', '==', 'open'));
        const openJobsSnap = await getDocs(openJobsQuery);

        // Upcoming jobs are jobs assigned to the worker
        const upcomingJobsQuery = query(collection(db, 'jobs'), where('workerId', '==', workerId), where('status', '==', 'assigned'));
        const upcomingJobsSnap = await getDocs(upcomingJobsQuery);

        // Get rating from the worker's profile using the schema structure
        const workerRef = doc(db, 'workers', workerId);
        const workerSnap = await getDoc(workerRef);
        let rating = 0;
        if (workerSnap.exists()) {
            const workerData = workerSnap.data();
            rating = workerData.performance?.averageRating || workerData.rating || 0;
        }
        
        // Calculate this month's earnings using the schema structure
        const now = new Date();
        const startOfMonth = Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), 1));
        const paymentsQuery = query(
            collection(db, 'servicePayments'),
            where('workerId', '==', workerId),
            where('status', '==', 'completed'),
            where('createdAt', '>=', startOfMonth)
        );
        const paymentsSnap = await getDocs(paymentsQuery);
        const monthEarnings = paymentsSnap.docs.reduce((sum, doc) => {
            const data = doc.data();
            // Use netAmount from schema, fallback to amount
            return sum + (data.netAmount || data.amount || 0);
        }, 0);

        return {
            jobInvitations: openJobsSnap.size,
            upcomingJobs: upcomingJobsSnap.size,
            rating: rating,
            monthEarnings: monthEarnings,
        };

    } catch (error) {
        console.error("Error fetching worker dashboard stats: ", error);
        return { jobInvitations: 0, upcomingJobs: 0, rating: 0, monthEarnings: 0 };
    }
}


export async function getNewJobOpportunities(): Promise<Job[]> {
  try {
    const jobsCollection = collection(db, 'jobs');
    const q = query(jobsCollection, where('status', '==', 'open'), orderBy('createdAt', 'desc'), limit(2));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return [];
    }

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        jobTitle: data.jobTitle || 'N/A',
        householdName: data.householdName || 'N/A',
        householdLocation: data.householdLocation || 'N/A',
        serviceType: data.serviceType || 'N/A',
        status: data.status,
        // Access salary from compensation object according to schema
        salary: data.compensation?.salary || data.salary || 0,
        payFrequency: data.compensation?.payFrequency || data.payFrequency || 'N/A',
      } as Job;
    });
  } catch (error) {
    console.error("Error fetching job opportunities: ", error);
    return [];
  }
}
