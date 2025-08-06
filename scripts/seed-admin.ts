import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ciairadukunda@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'IRAcia12@';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '0780452019';

const ADMINS_COLLECTION = 'admins';
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
    const adminDoc = await getDoc(doc(db, ADMINS_COLLECTION, ADMIN_CONFIG.email));
    if (adminDoc.exists()) {
      console.log('⚠️ Admin user already exists, skipping creation');
      return { success: true, message: 'Admin user already exists' };
    }

    // Create Firebase Auth user
    console.log('👤 Creating Firebase Auth user...');
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      ADMIN_CONFIG.email,
      ADMIN_CONFIG.password
    );

    const userId = userCredential.user.uid;
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
      emailVerified: userCredential.user.emailVerified,
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
    await setDoc(doc(db, ADMINS_COLLECTION, userId), adminProfile);
    console.log('✅ Admin profile created in Firestore');

    // Also save to users collection for unified user lookup
    await setDoc(doc(db, USERS_COLLECTION, userId), {
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

  } catch (error: any) {
    console.error('❌ Error seeding admin user:', error);

    if (error.code === 'auth/email-already-in-use') {
      return {
        success: false,
        error: 'Email already in use. Admin might already exist.'
      };
    } else if (error.code === 'auth/weak-password') {
      return {
        success: false,
        error: 'Password is too weak. Please use a stronger password.'
      };
    } else if (error.code === 'auth/invalid-email') {
      return {
        success: false,
        error: 'Invalid email format.'
      };
    }

    return {
      success: false,
      error: `Failed to create admin user: ${error.message}`
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