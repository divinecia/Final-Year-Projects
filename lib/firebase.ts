import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";

// Firebase configuration with environment-specific settings
const firebaseConfig = {
  apiKey: "AIzaSyBQZsvMlcu3H8G5K7x6TMgMj-F2fEUVKWo",
  authDomain: "househelp-42493.firebaseapp.com",
  projectId: "househelp-42493",
  storageBucket: "househelp-42493.appspot.com",
  messagingSenderId: "251592966595",
  appId: "1:251592966595:web:e6dbd8bf39d25808d1bd76",
  measurementId: "G-RT9TY3VS9L"
};

// Check if running on Replit
const isReplit = typeof window !== "undefined" && 
  (window.location.hostname.includes('replit.dev') || window.location.hostname.includes('repl.co'));

// Initialize Firebase app (singleton)
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Analytics is only available in the browser and when domain is authorized
let analytics: Analytics | undefined;
if (typeof window !== "undefined" && !isReplit) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((error) => {
    console.warn('Analytics not supported:', error);
  });
} else if (isReplit) {
  console.log('Analytics disabled for Replit development environment');
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// Configure auth for development environments
if (typeof window !== "undefined") {
  const currentDomain = window.location.hostname;
  const currentOrigin = window.location.origin;
  
  if (currentDomain.includes('replit.dev') || currentDomain.includes('repl.co')) {
    // Handle Replit domain configuration
    console.log('Running on Replit domain:', currentDomain);
    console.log('Add this domain to Firebase Console:', currentOrigin);
    console.warn('IMPORTANT: Add this domain to Firebase Console under Authentication > Settings > Authorized domains');
    
    // Configure auth settings for Replit domains
    try {
      auth.settings.appVerificationDisabledForTesting = true;
      auth.useDeviceLanguage();
    } catch (error) {
      console.warn('Auth configuration warning (expected in development):', error);
    }
  }
}

export { app, analytics, auth, db, storage };
