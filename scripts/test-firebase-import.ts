console.log('🔥 Testing Firebase imports...');

try {
  console.log('Importing firebase-admin...');
  import('firebase-admin').then((admin) => {
    console.log('✅ Firebase admin imported successfully');
    console.log('Checking apps:', admin.apps.length);
    console.log('✅ Firebase admin accessible');
  }).catch((error) => {
    console.error('❌ Firebase import failed:', error);
  });
} catch (error) {
  console.error('❌ Firebase import failed:', error);
}
