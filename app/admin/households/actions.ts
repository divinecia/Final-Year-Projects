
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';

export async function updateHousehold(householdId: string, updates: Partial<HouseholdFirestore>): Promise<{ success: boolean; error?: string }> {
  try {
    const householdRef = doc(db, 'households', householdId);
    await updateDoc(householdRef, updates);
    // ...existing code...
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error updating household: ", error.message);
      return { success: false, error: error.message };
    } else {
      console.error("Error updating household: ", error);
      return { success: false, error: 'Failed to update household.' };
    }
  }
}

// ...existing code...

export type Household = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended';
  dateJoined: string;
};

type HouseholdFirestore = {
  fullName?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'suspended';
  dateJoined?: Timestamp | string;
};

function formatDate(date: Timestamp | string | undefined): string {
  if (!date) return '';
  if (typeof date === 'string') return new Date(date).toLocaleDateString();
  if (date instanceof Timestamp) return date.toDate().toLocaleDateString();
  return '';
}

export async function getHouseholds(): Promise<Household[]> {
  try {
    const householdsCollection = collection(db, 'households');
    const q = query(householdsCollection, orderBy('dateJoined', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data() as HouseholdFirestore;
      return {
        id: docSnap.id,
        fullName: data.fullName ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        status: data.status ?? 'active',
        dateJoined: formatDate(data.dateJoined) || new Date().toLocaleDateString(),
      };
    });
  } catch (error) {
    console.error("Error fetching households: ", error);
    return [];
  }
}

export async function deleteHousehold(householdId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, 'households', householdId));
    // ...existing code...
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error deleting household: ", error.message);
      return { success: false, error: error.message };
    } else {
      console.error("Error deleting household: ", error);
      return { success: false, error: 'Failed to delete household.' };
    }
  }
}
