#!/usr/bin/env tsx

/**
 * Create additional admin users with different roles and permissions
 */

import * as admin from 'firebase-admin';
import serviceAccount from '../config/househelp-42493-firebase-adminsdk-fbsvc-ad129f5ed0.json';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: 'househelp-42493'
  });
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

// Additional admin users to create
const additionalAdmins = [
  {
    email: 'superadmin@househelp.rw',
    password: '@SuperAdmin2025',
    displayName: 'Super Administrator',
    role: 'super-admin',
    permissions: ['all'],
    firstName: 'Super',
    lastName: 'Admin'
  },
  {
    email: 'moderator@househelp.rw', 
    password: '@ModeratorHelp',
    displayName: 'Platform Moderator',
    role: 'moderator',
    permissions: ['view_reports', 'manage_workers', 'manage_households'],
    firstName: 'Platform',
    lastName: 'Moderator'
  },
  {
    email: 'support@househelp.rw',
    password: '@SupportTeam',
    displayName: 'Support Team Lead',
    role: 'support',
    permissions: ['view_users', 'handle_disputes', 'customer_support'],
    firstName: 'Support',
    lastName: 'Lead'
  }
];

async function createAdditionalAdmins() {
  console.log('🚀 Creating additional admin users...\n');

  for (const adminData of additionalAdmins) {
    try {
      console.log(`Creating admin: ${adminData.email}`);

      // Check if user already exists
      let userRecord;
      try {
        userRecord = await adminAuth.getUserByEmail(adminData.email);
        console.log(`⚠️  User ${adminData.email} already exists (UID: ${userRecord.uid})`);
      } catch {
        // User doesn't exist, create new one
        userRecord = await adminAuth.createUser({
          email: adminData.email,
          password: adminData.password,
          displayName: adminData.displayName,
          emailVerified: true
        });
        console.log(`✅ Firebase Auth user created (UID: ${userRecord.uid})`);
      }

      // Create/update Firestore admin document
      const adminDocRef = adminDb.collection('admin').doc(userRecord.uid);
      const adminDocData = {
        userId: userRecord.uid,
        email: adminData.email,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        displayName: adminData.displayName,
        role: adminData.role,
        permissions: adminData.permissions,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
        lastLogin: null
      };

      await adminDocRef.set(adminDocData, { merge: true });
      console.log(`✅ Firestore admin document created/updated`);
      
      console.log(`🎉 Admin user ready: ${adminData.email} (Role: ${adminData.role})\n`);

    } catch (error) {
      console.error(`❌ Failed to create admin ${adminData.email}:`, error);
    }
  }

  console.log('📋 Admin creation completed!\n');
  
  // List all admin users
  console.log('🔍 All admin users:');
  const adminSnapshot = await adminDb.collection('admin').get();
  adminSnapshot.forEach(doc => {
    const data = doc.data();
    console.log(`  - ${data.email} (${data.role}) - UID: ${doc.id}`);
  });
}

createAdditionalAdmins().catch(console.error);
