// Quick admin login test
// Paste this in browser console on /admin/login page

const testAdminLogin = async () => {
  try {
    console.log('Testing admin login...');
    
    // Import Firebase auth
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const { getDoc, doc } = await import('firebase/firestore');
    
    // Get Firebase instances (assuming they're globally available)
    const auth = window.firebase?.auth || (await import('/config/firebase.ts')).auth;
    const db = window.firebase?.db || (await import('/config/firebase.ts')).db;
    
    const email = '';
    const password = '@dM1Nd';
    
    // Step 1: Sign in
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Firebase Auth successful:', userCredential.user.uid);
    
    // Step 2: Check admin doc
    const adminDoc = await getDoc(doc(db, "admin", userCredential.user.uid));
    if (adminDoc.exists()) {
      console.log('✅ Admin document found:', adminDoc.data());
      console.log('🎉 LOGIN SHOULD WORK! Try the form now.');
    } else {
      console.log('❌ Admin document not found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
  }
};

// Run the test
testAdminLogin();
