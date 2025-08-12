import { config } from 'dotenv';
import { resolve } from 'path';
import * as admin from 'firebase-admin';
import serviceAccount from '../config/househelp-42493-firebase-adminsdk-fbsvc-4126e55eb7.json';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
  });
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@househelp.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '@dM1Nd';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '0788123456';

const ADMINS_COLLECTION = 'admin';
const USERS_COLLECTION = 'users';

interface AdminLocation {
  province: string;
  district: string;
  municipality: string;
  neighborhood: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
  fullAddress: string;
}

interface AdminProfile {
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  permissions: string[];
  location: AdminLocation;
  userType: 'admin';
  isActive: boolean;
  emailVerified: boolean;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  canCreateAdmins: boolean;
  canDeleteUsers: boolean;
  canModifyPermissions: boolean;
  isSuperAdmin: boolean;
  collection?: string;
}

const ADMIN_CONFIG = {
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  phone: ADMIN_PHONE,
  fullName: 'Iradukunda Divine',
  role: 'admin',
  permissions: [
    'manage_users',
    'manage_workers',
    'manage_households',
    'manage_jobs',
    'manage_payments',
    'manage_reports',
    'manage_settings',
    'manage_system'
  ],
  location: {
    province: 'Vaud',
    district: 'Lausanne',
    municipality: 'Lausanne',
    neighborhood: 'Ouchy',
    street: 'Avenue de Rhodanie',
    houseNumber: '47B',
    postalCode: '1007',
    city: 'Lausanne',
    country: 'Switzerland',
    fullAddress: '47B Avenue de Rhodanie, 1007 Lausanne, Vaud, Switzerland'
  }
};

export async function seedAdminUser() {
  try {
    console.log('🌱 Starting admin user seeding...');

    // Check if admin already exists (by email as doc ID)
    const adminDoc = await adminDb.collection(ADMINS_COLLECTION).doc(ADMIN_CONFIG.email).get();
    if (adminDoc.exists) {
      console.log('⚠️ Admin user already exists, skipping creation');
      return { success: true, message: 'Admin user already exists' };
    }

    // Check if user exists in Firebase Auth
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(ADMIN_CONFIG.email);
      console.log('⚠️ Auth user exists, using existing user');
    } catch (authError: unknown) {
      if (authError instanceof Error && 'code' in authError && authError.code === 'auth/user-not-found') {
        // Create Firebase Auth user using Admin SDK
        console.log('👤 Creating Firebase Auth user...');
        userRecord = await adminAuth.createUser({
          email: ADMIN_CONFIG.email,
          password: ADMIN_CONFIG.password,
          emailVerified: true,
        });
      } else {
        throw authError;
      }
    }

    const userId = userRecord.uid;
    const now = new Date().toISOString();

    // Prepare admin profile
    const adminProfile: AdminProfile = {
      uid: userId,
      email: ADMIN_CONFIG.email,
      fullName: ADMIN_CONFIG.fullName,
      phone: ADMIN_CONFIG.phone,
      role: ADMIN_CONFIG.role,
      permissions: ADMIN_CONFIG.permissions,
      location: ADMIN_CONFIG.location,
      userType: 'admin',
      isActive: true,
      emailVerified: true,
      profileCompleted: true,
      createdAt: now,
      updatedAt: now,
      lastLogin: now,
      canCreateAdmins: true,
      canDeleteUsers: true,
      canModifyPermissions: true,
      isSuperAdmin: true,
    };

    // Save to admins collection (use UID as doc ID)
    await adminDb.collection(ADMINS_COLLECTION).doc(userId).set(adminProfile);
    console.log('✅ Admin profile created in Firestore');

    // Also save to users collection for unified user lookup
    await adminDb.collection(USERS_COLLECTION).doc(userId).set({
      ...adminProfile,
      collection: ADMINS_COLLECTION
    });
    console.log('✅ Admin reference added to users collection');

    console.log('🎉 Admin user seeding completed successfully!');
    console.log('👤 Full Name:', ADMIN_CONFIG.fullName);
    console.log('📧 Email:', ADMIN_CONFIG.email);
    console.log('📱 Phone:', ADMIN_CONFIG.phone);
    console.log('🏠 Location:', ADMIN_CONFIG.location.fullAddress);
    console.log('🆔 User ID:', userId);

    return {
      success: true,
      message: 'Admin user created successfully',
      userId,
      email: ADMIN_CONFIG.email
    };

  } catch (error: unknown) {
    console.error('❌ Error seeding admin user:', error);

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as { code: unknown }).code === 'string'
    ) {
      const code = (error as { code: string }).code;
      if (code === 'auth/email-already-in-use') {
        return {
          success: false,
          error: 'Email already in use. Admin might already exist.'
        };
      } else if (code === 'auth/weak-password') {
        return {
          success: false,
          error: 'Password is too weak. Please use a stronger password.'
        };
      } else if (code === 'auth/invalid-email') {
        return {
          success: false,
          error: 'Invalid email format.'
        };
      }
    }

    return {
      success: false,
      error: `Failed to create admin user: ${
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message?: string }).message
          : String(error)
      }`
    };
  }
}

// Run this script directly
async function main() {
  try {
    const result = await seedAdminUser();
    if (result.success) {
      console.log('✅ Admin seeding completed:', result.message);
    } else {
      console.error('❌ Admin seeding failed:', result.error);
    }
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Check if this module is being run directly
if (typeof require !== 'undefined' && require.main === module) {
  main();
}