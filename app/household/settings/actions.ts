
'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import * as z from 'zod';
import { revalidatePath } from 'next/cache';


export const HouseholdSettingsSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  // We can add more fields from the household registration here later
});

export type HouseholdSettingsData = z.infer<typeof HouseholdSettingsSchema>;

export type HouseholdProfile = HouseholdSettingsData & {
  id: string;
};


export async function getHouseholdProfile(userId: string): Promise<HouseholdProfile | null> {
    if (!userId) {
        console.error("No user ID provided.");
        return null;
    }

    try {
        const householdRef = doc(db, 'household', userId);
        const docSnap = await getDoc(householdRef);

        if (!docSnap.exists()) {
            console.error("Household document does not exist:", userId);
            return null;
        }

        const data = docSnap.data();
        
        return {
            id: docSnap.id,
            fullName: data.fullName || '',
            email: data.email || '',
        };
    } catch (error) {
        console.error("Error fetching household profile:", error);
        return null;
    }
}


export async function updateHouseholdProfile(householdId: string, data: HouseholdSettingsData): Promise<{ success: boolean }> {
  try {
    const householdRef = doc(db, 'household', householdId);
    
    const dataToUpdate = {
        fullName: data.fullName,
        email: data.email,
        // photoURL: would be updated here after file upload
    };

    await updateDoc(householdRef, dataToUpdate);
    revalidatePath('/household/settings');
    return { success: true };
  } catch (error) {
    console.error("Error updating household profile: ", error);
    return { success: false };
  }
}
