#!/usr/bin/env node

// Debug script to check Firebase Admin environment variables
console.log('🔍 Firebase Admin SDK Environment Check\n');

const envVars = {
  'FIREBASE_ADMIN_PROJECT_ID': process.env.FIREBASE_ADMIN_PROJECT_ID,
  'FIREBASE_ADMIN_CLIENT_EMAIL': process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  'FIREBASE_ADMIN_PRIVATE_KEY': process.env.FIREBASE_ADMIN_PRIVATE_KEY,
};

Object.entries(envVars).forEach(([key, value]) => {
  if (value) {
    if (key === 'FIREBASE_ADMIN_PRIVATE_KEY') {
      console.log(`✅ ${key}: ${value.substring(0, 50)}... (${value.length} chars)`);
    } else {
      console.log(`✅ ${key}: ${value}`);
    }
  } else {
    console.log(`❌ ${key}: MISSING`);
  }
});

// Test private key format
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
if (privateKey) {
  const cleanKey = privateKey.replace(/\\n/g, '\n');
  console.log('\n🔑 Private Key Format Check:');
  console.log('- Starts with BEGIN:', cleanKey.includes('-----BEGIN PRIVATE KEY-----'));
  console.log('- Ends with END:', cleanKey.includes('-----END PRIVATE KEY-----'));
  console.log('- Has newlines:', cleanKey.includes('\n'));
  console.log('- Length:', cleanKey.length);
}
