const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../config/househelp-42493-firebase-adminsdk-fbsvc-ad129f5ed0.json');

// Initialize Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth();
const db = getFirestore();

async function debugAdminLogin() {
  try {
    console.log('🔍 DEBUGGING ADMIN LOGIN FLOW...\n');
    
    const adminEmail = 'admin@househelp.com';
    const adminPassword = '@dM1Nd';
    
    // Step 1: Check Firebase Auth
    console.log('1️⃣ CHECKING FIREBASE AUTH...');
    try {
      const userRecord = await auth.getUserByEmail(adminEmail);
      console.log('✅ Firebase Auth user exists');
      console.log('📄 UID:', userRecord.uid);
      console.log('📄 Email verified:', userRecord.emailVerified);
      console.log('📄 Disabled:', userRecord.disabled);
      
      // Step 2: Check admin document exists
      console.log('\n2️⃣ CHECKING ADMIN DOCUMENT...');
      const adminDoc = await db.collection('admin').doc(userRecord.uid).get();
      if (adminDoc.exists) {
        const adminData = adminDoc.data();
        console.log('✅ Admin document exists');
        console.log('📄 isActive:', adminData.isActive);
        console.log('📄 role:', adminData.role);
        console.log('📄 fullName:', adminData.fullName);
        
        // Step 3: Check if account is active
        if (!adminData.isActive) {
          console.log('❌ ISSUE: Admin account is NOT active');
          console.log('🔧 FIX: Activating admin account...');
          await db.collection('admin').doc(userRecord.uid).update({
            isActive: true,
            updatedAt: new Date()
          });
          console.log('✅ Admin account activated');
        } else {
          console.log('✅ Admin account is active');
        }
        
        // Step 4: Check two-factor settings
        if (adminData.twoFactorEnabled) {
          console.log('⚠️ WARNING: Two-factor authentication is enabled');
          console.log('🔧 FIX: Disabling two-factor for testing...');
          await db.collection('admin').doc(userRecord.uid).update({
            twoFactorEnabled: false,
            updatedAt: new Date()
          });
          console.log('✅ Two-factor disabled');
        } else {
          console.log('✅ Two-factor is disabled');
        }
        
      } else {
        console.log('❌ ISSUE: Admin document does NOT exist');
        console.log('🔧 FIX: Creating admin document...');
        
        const adminData = {
          uid: userRecord.uid,
          email: adminEmail,
          fullName: 'System Administrator',
          phone: '0788123456',
          role: 'super_admin',
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
          isActive: true,
          twoFactorEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await db.collection('admin').doc(userRecord.uid).set(adminData);
        console.log('✅ Admin document created');
      }
      
      // Step 5: Test Firebase client config
      console.log('\n3️⃣ CHECKING FIREBASE CLIENT CONFIG...');
      console.log('📄 Checking if client Firebase config is correct...');
      
      // Read the client config
      const fs = require('fs');
      const path = require('path');
      
      try {
        const clientConfigPath = path.join(__dirname, '../config/firebase.ts');
        if (fs.existsSync(clientConfigPath)) {
          console.log('✅ Client Firebase config file exists');
        } else {
          console.log('❌ ISSUE: Client Firebase config file missing');
        }
      } catch (error) {
        console.log('⚠️ Could not check client config:', error.message);
      }
      
      // Step 6: Final verification
      console.log('\n4️⃣ FINAL VERIFICATION...');
      const finalAdminDoc = await db.collection('admin').doc(userRecord.uid).get();
      const finalAdminData = finalAdminDoc.data();
      
      console.log('✅ FINAL STATUS:');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password:', adminPassword);
      console.log('🆔 UID:', userRecord.uid);
      console.log('✅ isActive:', finalAdminData.isActive);
      console.log('✅ twoFactorEnabled:', finalAdminData.twoFactorEnabled);
      console.log('✅ role:', finalAdminData.role);
      
      console.log('\n🎉 ADMIN LOGIN SHOULD NOW WORK!');
      console.log('🌐 Go to: http://localhost:3000/admin/login');
      console.log('📧 Use email:', adminEmail);
      console.log('🔑 Use password:', adminPassword);
      
    } catch (authError) {
      if (authError.code === 'auth/user-not-found') {
        console.log('❌ ISSUE: Firebase Auth user does NOT exist');
        console.log('🔧 FIX: Creating Firebase Auth user...');
        
        const userRecord = await auth.createUser({
          email: adminEmail,
          password: adminPassword,
          emailVerified: true,
        });
        
        console.log('✅ Firebase Auth user created:', userRecord.uid);
        console.log('🔄 Re-run this script to complete setup');
      } else {
        throw authError;
      }
    }
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error);
    console.log('\n🆘 TROUBLESHOOTING STEPS:');
    console.log('1. Check Firebase project configuration');
    console.log('2. Verify service account key is correct');
    console.log('3. Ensure Firebase Auth is enabled');
    console.log('4. Check Firestore security rules');
    console.log('5. Verify network connectivity');
  }
  
  process.exit(0);
}

debugAdminLogin();
