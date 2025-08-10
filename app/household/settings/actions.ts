
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

export type HouseholdSettingsUpdate = Partial<HouseholdSettingsData>;

export type HouseholdProfile = HouseholdSettingsData & {
  id: string;
};


export async function getHouseholdProfile(userId: string): Promise<HouseholdProfile | null> {
    if (!userId) {
        console.error("No user ID provided.");
        return null;
    }

    try {
        const householdRef = doc(db, 'households', userId);
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


export async function updateHouseholdProfile(householdId: string, data: Partial<HouseholdSettingsData>): Promise<{ success: boolean; error?: string }> {
    if (!householdId || !data) {
        return { success: false, error: "Invalid household ID or data." };
    }

    try {
        const householdRef = doc(db, 'households', householdId);
        await updateDoc(householdRef, data);
        revalidatePath('/household/settings');
        return { success: true };
    } catch (error) {
        console.error("Error updating household profile:", error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to update profile.';
        return { success: false, error: errorMessage };
    }
}

export async function updateHouseholdPhoto(householdId: string, photoURL: string): Promise<{ success: boolean }> {
  try {
    const householdRef = doc(db, 'households', householdId);
    await updateDoc(householdRef, { photoURL });
    revalidatePath('/household/settings');
    return { success: true };
  } catch (error) {
    console.error("Error updating household photo: ", error);
    return { success: false };
  }
}
