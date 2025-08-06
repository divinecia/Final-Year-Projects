'use server';

import { db } from '@/lib/firebase';
import {
    doc,
    updateDoc,
    Timestamp,
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// Server action for approving jobs
export async function approveJobAction(jobId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const jobRef = doc(db, 'jobs', jobId);
        await updateDoc(jobRef, {
            status: 'open',
            updatedAt: Timestamp.now(),
        });

        // Note: Job data fetching would be used for notifications in full implementation

        revalidatePath('/admin/jobs');
        revalidatePath('/household/bookings');

        // Note: Notification creation would need to be handled separately
        // as it requires more complex Firebase operations

        return { success: true };
    } catch (error) {
        console.error("Error approving job: ", error);
        return { success: false, error: (error as Error).message || 'Failed to approve job.' };
    }
}
