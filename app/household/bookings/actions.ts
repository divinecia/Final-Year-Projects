'use server';

import { db } from '@/lib/firebase';
import {
    collection,
    query,
    where,
    orderBy,
    Timestamp,
    getDocs,
    doc,
    updateDoc,
    addDoc,
    getDoc
} from 'firebase/firestore';
import type { Job } from '@/app/admin/jobs/actions';
import {
    handleApiResponse,
    type ApiResponse
} from '@/lib/api-utils';

export type Booking = Job & {
    workerProfilePictureUrl?: string;
    workerPhone?: string;
    jobDate?: string;
    jobTime?: string;
    householdId?: string;
    workerId?: string;
};

async function getWorkerDetails(workerId: string): Promise<{ workerPhone?: string; workerProfilePictureUrl?: string }> {
    if (!workerId) return {};
    try {
        const workerDoc = await getDoc(doc(db, 'workers', workerId));
        if (workerDoc.exists()) {
            const workerData = workerDoc.data();
            return {
                workerPhone: workerData.phone ?? '0781234567',
                workerProfilePictureUrl:
                    workerData.profilePictureUrl ??
                    `https://ui-avatars.io/api/?name=${encodeURIComponent(workerData.fullName ?? 'Worker')}&background=3B82F6&color=ffffff&size=100`
            };
        }
    } catch (error) {
        console.error('Error fetching worker details:', error);
    }
    return {
        workerPhone: '0781234567',
        workerProfilePictureUrl: 'https://ui-avatars.io/api/?name=Worker&background=3B82F6&color=ffffff&size=100'
    };
}

export async function getHouseholdBookings(householdId: string): Promise<{ upcoming: Booking[]; past: Booking[] }> {
    const upcoming: Booking[] = [];
    const past: Booking[] = [];

    if (!householdId) return { upcoming, past };

    try {
        const jobsCollection = collection(db, 'jobs');
        const q = query(
            jobsCollection,
            where('householdId', '==', householdId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return { upcoming, past };

        for (const docSnap of querySnapshot.docs) {
            const data = docSnap.data();
            const createdAt = (data.createdAt as Timestamp)?.toDate();

            const workerDetails = data.workerId ? await getWorkerDetails(data.workerId) : {};

            const booking: Booking = {
                id: docSnap.id,
                jobTitle: data.jobTitle ?? 'N/A',
                householdName: data.householdName ?? 'N/A',
                workerName: data.workerName ?? null,
                serviceType: data.serviceType ?? 'N/A',
                status: data.status ?? 'open',
                createdAt: createdAt?.toLocaleDateString() ?? '',
                jobDate: createdAt?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) ?? 'N/A',
                jobTime: createdAt?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) ?? 'N/A',
                householdId: data.householdId ?? householdId,
                workerId: data.workerId,
                ...workerDetails
            };

            if (['completed', 'cancelled'].includes(booking.status)) {
                past.push(booking);
            } else {
                upcoming.push(booking);
            }
        }
        return { upcoming, past };
    } catch (error) {
        console.error('Error fetching household bookings:', error);
        return { upcoming: [], past: [] };
    }
}

export async function cancelBooking(bookingId: string): Promise<ApiResponse> {
    return handleApiResponse(async () => {
        await updateDoc(doc(db, 'jobs', bookingId), {
            status: 'cancelled',
            cancelledAt: Timestamp.now()
        });
        return { message: 'Booking cancelled successfully' };
    });
}

export async function rescheduleBooking(
    bookingId: string,
    newDate: string,
    newTime: string
): Promise<ApiResponse> {
    return handleApiResponse(async () => {
        await updateDoc(doc(db, 'jobs', bookingId), {
            requestedDate: newDate,
            requestedTime: newTime,
            status: 'rescheduled',
            rescheduledAt: Timestamp.now()
        });
        return { message: 'Reschedule request sent successfully' };
    });
}

export async function createReviewBooking(originalBooking: Booking): Promise<ApiResponse<{ jobId: string }>> {
    return handleApiResponse(async () => {
        const docRef = await addDoc(collection(db, 'jobs'), {
            jobTitle: originalBooking.jobTitle,
            serviceType: originalBooking.serviceType,
            householdId: originalBooking.householdId,
            householdName: originalBooking.householdName,
            status: 'open',
            createdAt: Timestamp.now(),
            isRebooking: true,
            originalBookingId: originalBooking.id
        });
        return {
            jobId: docRef.id,
            message: 'New booking created successfully'
        };
    });
}
