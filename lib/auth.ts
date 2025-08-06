// Sends a password reset email using Firebase Auth
export async function sendPasswordResetEmail(email: string, userType: UserType): Promise<void> {
  const auth = await getFirebaseAuth();
  try {
    // Optionally, you can check if the user exists in Firestore for the given userType before sending
    // const userExists = await userProfileExistsByEmail(email, userType);
    // if (!userExists) throw new Error('No user found with this email.');
    const { sendPasswordResetEmail: firebaseSendPasswordResetEmail } = await import('firebase/auth');
    await firebaseSendPasswordResetEmail(auth, email);
  } catch (error: unknown) {
    console.error(`Password reset error for ${userType}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send password reset email.';
    throw new Error(errorMessage);
  }
}

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
} from 'firebase/auth';
export async function signInWithGoogle(
  userType: UserType
): Promise<{ success: boolean; isNewUser?: boolean; error?: string }> {
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const profileExists = await userProfileExists(user.uid, userType);

    return { success: true, isNewUser: !profileExists };
  } catch (error: unknown) {
    console.error('Google sign in error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google';
    return { success: false, error: errorMessage };
  }
}
import { app, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function getFirebaseAuth(): Promise<Auth> {
  return getAuth(app);
}

type UserType = 'worker' | 'household' | 'admin';

async function userProfileExists(uid: string, userType: UserType): Promise<boolean> {
  const collectionName = userType === 'admin' ? 'admins' : userType;
  const userDoc = await getDoc(doc(db, collectionName, uid));
  return userDoc.exists();
}

async function createUserProfile(uid: string, email: string, userType: UserType): Promise<void> {
  const collectionName = userType === 'admin' ? 'admins' : userType;
  await setDoc(doc(db, collectionName, uid), {
    email,
    createdAt: Date.now(),
  });
}

export async function signUpWithEmailAndPassword(
  email: string,
  password: string,
  userType: UserType
): Promise<{ success: boolean; uid?: string; error?: string }> {
  const auth = await getFirebaseAuth();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await createUserProfile(userCredential.user.uid, email, userType);

    return { success: true, uid: userCredential.user.uid };
  } catch (error: unknown) {
    console.error('Sign up error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
    return { success: false, error: errorMessage };
  }
}

export async function signInWithEmailAndPasswordHandler(
  email: string,
  password: string,
  userType: UserType
): Promise<{ success: boolean; isNewUser?: boolean; error?: string }> {
  const auth = await getFirebaseAuth();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    const profileExists = await userProfileExists(userCredential.user.uid, userType);
    if (!profileExists && userType !== 'admin') {
      await firebaseSignOut(auth);
      return { success: false, error: "User profile not found for this role." };
    }

    return { success: true, isNewUser: !profileExists };
  } catch (error: unknown) {
    console.error('Sign in error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
    return { success: false, error: errorMessage };
  }
}

export async function signInWithGitHub(
  userType: UserType
): Promise<{ success: boolean; isNewUser?: boolean; error?: string }> {
  const auth = getAuth(app);
  const provider = new GithubAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const profileExists = await userProfileExists(user.uid, userType);

    return { success: true, isNewUser: !profileExists };
  } catch (error: unknown) {
    console.error('GitHub sign in error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with GitHub';
    return { success: false, error: errorMessage };
  }
}

// Dummy password reset code verification
export async function verifyPasswordResetCode(
  verificationId: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  if (code === '123456') {
    return { success: true };
  } else {
    return { success: false, error: 'Invalid verification code.' };
  }
}

export async function signOut(): Promise<void> {
  const auth = await getFirebaseAuth();
  await firebaseSignOut(auth);
}

// Alias for compatibility with login pages
export const signIn = signInWithEmailAndPasswordHandler;
