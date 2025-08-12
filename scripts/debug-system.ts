#!/usr/bin/env tsx

import * as admin from 'firebase-admin';
import serviceAccount from '../config/househelp-42493-firebase-adminsdk-fbsvc-4126e55eb7.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: 'househelp-42493'
  });
}

async function debugSystem() {
  try {
    const adminAuth = admin.auth();
    const adminDb = admin.firestore();
    
    console.log('🔍 Firebase Admin Debug\n');
    
    // Check all users
    const allUsers = await adminAuth.listUsers();
    console.log('Firebase Auth Users:', allUsers.users.length);
    for (const user of allUsers.users) {
      console.log('  - Email:', user.email, 'UID:', user.uid);
    }
    
    // Check admin collection
    const adminDocs = await adminDb.collection('admin').get();
    console.log('\nFirestore Admin Collection:', adminDocs.size, 'documents');
    adminDocs.forEach(doc => {
      const data = doc.data();
      console.log('  - Email:', data.email, 'Role:', data.role, 'Doc ID:', doc.id);
    });
    
    console.log('\n✅ Debug completed successfully');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugSystem();
