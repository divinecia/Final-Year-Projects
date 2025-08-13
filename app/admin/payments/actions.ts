'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp, DocumentData } from 'firebase/firestore';

export type ServicePayment = {
  id: string;
  date: string;
  householdName: string;
  workerName: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
};

export type TrainingPayment = {
  id: string;
  date: string;
  workerName: string;
  courseTitle: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
};

// Helper to safely extract and format a Firestore Timestamp
function formatDate(ts?: Timestamp | string): string {
  if (!ts) return '';
  if (typeof ts === 'string') return ts;
  if (ts instanceof Timestamp) return ts.toDate().toLocaleDateString();
  return '';
}

function getStatus(status: unknown): 'completed' | 'pending' | 'failed' {
  if (status === 'completed' || status === 'pending' || status === 'failed') return status;
  return 'pending';
}

export async function getServicePayments(): Promise<ServicePayment[]> {
  try {
    const paymentsCollection = collection(db, 'servicePayments');
    const q = query(paymentsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return [];

    return querySnapshot.docs.map(doc => {
      const data = doc.data() as DocumentData;
      const date = data.createdAt ?? data.date;
      return {
        id: doc.id,
        date: formatDate(date),
        householdName: data.householdName || 'N/A',
        workerName: data.workerName || 'N/A',
        amount: typeof data.amount === 'number' ? data.amount : 0,
        status: getStatus(data.status),
      };
    });
  } catch (error) {
    console.error("Error fetching service payments: ", error);
    return [];
  }
}

export async function getTrainingPayments(): Promise<TrainingPayment[]> {
  try {
    const paymentsCollection = collection(db, 'trainingPayments');
    // Try to order by 'date', fallback to 'createdAt' if needed
    let q;
    try {
      q = query(paymentsCollection, orderBy('date', 'desc'));
    } catch {
      q = query(paymentsCollection, orderBy('createdAt', 'desc'));
    }
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return [];

    return querySnapshot.docs.map(doc => {
      const data = doc.data() as DocumentData;
      // Fallback: use createdAt if date is missing
      const date = data.date ?? data.createdAt;
      return {
        id: doc.id,
        date: formatDate(date),
        workerName: data.workerName || 'N/A',
        courseTitle: data.courseTitle || 'N/A',
        amount: typeof data.amount === 'number' ? data.amount : 0,
        status: getStatus(data.status),
      };
    });
  } catch (error) {
    console.error("Error fetching training payments: ", error);
    return [];
  }
}
