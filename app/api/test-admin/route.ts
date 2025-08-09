import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔥 Testing Firebase Admin SDK basic setup...');
    
    // Test basic imports first
    const admin = await import('firebase-admin');
    console.log('✅ Firebase Admin imported successfully');
    
    const serviceAccount = await import('../../../config/househelp-42493-firebase-adminsdk-fbsvc-ad129f5ed0.json');
    console.log('✅ Service account loaded successfully');
    
    // Test if we can access the credential function
    const credentialFunction = admin.credential;
    console.log('✅ Firebase credential function accessible');
    
    return NextResponse.json({
      success: true,
      message: '✅ Firebase Admin SDK imports are working in API route!',
      tests: {
        adminImport: 'SUCCESS ✅',
        serviceAccountLoad: 'SUCCESS ✅', 
        credentialAccess: 'SUCCESS ✅'
      },
      info: {
        hasAdmin: !!admin,
        hasServiceAccount: !!serviceAccount.default,
        hasCredentialFunction: !!credentialFunction,
        timestamp: new Date().toISOString()
      },
      note: 'Firebase Admin SDK imports work correctly. Full operations work in standalone scripts.'
    });

  } catch (error) {
    console.error('❌ API Test Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Firebase Admin SDK imports failed in API route context',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
