#!/usr/bin/env tsx

/**
 * Add Vercel domain to Firebase authorized domains
 * Run this to fix "Firebase Auth blocked" issues
 */

console.log('🚀 Firebase Domain Authorization Fix');
console.log('====================================');

const VERCEL_DOMAINS = [
  'final-year-projects-ponz52g8y-ciairadukunda-gmailcoms-projects.vercel.app',
  'localhost',
  'househelp-42493.firebaseapp.com'
];

const PROJECT_ID = 'househelp-42493';

async function addAuthorizedDomains() {
  console.log('📋 Domains to authorize:');
  VERCEL_DOMAINS.forEach(domain => {
    console.log(`   - ${domain}`);
  });
  
  console.log('\n🔧 Adding domains to Firebase Console...');
  console.log('⚠️  Note: This requires manual action in Firebase Console');
  
  console.log('\n📝 MANUAL STEPS REQUIRED:');
  console.log('1. Go to Firebase Console:');
  console.log('   https://console.firebase.google.com/project/' + PROJECT_ID + '/authentication/settings');
  console.log('\n2. Scroll down to "Authorized domains" section');
  console.log('\n3. Click "Add domain" and add each of these:');
  
  VERCEL_DOMAINS.forEach(domain => {
    console.log(`   ✅ ${domain}`);
  });
  
  console.log('\n4. Save the changes');
  console.log('\n🎯 After adding these domains, the login will work on:');
  console.log('   - Local development (localhost)');
  console.log('   - Vercel deployment');
  console.log('   - Firebase hosting');
  
  console.log('\n🚨 IMMEDIATE FIX:');
  console.log('   The main issue is likely the Vercel domain needs authorization.');
  console.log('   Add this domain RIGHT NOW:');
  console.log('   📎 final-year-projects-ponz52g8y-ciairadukunda-gmailcoms-projects.vercel.app');
  
  console.log('\n✅ Once domains are added, login will work immediately!');
}

addAuthorizedDomains().catch(console.error);
