
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, Timestamp, getDocs } from 'firebase/firestore';

export type ScheduledJob = {
    id: string;
    jobTitle: string;
    householdName: string;
    householdLocation: string;
    status: 'assigned' | 'completed' | 'cancelled';
    jobDate: Date;
    jobTime: string;
};

export async function getWorkerSchedule(workerId: string): Promise<ScheduledJob[]> {
    const schedule: ScheduledJob[] = [];

    if (!workerId) {
        return schedule;
    }

    try {
        const jobsCollection = collection(db, 'jobs');
        // Fetch jobs that are assigned to this worker and are not completed or cancelled
        const q = query(
            jobsCollection,
            where('workerId', '==', workerId),
            where('status', 'in', ['assigned']),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return schedule;
        }

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const createdAt = data.createdAt as Timestamp;

            schedule.push({
                id: doc.id,
                jobTitle: data.jobTitle || 'N/A',
                householdName: data.householdName || 'N/A',
                householdLocation: data.householdLocation || 'N/A',
                status: data.status,
                jobDate: createdAt.toDate(),
                jobTime: createdAt.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            });
        });

        return schedule;

    } catch (error) {
        console.error("Error fetching worker schedule: ", error);
        return [];
    }
}
