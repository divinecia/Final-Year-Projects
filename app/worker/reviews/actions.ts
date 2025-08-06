
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, Timestamp, getDocs, getDoc, doc } from 'firebase/firestore';

export type Review = {
    id: string;
    householdName: string;
    rating: number;
    comment: string;
    reviewDate: string;
    householdProfilePictureUrl?: string;
};

export type ReviewSummary = {
    averageRating: number;
    reviewsCount: number;
    reviews: Review[];
};

export async function getWorkerReviews(workerId: string): Promise<ReviewSummary> {
    const summary: ReviewSummary = { averageRating: 0, reviewsCount: 0, reviews: [] };
    if (!workerId) return summary;

    try {
        // Fetch worker's main profile to get aggregate data
        const workerRef = doc(db, 'worker', workerId);
        const workerSnap = await getDoc(workerRef);
        if (workerSnap.exists()) {
            const workerData = workerSnap.data();
            summary.averageRating = workerData.rating || 0;
            summary.reviewsCount = workerData.reviewsCount || 0;
        }

        // Fetch individual reviews from the jobs collection
        const jobsCollection = collection(db, 'jobs');
        const q = query(
            jobsCollection,
            where('workerId', '==', workerId),
            where('status', '==', 'completed'),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        
        const reviews: Review[] = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.review) {
                const reviewDate = data.review.createdAt as Timestamp;
                reviews.push({
                    id: doc.id,
                    householdName: data.householdName || 'A Household',
                    rating: data.review.rating,
                    comment: data.review.comment,
                    reviewDate: reviewDate?.toDate().toLocaleDateString() || '',
                    householdProfilePictureUrl: 'https://placehold.co/100x100.png',
                });
            }
        });

        summary.reviews = reviews;
        return summary;
    } catch (error) {
        console.error("Error fetching worker reviews: ", error);
        return summary;
    }
}
