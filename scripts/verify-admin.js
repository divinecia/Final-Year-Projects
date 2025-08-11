const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../config/househelp-42493-firebase-adminsdk-fbsvc-ad129f5ed0.json');

// Initialize Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function verifyAdminUser() {
  try {
    console.log('🔍 Checking admin user in Firestore...');
    
    const userId = 'daHDcDTxEuZPNhgcx3Rdtcp7dOJ2'; // The UID from creation
    
    // Check admin collection
    const adminDoc = await db.collection('admin').doc(userId).get();
    if (adminDoc.exists) {
      console.log('✅ Admin document exists in admin collection');
      console.log('📄 Admin data:', JSON.stringify(adminDoc.data(), null, 2));
    } else {
      console.log('❌ Admin document NOT found in admin collection');
    }
    
    // Check users collection
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      console.log('✅ User document exists in users collection');
      console.log('📄 User data:', JSON.stringify(userDoc.data(), null, 2));
    } else {
      console.log('❌ User document NOT found in users collection');
    }
    
    // List all documents in admin collection
    console.log('\n📋 All documents in admin collection:');
    const adminCollection = await db.collection('admin').get();
    if (adminCollection.empty) {
      console.log('❌ Admin collection is empty');
    } else {
      adminCollection.forEach(doc => {
        console.log(`📄 Document ID: ${doc.id}`);
        console.log(`📄 Data:`, JSON.stringify(doc.data(), null, 2));
      });
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error verifying admin:', error);
    process.exit(1);
  }
}

verifyAdminUser();
