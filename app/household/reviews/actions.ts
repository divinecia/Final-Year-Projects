
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, Timestamp, getDocs, doc, writeBatch, addDoc, getDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export type PendingReview = {
    jobId: string;
    jobTitle: string;
    serviceDate: string;
    workerId: string;
    workerName: string;
    workerProfilePictureUrl?: string;
};

export type PublishedReview = {
    id: string;
    workerName: string;
    workerProfilePictureUrl?: string;
    jobTitle: string;
    rating: number;
    comment: string;
    reviewDate: string;
};

// Helper function to create a notification
async function createNotification(userId: string, title: string, description: string) {
    try {
        await addDoc(collection(db, 'notifications'), {
            userId,
            title,
            description,
            createdAt: Timestamp.now(),
            read: false,
        });
    } catch (error) {
        console.error("Error creating notification: ", error);
    }
}


// Get jobs that are 'completed' and have no review yet.
export async function getPendingReviews(householdId: string): Promise<PendingReview[]> {
    if (!householdId) return [];

    try {
        const jobsCollection = collection(db, 'jobs');
        const q = query(
            jobsCollection, 
            where('householdId', '==', householdId),
            where('status', '==', 'completed'),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return [];
        }

        const pendingReviews: PendingReview[] = [];

        for (const jobDoc of querySnapshot.docs) {
            const jobData = jobDoc.data();
            
            // Check if a review already exists for this job
            const reviewsCollection = collection(db, 'reviews');
            const reviewQuery = query(
                reviewsCollection,
                where('jobId', '==', jobDoc.id),
                where('householdId', '==', householdId)
            );
            const existingReviews = await getDocs(reviewQuery);

            // Only include jobs that don't have reviews yet
            if (existingReviews.empty && jobData.workerId) {
                const createdAt = jobData.createdAt as Timestamp;
                pendingReviews.push({
                    jobId: jobDoc.id,
                    jobTitle: jobData.jobTitle || 'N/A',
                    serviceDate: createdAt?.toDate().toLocaleDateString() || '',
                    workerId: jobData.workerId,
                    workerName: jobData.workerName || 'N/A',
                    workerProfilePictureUrl: jobData.workerProfilePictureUrl || 'https://placehold.co/100x100.png',
                });
            }
        }

        return pendingReviews;
    } catch (error) {
        console.error("Error fetching pending reviews: ", error);
        return [];
    }
}

export async function submitReview(
    householdId: string, 
    jobId: string, 
    workerId: string, 
    rating: number, 
    comment: string
): Promise<{ success: boolean, error?: string }> {
    if (!householdId || !jobId || !workerId) {
        return { success: false, error: "Missing required information." };
    }

    try {
        const batch = writeBatch(db);

        // Get job and worker details for the review
        const jobRef = doc(db, 'jobs', jobId);
        const jobSnap = await getDoc(jobRef);
        const workerRef = doc(db, 'worker', workerId);
        const workerSnap = await getDoc(workerRef);

        if (!jobSnap.exists() || !workerSnap.exists()) {
            return { success: false, error: "Job or worker not found." };
        }

        const jobData = jobSnap.data();
        const workerData = workerSnap.data();

        // 1. Create the review document in the reviews collection
        const reviewsCollection = collection(db, 'reviews');
        const reviewData = {
            rating,
            comment,
            jobId,
            householdId,
            workerId,
            workerName: workerData.fullName || 'N/A',
            jobTitle: jobData.jobTitle || 'N/A',
            serviceDate: jobData.createdAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
            createdAt: Timestamp.now(),
        };
        
        await addDoc(reviewsCollection, reviewData);

        // 2. Update the worker's aggregate rating
        const currentRating = workerData.rating || 0;
        const reviewsCount = workerData.reviewsCount || 0;
        
        const newReviewsCount = reviewsCount + 1;
        const newTotalRating = (currentRating * reviewsCount) + rating;
        const newAverageRating = newTotalRating / newReviewsCount;

        batch.update(workerRef, {
            rating: newAverageRating,
            reviewsCount: newReviewsCount,
        });
        
        await batch.commit();
        
        // 3. Create a notification for the worker
        const householdSnap = await getDoc(doc(db, 'household', householdId));
        const householdName = householdSnap.data()?.fullName || 'A household';
        await createNotification(
            workerId,
            `You received a new ${rating}-star review!`,
            `${householdName} left you a review for your recent job.`
        );

        revalidatePath('/household/reviews');
        revalidatePath('/worker/reviews');
        revalidatePath(`/household/worker-profile/${workerId}`);
        revalidatePath('/worker/notifications');

        return { success: true };

    } catch (error) {
        console.error("Error submitting review: ", error);
        return { success: false, error: "Failed to submit review." };
    }
}


export async function getPublishedReviews(householdId: string): Promise<PublishedReview[]> {
    if (!householdId) return [];

    try {
        const reviewsCollection = collection(db, 'reviews');
        const q = query(
            reviewsCollection, 
            where('householdId', '==', householdId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        
        const reviews: PublishedReview[] = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            const reviewDate = data.createdAt as Timestamp;
            reviews.push({
                id: doc.id,
                workerName: data.workerName || 'N/A',
                workerProfilePictureUrl: 'https://placehold.co/100x100.png', // Can be enhanced later
                jobTitle: data.jobTitle || 'N/A',
                rating: data.rating,
                comment: data.comment,
                reviewDate: reviewDate?.toDate().toLocaleDateString() || '',
            });
        });
        
        return reviews;

    } catch (error) {
        console.error("Error fetching published reviews: ", error);
        return [];
    }
}
