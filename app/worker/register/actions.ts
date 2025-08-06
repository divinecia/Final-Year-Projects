
'use server';

import { createUserProfile, getUserProfile } from '@/lib/database';
import { uploadFile } from '@/lib/storage';
import { Timestamp } from 'firebase/firestore';
import type { WorkerFormData } from './schemas';

export type FormData = WorkerFormData;

export async function saveWorkerProfile(formData: FormData, userId: string) {
  try {
    // Check if profile already exists
    const existingProfile = await getUserProfile('worker', userId);
    if (existingProfile.success) {
      console.log('⚠️ Worker profile already exists');
      return { 
        success: false, 
        error: 'Profile already exists for this user' 
      };
    }

    // Handle file uploads
    const profilePictureUrl = formData.profilePicture
      ? await uploadFile(formData.profilePicture, `workers/${userId}/profile/`)
      : null;
    const idFrontUrl = formData.idFront
      ? await uploadFile(formData.idFront, `workers/${userId}/documents/`)
      : null;
    const idBackUrl = formData.idBack
      ? await uploadFile(formData.idBack, `workers/${userId}/documents/`)
      : null;
    const selfieUrl = formData.selfie
      ? await uploadFile(formData.selfie, `workers/${userId}/documents/`)
      : null;

    const workerData = {
        uid: userId,
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        
        // Personal Information
        dob: Timestamp.fromDate(formData.dob),
        gender: formData.gender,
        nationalId: formData.nationalId,
        
        // Address
        address: {
            district: formData.district,
            sector: formData.sector,
            line1: formData.address,
        },
        
        // Emergency Contact
        emergencyContact: {
            name: formData.emergencyContactName,
            phone: formData.emergencyContactPhone,
            relationship: formData.emergencyContactRelationship,
        },
        
        // Professional Information
        experienceYears: formData.experience[0] || 0,
        bio: formData.description || '',
        skills: formData.services,
        languages: formData.languages,
        previousEmployers: formData.previousEmployers || '',
        
        // Availability & Preferences
        availableDays: formData.availableDays || [],
        preferredHours: formData.preferredHours || '',
        flexibility: formData.flexibility || 'full-time',
        oneTimeJobs: formData.oneTimeJobs || false,
        recurringJobs: formData.recurringJobs || false,
        emergencyServices: formData.emergencyServices || false,
        travelDistance: formData.travelDistance || [5],
        hourlyRate: formData.hourlyRate || [500, 1000],
        
        // Profile & Media
        profilePictureUrl: profilePictureUrl,
        certificatesUrl: null, // Will be added later if needed
        idFrontUrl: idFrontUrl,
        idBackUrl: idBackUrl,
        selfieUrl: selfieUrl,
        
        // Performance Metrics
        rating: 0,
        reviewsCount: 0,
        jobsCompleted: 0,
        
        // System Fields
        status: 'pending' as const,
        verificationStatus: 'pending' as const,
        userType: 'worker' as const,
        isActive: true,
        emailVerified: false,
        profileCompleted: true,
    };

    const result = await createUserProfile('worker', userId, workerData);
    
    if (result.success) {
      console.log("✅ Worker profile saved successfully for user ID: ", userId);
      return { success: true, id: userId };
    } else {
      return { success: false, error: result.error || "Failed to save worker profile to database." };
    }
  } catch (error: unknown) {
    console.error("❌ Error saving worker profile: ", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `Failed to save worker profile: ${errorMessage}` };
  }
}
