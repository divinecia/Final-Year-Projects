#!/usr/bin/env tsx

/**
 * Simple Firebase Admin SDK test script
 * This will help us debug the authentication issue
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

const adminDb = admin.firestore();
const adminAuth = admin.auth();

async function testFirebaseAdmin() {
  console.log('🔥 Testing Firebase Admin SDK...\n');
  
  try {
    console.log('1. Testing project access...');
    const app = admin.app();
    console.log('✅ Firebase Admin app initialized');
    console.log('   Project ID:', app.options.projectId);
    
    console.log('\n2. Testing Firestore access...');
    // Try to access Firestore admin collection directly
    const adminCollectionRef = adminDb.collection('admin');
    console.log('✅ Admin collection reference created');
    
    // Try to read from collection
    const snapshot = await adminCollectionRef.limit(1).get();
    console.log('✅ Successfully queried admin collection');
    console.log('   Documents found:', snapshot.size);
    
    console.log('\n3. Testing Firebase Auth access...');
    const listResult = await adminAuth.listUsers(1);
    console.log('✅ Successfully accessed Firebase Auth');
    console.log('   Users found:', listResult.users.length);
    
    if (listResult.users.length > 0) {
      const user = listResult.users[0];
      console.log('   First user:', {
        uid: user.uid,
        email: user.email,
        creationTime: user.metadata.creationTime
      });
    }
    
    console.log('\n🎉 All Firebase Admin SDK tests passed!');
    
  } catch (error) {
    console.error('❌ Firebase Admin SDK test failed:');
    console.error('Error:', error);
    
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

// Run the test
testFirebaseAdmin();
