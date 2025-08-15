import { config } from 'dotenv';
import { resolve } from 'path';
import * as admin from 'firebase-admin';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
 admin.initializeApp();
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
  status: string;
  permissions: string[];
  location: AdminLocation;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    nationalId?: string;
    dateOfBirth?: string;
    gender?: string;
  };
  profileInfo: {
    avatar?: string;
    bio?: string;
  };
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  notificationSettings: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

const ADMIN_CONFIG = {
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  phone: ADMIN_PHONE,
  fullName: 'System Administrator',
  role: 'admin',
  status: 'active',
  permissions: [
    'read:users',
    'write:users',
    'delete:users',
    'read:jobs',
    'write:jobs',
    'delete:jobs',
    'read:payments',
    'write:payments',
    'read:reports',
    'write:reports',
    'read:settings',
    'write:settings',
    'manage:platform',
  ],
  location: {
    province: 'Kigali',
    district: 'Gasabo',
    municipality: 'Gasabo',
    neighborhood: 'Kimihurura',
    street: 'KG 9 Ave',
    houseNumber: '1',
    postalCode: '00000',
    city: 'Kigali',
    country: 'Rwanda',
    fullAddress: 'KG 9 Ave, Kimihurura, Gasabo, Kigali, Rwanda'
  }
};

async function seedAdminUser() {
  try {
    console.log('🌱 Starting admin user seeding...');
    
    // Check if admin already exists in Firestore
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
      status: ADMIN_CONFIG.status,
      permissions: ADMIN_CONFIG.permissions,
      location: ADMIN_CONFIG.location,
      personalInfo: {
        fullName: ADMIN_CONFIG.fullName,
        email: ADMIN_CONFIG.email,
        phone: ADMIN_CONFIG.phone,
      },
      profileInfo: {
        bio: 'System Administrator with full platform access',
      },
      createdAt: now,
      updatedAt: now,
      isEmailVerified: true,
      isPhoneVerified: false,
      notificationSettings: {
        email: true,
        sms: true,
        push: true,
      },
    };

    // Save admin profile to Firestore using Admin SDK
    console.log('💾 Saving admin profile to Firestore...');
    await adminDb.collection(ADMINS_COLLECTION).doc(userId).set(adminProfile);

    // Also save to users collection for cross-reference
    await adminDb.collection(USERS_COLLECTION).doc(userId).set({
      email: ADMIN_CONFIG.email,
      role: 'admin',
      userType: 'admin',
      fullName: ADMIN_CONFIG.fullName,
      createdAt: now,
      updatedAt: now,
    });

    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${ADMIN_CONFIG.email}`);
    console.log(`🔑 Password: ${ADMIN_CONFIG.password}`);
    console.log(`🆔 UID: ${userId}`);

    return { 
      success: true, 
      message: 'Admin user created successfully',
      adminId: userId,
      email: ADMIN_CONFIG.email 
    };

  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    throw new Error(`Failed to create admin user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function checkAdminExists() {
  try {
    const adminDoc = await adminDb.collection(ADMINS_COLLECTION).doc(ADMIN_CONFIG.email).get();
    return adminDoc.exists;
  } catch (error) {
    console.error('Error checking admin existence:', error);
    return false;
  }
}

async function listAdmins() {
  try {
    const adminsSnapshot = await adminDb.collection(ADMINS_COLLECTION).get();
    const admins = adminsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as AdminProfile
    }));
    
    console.log('👥 Current admins:');
    admins.forEach(admin => {
      console.log(`  - ${admin.email} (${admin.fullName}) - Status: ${admin.status}`);
    });
    
    return admins;
  } catch (error) {
    console.error('Error listing admins:', error);
    return [];
  }
}

async function main() {
  try {
    console.log('🚀 Admin Seeding Script Started');
    console.log('================================');
    
    // Check current admin status
    const adminExists = await checkAdminExists();
    console.log(`📋 Admin exists: ${adminExists}`);
    
    if (adminExists) {
      console.log('⚠️ Admin already exists. Listing current admins...');
      await listAdmins();
      return;
    }

    // Seed admin user
    const result = await seedAdminUser();
    console.log('✅ Seeding completed:', result);

    // Verify creation
    console.log('🔍 Verifying admin creation...');
    await listAdmins();

  } catch (error) {
    console.error('❌ Admin seeding failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
