'use server';

import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';

export const trainingSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  category: z.string({ required_error: 'Please select a category.' }),
  duration: z.string().min(1, 'Duration is required.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  status: z.enum(['active', 'archived']).default('active'),
  // materialUrl: z.string().url().optional(),
});

export type TrainingProgram = z.infer<typeof trainingSchema> & {
  id: string;
  createdAt: string;
};
export type TrainingFormData = z.infer<typeof trainingSchema>;

export type TrainingRequest = {
  id: string;
  workerId: string;
  workerName: string;
  workerEmail: string;
  trainingId: string;
  trainingTitle: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  message?: string;
};

const TRAINING_COLLECTION = 'training';
const TRAINING_REQUESTS_COLLECTION = 'trainingRequests';
const ADMIN_TRAINING_PATH = '/admin/training';

function handleError(error: unknown, message: string) {
  console.error(message, error);
  return { success: false, error: message, details: error instanceof Error ? error.message : String(error) };
}

export async function createTraining(data: TrainingFormData) {
  try {
    // Validate data before proceeding
    const parsed = trainingSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: 'Validation failed', details: parsed.error.flatten() };
    }

    const trainingData = {
      ...parsed.data,
      createdAt: Timestamp.now(),
    };
    await addDoc(collection(db, TRAINING_COLLECTION), trainingData);
    revalidatePath(ADMIN_TRAINING_PATH);
    return { success: true };
  } catch (error) {
    return handleError(error, 'Failed to create training program.');
  }
}

export async function getTrainings(): Promise<TrainingProgram[]> {
  try {
    const trainingsCollection = collection(db, TRAINING_COLLECTION);
    const q = query(trainingsCollection, orderBy('createdAt', 'desc'));
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
    handleError(error, 'Error fetching trainings:');
    return [];
  }
}

export async function getTrainingRequests(): Promise<TrainingRequest[]> {
  try {
    const requestsCollection = collection(db, TRAINING_REQUESTS_COLLECTION);
    const q = query(requestsCollection, orderBy('requestedAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        workerId: data.workerId ?? '',
        workerName: data.workerName ?? '',
        workerEmail: data.workerEmail ?? '',
        trainingId: data.trainingId ?? '',
        trainingTitle: data.trainingTitle ?? '',
        status: data.status ?? 'pending',
        requestedAt: (data.requestedAt as Timestamp)?.toDate().toISOString() ?? '',
        message: data.message ?? '',
      };
    });
  } catch (error) {
    handleError(error, 'Error fetching training requests:');
    return [];
  }
}

export async function approveTrainingRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const requestRef = doc(db, TRAINING_REQUESTS_COLLECTION, requestId);
    await updateDoc(requestRef, {
      status: 'approved',
      approvedAt: Timestamp.now(),
    });
    revalidatePath(ADMIN_TRAINING_PATH);
    return { success: true };
  } catch (error) {
    return handleError(error, 'Failed to approve training request.');
  }
}

export async function rejectTrainingRequest(requestId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const requestRef = doc(db, TRAINING_REQUESTS_COLLECTION, requestId);
    await updateDoc(requestRef, {
      status: 'rejected',
      rejectedAt: Timestamp.now(),
      rejectionReason: reason || '',
    });
    revalidatePath(ADMIN_TRAINING_PATH);
    return { success: true };
  } catch (error) {
    return handleError(error, 'Failed to reject training request.');
  }
}

export async function deleteTraining(trainingId: string) {
  try {
    await deleteDoc(doc(db, TRAINING_COLLECTION, trainingId));
    revalidatePath(ADMIN_TRAINING_PATH);
    return { success: true };
  } catch (error) {
    return handleError(error, 'Failed to delete training program.');
  }
}
