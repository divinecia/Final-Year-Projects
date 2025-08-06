'use server';

import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  Timestamp,
  doc,
  getDoc 
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export type TrainingProgram = {
  id: string;
  title: string;
  category: string;
  duration: string;
  description: string;
  status: 'active' | 'archived';
  createdAt: string;
};

export type TrainingRequest = {
  id: string;
  trainingId: string;
  trainingTitle: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
};

export async function getAvailableTrainings(): Promise<TrainingProgram[]> {
  try {
    const trainingsCollection = collection(db, 'training');
    const q = query(
      trainingsCollection, 
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title ?? '',
        category: data.category ?? '',
        duration: data.duration ?? '',
        description: data.description ?? '',
        status: data.status ?? 'active',
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() ?? '',
      };
    });
  } catch (error) {
    console.error('Error fetching training programs:', error);
    return [];
  }
}

export async function getWorkerTrainingRequests(workerId: string): Promise<TrainingRequest[]> {
  try {
    const requestsCollection = collection(db, 'trainingRequests');
    const q = query(
      requestsCollection,
      where('workerId', '==', workerId),
      orderBy('requestedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        trainingId: data.trainingId ?? '',
        trainingTitle: data.trainingTitle ?? '',
        status: data.status ?? 'pending',
        requestedAt: (data.requestedAt as Timestamp)?.toDate().toISOString() ?? '',
        approvedAt: data.approvedAt ? (data.approvedAt as Timestamp).toDate().toISOString() : undefined,
        rejectedAt: data.rejectedAt ? (data.rejectedAt as Timestamp).toDate().toISOString() : undefined,
        rejectionReason: data.rejectionReason ?? '',
      };
    });
  } catch (error) {
    console.error('Error fetching training requests:', error);
    return [];
  }
}

export async function requestTraining(
  workerId: string,
  workerName: string,
  workerEmail: string,
  trainingId: string,
  message?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get training details
    const trainingDoc = await getDoc(doc(db, 'training', trainingId));
    if (!trainingDoc.exists()) {
      return { success: false, error: 'Training program not found.' };
    }

    const trainingData = trainingDoc.data();

    // Check if worker already requested this training
    const existingRequestQuery = query(
      collection(db, 'trainingRequests'),
      where('workerId', '==', workerId),
      where('trainingId', '==', trainingId)
    );
    const existingRequests = await getDocs(existingRequestQuery);

    if (!existingRequests.empty) {
      return { success: false, error: 'You have already requested this training.' };
    }

    // Create training request
    await addDoc(collection(db, 'trainingRequests'), {
      workerId,
      workerName,
      workerEmail,
      trainingId,
      trainingTitle: trainingData.title,
      status: 'pending',
      requestedAt: Timestamp.now(),
      message: message || '',
    });

    revalidatePath('/worker/training');
    return { success: true };
  } catch (error) {
    console.error('Error requesting training:', error);
    return { success: false, error: 'Failed to submit training request.' };
  }
}