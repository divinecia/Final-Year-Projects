import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function GET() {
  try {
    console.log('Testing Firebase Admin SDK connection...');
    
    // Test 1: Check Firebase Admin DB connection
    const testCollection = adminDb.collection('admin');
    const snapshot = await testCollection.limit(1).get();
    
    // Test 2: Check Firebase Auth connection  
    let userCount = 0;
    try {
      const listUsersResult = await adminAuth.listUsers(1);
      userCount = listUsersResult.users.length;
    } catch (authError) {
      console.warn('Auth test failed:', authError);
    }

    // Test 3: Check environment variables
    const envCheck = {
      hasProjectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    };

    return NextResponse.json({
      success: true,
      message: 'Firebase Admin SDK is working correctly!',
      tests: {
        firestoreConnection: 'SUCCESS ✅',
        authConnection: userCount > 0 ? 'SUCCESS ✅' : 'NO USERS YET ⚠️',
        environmentVariables: envCheck.hasProjectId && envCheck.hasClientEmail && envCheck.hasPrivateKey ? 'SUCCESS ✅' : 'MISSING VARS ❌'
      },
      data: {
        adminDocsCount: snapshot.size,
        userCount,
        environment: envCheck
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Firebase Admin SDK Test Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      tests: {
        firestoreConnection: 'FAILED ❌',
        authConnection: 'FAILED ❌',
        environmentVariables: 'FAILED ❌'
      },
      troubleshooting: [
        'Check if environment variables are set in Vercel',
        'Verify Firebase service account permissions',
        'Check if Firestore rules allow admin access',
        'Ensure Firebase project is active'
      ]
    }, { status: 500 });
  }
}
