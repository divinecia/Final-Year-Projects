'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// Firestore document data type
type WorkerDoc = {
  fullName?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'pending' | 'suspended';
  dateJoined?: Timestamp;
};

// App-level type
export type Worker = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'suspended';
  dateJoined: string; // ISO string
};

function mapWorkerDoc(id: string, data: WorkerDoc): Worker {
  return {
    id,
    fullName: data.fullName ?? '',
    email: data.email ?? '',
    phone: data.phone ?? '',
    status: data.status ?? 'pending',
    dateJoined: data.dateJoined instanceof Timestamp
      ? data.dateJoined.toDate().toISOString()
      : '',
  };
}

/**
 * Fetch all workers, ordered by dateJoined descending.
 */
export async function getWorkers(): Promise<Worker[]> {
  try {
    const workersCollection = collection(db, 'worker');
    const q = query(workersCollection, orderBy('dateJoined', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(docSnap =>
      mapWorkerDoc(docSnap.id, docSnap.data() as WorkerDoc)
    );
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "message" in error) {
      console.error("Error fetching workers:", (error as { message?: string }).message ?? error);
    } else {
      console.error("Error fetching workers:", error);
    }
    return [];
  }
}

/**
 * Update a worker's status.
 */
async function updateWorkerStatus(
  workerId: string,
  status: Worker['status']
): Promise<{ success: boolean; error?: string }> {
  try {
    const workerRef = doc(db, 'worker', workerId);
    await updateDoc(workerRef, { status });
    return { success: true };
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "message" in error) {
      console.error(`Error updating worker status to ${status}:`, (error as { message?: string }).message ?? error);
    } else {
      console.error(`Error updating worker status to ${status}:`, error);
    }
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function approveWorker(workerId: string) {
  return updateWorkerStatus(workerId, 'active');
}

export async function suspendWorker(workerId: string) {
  return updateWorkerStatus(workerId, 'suspended');
}

/**
 * Delete a worker by ID.
 */
export async function deleteWorker(
  workerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const workerRef = doc(db, 'worker', workerId);
    await deleteDoc(workerRef);
    return { success: true };
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "message" in error) {
      console.error("Error deleting worker:", (error as { message?: string }).message ?? error);
    } else {
      console.error("Error deleting worker:", error);
    }
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
