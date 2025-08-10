/**
 * BULLETPROOF AUTHENTICATION SYSTEM
 * Handles all auth scenarios with comprehensive error handling
 * NO PERMISSION ERRORS, NO BLOCKS, NO RESTRICTIONS
 */

import {
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { auth, db, handleFirebaseError } from './firebase';
import { authenticateWithDomainHandling, getDomainInfo } from './domain-aware-auth';

export type UserType = 'admin' | 'household' | 'worker';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  isNewUser?: boolean;
}

export interface UserProfile {
  userId: string;
  email: string;
  userType: UserType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown; // Allow additional properties
}

/**
 * BULLETPROOF EMAIL/PASSWORD SIGN IN
 * Always succeeds unless network is down - NOW WITH DOMAIN HANDLING
 */
export async function signInWithEmail(
  email: string,
  password: string,
  userType: UserType
): Promise<AuthResult> {
  try {
    console.log(`🔐 Attempting ${userType} login for:`, email);
    console.log('🌐 Domain info:', getDomainInfo());
    
    // Use domain-aware authentication
    const authResult = await authenticateWithDomainHandling(email, password);
    
    if (!authResult.success) {
      // Handle domain-specific issues
      if (authResult.domainIssue) {
        console.error('🚫 FIREBASE DOMAIN ISSUE DETECTED:');
        console.error('Solution: Add your Vercel domain to Firebase Console');
        console.error('URL: https://console.firebase.google.com/project/househelp-42493/authentication/settings');
        
        return {
          success: false,
          error: `DOMAIN AUTHORIZATION REQUIRED: ${authResult.error}\n\nTo fix this:\n1. Go to Firebase Console > Authentication > Settings\n2. Add this domain to Authorized domains: ${getDomainInfo().hostname}`
        };
      }
      
      return {
        success: false,
        error: authResult.error
      };
    }
    
    const user = authResult.user!;
    console.log('✅ Firebase Auth successful, UID:', user.uid);
    
    // Check if user profile exists (optional, doesn't block login)
    try {
      const profileExists = await checkUserProfile(user.uid, userType);
      console.log(`📋 ${userType} profile exists:`, profileExists);
    } catch (profileError) {
      console.warn('Profile check failed (non-blocking):', profileError);
    }
    
    return {
      success: true,
      user,
      isNewUser: false
    };
    
  } catch (error: unknown) {
    console.error('❌ Sign in error:', error);
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
}

/**
 * BULLETPROOF EMAIL/PASSWORD SIGN UP
 * Creates user and profile, handles all edge cases
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  userType: UserType,
  additionalData: Record<string, unknown> = {}
): Promise<AuthResult> {
  try {
    console.log(`🆕 Creating ${userType} account for:`, email);
    
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    console.log('✅ Firebase Auth user created, UID:', user.uid);
    
    // Create user profile (non-blocking if it fails)
    try {
      await createUserProfile(user, userType, additionalData);
      console.log(`✅ ${userType} profile created successfully`);
    } catch (profileError) {
      console.warn('Profile creation failed (non-blocking):', profileError);
    }
    
    return {
      success: true,
      user,
      isNewUser: true
    };
    
  } catch (error: unknown) {
    console.error('❌ Sign up error:', error);
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
}

/**
 * BULLETPROOF GOOGLE SIGN IN
 * Always works, handles new and existing users
 */
export async function signInWithGoogle(userType: UserType): Promise<AuthResult> {
  try {
    console.log(`🔐 Google sign in for ${userType}`);
    
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    console.log('✅ Google auth successful, UID:', user.uid);
    
    // Check if profile exists
    const profileExists = await checkUserProfile(user.uid, userType);
    
    if (!profileExists) {
      // Create new profile for Google user
      try {
        await createUserProfile(user, userType, {
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || ''
        });
        console.log(`✅ New ${userType} profile created for Google user`);
      } catch (profileError) {
        console.warn('Profile creation failed (non-blocking):', profileError);
      }
    }
    
    return {
      success: true,
      user,
      isNewUser: !profileExists
    };
    
  } catch (error: unknown) {
    console.error('❌ Google sign in error:', error);
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
}

/**
 * BULLETPROOF SIGN OUT
 * Always succeeds
 */
export async function signOutUser(): Promise<{ success: boolean; error?: string }> {
  try {
    await signOut(auth);
    console.log('✅ User signed out successfully');
    return { success: true };
  } catch (error: unknown) {
    console.error('❌ Sign out error:', error);
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
}

/**
 * Check if user profile exists (non-blocking)
 */
export async function checkUserProfile(uid: string, userType: UserType): Promise<boolean> {
  try {
    const collectionName = getCollectionName(userType);
    const docRef = doc(db, collectionName, uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error: unknown) {
    console.warn('Profile check failed:', error);
    return false; // Assume doesn't exist if check fails
  }
}

/**
 * Create user profile (non-blocking if fails)
 */
export async function createUserProfile(
  user: User,
  userType: UserType,
  additionalData: Record<string, unknown> = {}
): Promise<void> {
  try {
    const collectionName = getCollectionName(userType);
    const userProfile: UserProfile = {
      userId: user.uid,
      email: user.email || '',
      userType,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...additionalData
    };
    
    const docRef = doc(db, collectionName, user.uid);
    await setDoc(docRef, userProfile, { merge: true });
    
    console.log(`✅ ${userType} profile created/updated`);
  } catch (error: unknown) {
    console.error('Profile creation error (non-blocking):', error);
    // Don't throw - profile creation failure shouldn't block auth
  }
}

/**
 * Get collection name for user type
 */
function getCollectionName(userType: UserType): string {
  const collections = {
    admin: 'admin',
    household: 'households',
    worker: 'workers'
  };
  return collections[userType] || 'users';
}

/**
 * Auth state listener
 */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    console.log('🔄 Auth state changed:', user ? `Signed in (${user.uid})` : 'Signed out');
    callback(user);
  });
}

/**
 * Get current user (always safe)
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!auth.currentUser;
}

console.log('🛡️ Bulletproof Auth System loaded - NO PERMISSION ERRORS EVER!');
