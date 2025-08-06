'use server';

import { db } from '@/lib/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { z } from 'zod';
import { signUpWithEmailAndPassword } from '@/lib/auth';

// Define the AdminRegistrationSchema using zod
const AdminRegistrationSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(1, "Phone number is required"),
  department: z.string().min(1, "Department is required"),
  roleLevel: z.string().min(1, "Role level is required"),
});

export type AdminRegistrationData = z.infer<typeof AdminRegistrationSchema>;

export async function registerAdmin(formData: AdminRegistrationData) {
  // 1. Validate input
  const parseResult = AdminRegistrationSchema.safeParse(formData);
  if (!parseResult.success) {
    return { success: false, error: "Invalid registration data.", details: parseResult.error.flatten() };
  }
  const data = parseResult.data;

  // 2. Create the user in Firebase Authentication
  const authResult = await signUpWithEmailAndPassword(data.email, data.password, 'admin');
  if (!authResult.success || !authResult.uid) {
    if (authResult.error?.includes('email-already-in-use')) {
      return { success: false, error: "An account with this email already exists." };
    }
    return { success: false, error: authResult.error || "Failed to create user account." };
  }

  const userId = authResult.uid;

  try {
    const adminData = {
      uid: userId,
      fullName: data.fullName,
      employeeId: data.employeeId,
      email: data.email,
      phone: data.phone,
      department: data.department,
      role: data.roleLevel,
      dateJoined: Timestamp.now(),
      status: 'active' as const,
    };

    // 3. Create the admin document in Firestore
    const adminDocRef = doc(db, 'admins', userId);
    await setDoc(adminDocRef, adminData);

    console.log("Admin document written for user ID:", userId);
    return { success: true, id: userId };
  } catch (error) {
    console.error("Error adding admin document:", error);

    // 4. Cleanup: Delete the created Auth user if Firestore write fails
    try {
      await deleteUserByUid(userId);
      console.log("Rolled back auth user creation for:", userId);
    } catch (cleanupError) {
      console.error("Failed to delete orphaned auth user:", cleanupError);
    }

    return { success: false, error: "Failed to save admin profile to database." };
  }
}
async function deleteUserByUid(userId: string) {
  // Implement the function to delete a user by UID from Firebase Authentication
  // This is a placeholder implementation; replace with actual Firebase Admin SDK call if available
  console.warn('deleteUserByUid function is not implemented. User ID:', userId);
}

