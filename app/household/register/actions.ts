
'use server';

import { createUserProfile, getUserProfile } from '@/lib/database';
import type { HouseholdFormData } from './schemas';

export type FullFormData = HouseholdFormData;

export async function saveHouseholdProfile(formData: FullFormData, userId: string) {
  try {
    // Check if profile already exists
    const existingProfile = await getUserProfile('household', userId);
    if (existingProfile.success) {
      console.log('⚠️ Household profile already exists');
      return { 
        success: false, 
        error: 'Profile already exists for this user' 
      };
    }

    const householdData = {
        uid: userId,
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: {
            district: formData.district,
            sector: formData.sector,
            line1: formData.address,
        },
        property: {
            type: formData.propertyType,
            rooms: formData.numRooms,
            garden: formData.hasGarden === 'yes',
        },
        family: {
            adults: formData.numAdults,
            children: formData.numChildren,
            pets: formData.hasPets,
            petInfo: formData.petInfo || '',
        },
        services: {
            primary: formData.primaryServices,
            frequency: formData.serviceFrequency,
        },
        status: 'active' as const,
        userType: 'household' as const,
        isActive: true,
        emailVerified: false,
        profileCompleted: true,
        totalBookings: 0,
        totalSpent: 0,
    };

    const result = await createUserProfile('household', userId, householdData);
    
    if (result.success) {
      console.log("✅ Household profile saved successfully for user ID: ", userId);
      return { success: true, id: userId };
    } else {
      return { success: false, error: result.error || "Failed to save household profile to database." };
    }
  } catch (error) {
    console.error("❌ Error saving household profile: ", error);
    let errorMsg = 'Failed to save household profile.';
    if (error instanceof Error) {
      errorMsg = `Failed to save household profile: ${error.message}`;
    }
    return { success: false, error: errorMsg };
  }
}
