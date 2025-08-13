import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, Timestamp, getDocs, doc, getDoc, limit } from 'firebase/firestore';
import type { Worker } from '../find-worker/actions';
import type { Booking } from '../bookings/actions';

const DEFAULT_AVATAR = 'https://ui-avatars.io/api/?name=Worker&background=3B82F6&color=ffffff&size=100';

export async function getTopRatedWorkers(): Promise<Worker[]> {
  const workersCollection = collection(db, 'workers');
  try {
    const q = query(
      workersCollection,
      where('status', '==', 'active'),
      orderBy('rating', 'desc'),
      limit(3)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        fullName: data.personalInfo?.fullName ?? data.fullName ?? 'No Name',
        profilePictureUrl: data.personalInfo?.profilePictureUrl ?? data.profilePictureUrl ?? undefined,
        rating: data.performance?.averageRating ?? data.rating ?? 0,
        reviewsCount: data.performance?.totalReviews ?? data.reviewsCount ?? 0,
        skills: data.workProfile?.skills ?? data.skills ?? [],
        status: data.accountStatus?.isActive ? 'active' : 'inactive',
      } as Worker;
    });
  } catch (error) {
    console.error("Error fetching top rated workers: ", error);
    return [];
  }
}

export async function getUpcomingBooking(householdId: string): Promise<Booking | null> {
  if (!householdId) return null;

  try {
    const jobsCollection = collection(db, 'jobs');
    const q = query(
      jobsCollection,
      where('householdId', '==', householdId),
      where('status', '==', 'assigned'),
      orderBy('createdAt', 'asc'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    const createdAt = data.createdAt as Timestamp | undefined;
    const jobDate = createdAt?.toDate();

    return {
      id: docSnap.id,
      jobTitle: data.jobTitle ?? 'N/A',
      householdName: data.householdName ?? 'N/A',
      workerName: data.workerName ?? null,
      serviceType: data.serviceType ?? 'N/A',
      status: data.status ?? 'open',
      createdAt: jobDate?.toLocaleDateString() ?? '',
      jobDate: jobDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) ?? 'N/A',
      jobTime: jobDate?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) ?? 'N/A',
      workerProfilePictureUrl: await getWorkerProfilePicture(data.workerId),
      householdId: data.householdId ?? householdId,
    };
  } catch (error) {
    console.error("Error fetching upcoming booking: ", error);
    return null;
  }
}

async function getWorkerProfilePicture(workerId?: string): Promise<string> {
  if (!workerId) return DEFAULT_AVATAR;

  try {
    const workerDoc = await getDoc(doc(db, 'workers', workerId));
    if (!workerDoc.exists()) return DEFAULT_AVATAR;

    const workerData = workerDoc.data();
    const profilePicture = workerData.personalInfo?.profilePictureUrl ?? workerData.profilePictureUrl;
    const fullName = workerData.personalInfo?.fullName ?? workerData.fullName ?? 'Worker';

    return profilePicture || `https://ui-avatars.io/api/?name=${encodeURIComponent(fullName)}&background=3B82F6&color=ffffff&size=100`;
  } catch (error) {
    console.error('Error fetching worker profile picture:', error);
    return DEFAULT_AVATAR;
  }
}
