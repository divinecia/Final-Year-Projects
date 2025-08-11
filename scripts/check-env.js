const fs = require('fs');
const path = require('path');

console.log('🔍 CHECKING ENVIRONMENT VARIABLES...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];
  
  console.log('📄 Checking required Firebase variables:');
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName} - Present`);
    } else {
      console.log(`❌ ${varName} - MISSING`);
    }
  });
  
} else {
  console.log('❌ .env.local file does NOT exist');
  console.log('🔧 Creating .env.local with Firebase config...');
  
  const envTemplate = `# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyDK8ZKKlELT9TxQYQRkJl2yAYBt2Hl7-LQ"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="househelp-42493.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="househelp-42493"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="househelp-42493.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="867594074749"
NEXT_PUBLIC_FIREBASE_APP_ID="1:867594074749:web:2b85eda82c6b5b3c04bbea"

# Admin Credentials
ADMIN_EMAIL="admin@househelp.com"
ADMIN_PASSWORD="@dM1Nd"
`;
  
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env.local created with Firebase configuration');
}

console.log('\n🔧 NEXT STEPS IF LOGIN FAILS:');
console.log('1. Restart your development server: npm run dev');
console.log('2. Clear browser cache and cookies');
console.log('3. Check browser console for JavaScript errors');
console.log('4. Try in incognito/private browsing mode');
console.log('5. Check Firestore security rules allow admin access');

process.exit(0);
