#!/usr/bin/env tsx

import * as admin from 'firebase-admin';
import serviceAccount from '../config/househelp-42493-firebase-adminsdk-fbsvc-ad129f5ed0.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: 'househelp-42493'
  });
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

async function checkAdmins() {
  console.log('📋 Checking all admin users...\n');
  
  try {
    // Check Firebase Auth users
    const listResult = await adminAuth.listUsers();
    console.log('Firebase Auth Users:');
    for (const user of listResult.users) {
      console.log('  -', user.email, '(UID:', user.uid + ')');
    }
    
    // Check Firestore admin collection
    console.log('\nFirestore Admin Collection:');
    const adminSnapshot = await adminDb.collection('admin').get();
    adminSnapshot.forEach(doc => {
      const data = doc.data();
      console.log('  -', data.email, '(Role:', data.role, ', UID:', doc.id + ')');
    });
    
  } catch (error) {
    console.error('Error checking admins:', error);
  }
}

checkAdmins();
