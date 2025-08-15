#!/usr/bin/env tsx

import * as admin from 'firebase-admin';
  admin.initializeApp({
    projectId: 'househelp-42493'
  }); 

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
