/**
 * DOMAIN-AWARE AUTHENTICATION HELPER
 * Handles Firebase Auth domain authorization issues
 */

import { signInWithEmailAndPassword, User } from 'firebase/auth';
import { auth } from './firebase';

export interface DomainAwareAuthResult {
  success: boolean;
  user?: User;
  error?: string;
  domainIssue?: boolean;
}

/**
 * Authenticate with domain-aware error handling
 */
export async function authenticateWithDomainHandling(
  email: string,
  password: string
): Promise<DomainAwareAuthResult> {
  try {
    console.log('🔐 Attempting authentication with domain handling...');
    console.log('📧 Email:', email);
    
    // Check current domain
    const currentDomain = typeof window !== "undefined" ? window.location.hostname : 'unknown';
    console.log('🌐 Current domain:', currentDomain);
    
    // Attempt authentication
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    console.log('✅ Authentication successful!');
    console.log('👤 User UID:', result.user.uid);
    
    return {
      success: true,
      user: result.user
    };
    
  } catch (error: unknown) {
    console.error('❌ Authentication error:', error);
    
    // Type guard for Firebase errors
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string; message?: string };
      
      // Check for domain-related issues
      if (firebaseError.code === 'auth/unauthorized-domain' || 
          firebaseError.code === 'auth/operation-not-allowed' ||
          firebaseError.message?.includes('domain')) {
        
        console.error('🚫 DOMAIN AUTHORIZATION ERROR:');
        console.error('Current domain needs to be added to Firebase Console');
        console.error('Go to: Firebase Console > Authentication > Settings > Authorized domains');
        console.error('Add this domain:', typeof window !== "undefined" ? window.location.origin : 'unknown');
        
        return {
          success: false,
          domainIssue: true,
          error: `Domain authorization required. Please add ${typeof window !== "undefined" ? window.location.hostname : 'this domain'} to Firebase Console authorized domains.`
        };
      }
      
      // Handle other auth errors
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          return {
            success: false,
            error: 'User not found. Please check your email address.'
          };
        case 'auth/wrong-password':
          return {
            success: false,
            error: 'Incorrect password. Please try again.'
          };
        case 'auth/invalid-email':
          return {
            success: false,
            error: 'Invalid email format.'
          };
        case 'auth/user-disabled':
          return {
            success: false,
            error: 'This account has been disabled.'
          };
        case 'auth/too-many-requests':
          return {
            success: false,
            error: 'Too many failed attempts. Please try again later.'
          };
        case 'auth/network-request-failed':
          return {
            success: false,
            error: 'Network error. Please check your connection.'
          };
        default:
          return {
            success: false,
            error: `Authentication error: ${firebaseError.message || firebaseError.code}`
          };
      }
    }
    
    // Handle non-Firebase errors
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: false,
      error: 'Unknown authentication error occurred.'
    };
  }
}

/**
 * Get detailed domain information for debugging
 */
export function getDomainInfo() {
  if (typeof window === "undefined") {
    return {
      hostname: 'server-side',
      origin: 'server-side',
      protocol: 'server-side',
      needsAuthorization: false
    };
  }
  
  const hostname = window.location.hostname;
  const origin = window.location.origin;
  const protocol = window.location.protocol;
  
  // Check if domain likely needs authorization
  const needsAuthorization = !['localhost', '127.0.0.1'].includes(hostname) && 
                            !hostname.includes('firebaseapp.com');
  
  return {
    hostname,
    origin,
    protocol,
    needsAuthorization,
    isVercel: hostname.includes('vercel.app'),
    isLocalhost: ['localhost', '127.0.0.1'].includes(hostname)
  };
}

console.log('🛡️ Domain-Aware Auth Helper loaded');
console.log('🌐 Domain info:', getDomainInfo());
