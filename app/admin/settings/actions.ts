'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  dateJoined: string; // ISO string
};

type FirestoreAdmin = {
  fullName?: string;
  email?: string;
  role?: string;
  status?: string;
  dateJoined?: Timestamp;
};

function formatDate(date: Date): string {
  return date.toISOString();
}

export async function getAdmins(): Promise<AdminUser[]> {
  const adminsCollection = collection(db, 'admins');
  const q = query(adminsCollection, orderBy('dateJoined', 'desc'));

  try {
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data() as FirestoreAdmin;
      return {
        id: docSnap.id,
        fullName: String(data.fullName ?? ''),
        email: String(data.email ?? ''),
        role: String(data.role ?? 'support_agent'),
        status: data.status === 'inactive' ? 'inactive' : 'active',
        dateJoined: data.dateJoined instanceof Timestamp
          ? formatDate(data.dateJoined.toDate())
          : '',
      };
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    // Optionally, rethrow or handle differently in production
    return [];
  }
}

export async function deleteAdmin(adminId: string): Promise<{ success: boolean; error?: string }> {
  if (!adminId) {
    return { success: false, error: 'Admin ID is required.' };
  }
  try {
    await deleteDoc(doc(db, 'admins', adminId));
    await revalidatePath('/admin/settings');
    return { success: true };
  } catch (error) {
    console.error('Error deleting admin:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete admin.' };
  }
}
