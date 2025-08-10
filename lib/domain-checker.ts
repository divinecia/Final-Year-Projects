/**
 * CLIENT-SIDE DOMAIN CHECKER
 * Add this to your login page to diagnose domain issues
 */

export function checkFirebaseDomainStatus() {
  if (typeof window === "undefined") return;
  
  console.log('🔍 FIREBASE DOMAIN STATUS CHECK');
  console.log('================================');
  
  const domain = window.location.hostname;
  const origin = window.location.origin;
  const protocol = window.location.protocol;
  
  console.log('📍 Current Location:');
  console.log('   Hostname:', domain);
  console.log('   Origin:', origin);
  console.log('   Protocol:', protocol);
  
  // Check if domain is likely authorized
  const authorizedDomains = [
    'localhost',
    '127.0.0.1',
    'househelp-42493.firebaseapp.com'
  ];
  
  const isLikelyAuthorized = authorizedDomains.some(authDomain => 
    domain === authDomain || domain.includes(authDomain)
  );
  
  console.log('\n🎯 Domain Authorization Status:');
  if (isLikelyAuthorized) {
    console.log('   ✅ Domain is likely authorized');
  } else {
    console.log('   ❌ Domain likely needs authorization');
    console.log('   🚨 This is probably why login fails!');
    console.log('   📝 Solution: Add this domain to Firebase Console');
    console.log('   🔗 URL: https://console.firebase.google.com/project/househelp-42493/authentication/settings');
    console.log('   📎 Domain to add:', domain);
  }
  
  // Check for specific environments
  if (domain.includes('vercel.app')) {
    console.log('\n🚀 VERCEL DEPLOYMENT DETECTED');
    console.log('   Domain to add to Firebase:', domain);
    console.log('   Also add: *.vercel.app (for all Vercel deployments)');
  }
  
  if (domain === 'localhost' || domain === '127.0.0.1') {
    console.log('\n🏠 LOCALHOST DETECTED');
    console.log('   Should work without additional setup');
  }
  
  return {
    domain,
    origin,
    isLikelyAuthorized,
    needsFirebaseAuthorization: !isLikelyAuthorized
  };
}

// Auto-run on import
checkFirebaseDomainStatus();
