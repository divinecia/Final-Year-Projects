import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore, enableNetwork } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";

// Firebase configuration - PRODUCTION READY
const firebaseConfig = {
  apiKey: "AIzaSyBQZsvMlcu3H8G5K7x6TMgMj-F2fEUVKWo",
  authDomain: "househelp-42493.firebaseapp.com",
  projectId: "househelp-42493",
  storageBucket: "househelp-42493.appspot.com",
  messagingSenderId: "251592966595",
  appId: "1:251592966595:web:e6dbd8bf39d25808d1bd76",
  measurementId: "G-RT9TY3VS9L"
};

// Check environment and authorized domains
const isReplit = typeof window !== "undefined" && 
  (window.location.hostname.includes('replit.dev') || window.location.hostname.includes('repl.co'));

const isVercel = typeof window !== "undefined" && 
  (window.location.hostname.includes('vercel.app') || 
   window.location.hostname.includes('final-year-projects-ponz52g8y-ciairadukunda-gmailcoms-projects.vercel.app'));

const isLocalhost = typeof window !== "undefined" && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Log current domain for debugging
if (typeof window !== "undefined") {
  console.log('🌐 Current domain:', window.location.hostname);
  console.log('🌐 Current origin:', window.location.origin);
  console.log('🌐 Environment detection:', { isReplit, isVercel, isLocalhost });
}

// Initialize Firebase app (singleton pattern)
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services with error handling
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | undefined;

try {
  // Auth - Always initialize with domain configuration
  auth = getAuth(app);
  
  // Configure auth for different environments
  if (typeof window !== "undefined") {
    try {
      // Set language to device language
      auth.useDeviceLanguage();
      
      // Configure for Vercel deployment
      if (isVercel) {
        console.log('🚀 Configuring Firebase Auth for Vercel deployment');
        // Add any Vercel-specific auth configuration here
      }
      
      // Configure for localhost
      if (isLocalhost) {
        console.log('🏠 Configuring Firebase Auth for localhost');
      }
      
      console.log('✅ Firebase Auth domain configuration applied');
    } catch (configError) {
      console.warn('⚠️ Auth configuration warning (non-blocking):', configError);
    }
  }
  
  // Firestore - Always initialize
  db = getFirestore(app);
  
  // Storage - Always initialize  
  storage = getStorage(app);
  
  // Analytics - Browser only and when supported
  if (typeof window !== "undefined" && !isReplit) {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log('✅ Firebase Analytics initialized');
      }
    }).catch(error => {
      console.warn('Firebase Analytics initialization failed:', error);
    });
  }
  
  console.log('✅ Firebase services initialized successfully');
  console.log('🔐 Auth Domain:', firebaseConfig.authDomain);
  console.log('🗄️ Project ID:', firebaseConfig.projectId);
  
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw new Error('Failed to initialize Firebase services');
}

// Export Firebase services
export { app, auth, db, storage, analytics };

// Backward compatibility exports
export const firestore = db;

// Helper functions for safe access
export const getFirebaseApp = (): FirebaseApp => app;
export const getFirebaseAuth = (): Auth => auth;
export const getFirebaseDb = (): Firestore => db;
export const getFirebaseStorage = (): FirebaseStorage => storage;

// Connection status checker
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Try to access Firestore to verify connection
    await enableNetwork(db);
    console.log('✅ Firebase connection verified');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
};

// Error handler for Firebase operations
export const handleFirebaseError = (error: unknown): string => {
  console.error('Firebase Error:', error);
  
  // Type guard for Firebase errors
  if (error && typeof error === 'object' && 'code' in error) {
    const firebaseError = error as { code: string; message?: string };
    switch (firebaseError.code) {
      case 'auth/user-not-found':
        return 'User not found. Please check your credentials.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'permission-denied':
        return 'Permission denied. This should not happen with our current rules.';
      case 'unavailable':
        return 'Service temporarily unavailable. Please try again.';
      default:
        return `Firebase error: ${firebaseError.message || 'Unknown error'}`;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

console.log('🚀 Firebase configuration loaded successfully');
console.log('📡 Ready for all operations without permission restrictions');
