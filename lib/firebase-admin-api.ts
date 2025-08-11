/**
 * Firebase Admin SDK configuration specifically for API routes
 * This uses environment variables for production deployment
 */

import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Create service account object from environment variables
const createServiceAccount = (): ServiceAccount => {
  try {
    // Try to use the service account JSON from environment variable first
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) as ServiceAccount;
    }
    
    // Fallback to individual environment variables
    return {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || 'househelp-42493',
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || '',
    } as ServiceAccount;
  } catch (error) {
    console.error('Error creating service account:', error);
    throw new Error('Firebase service account configuration is invalid');
  }
};

// Initialize Firebase Admin SDK for API routes
let app;
if (!getApps().length) {
  app = initializeApp({
    credential: cert(createServiceAccount()),
    projectId: 'househelp-42493',
  });
} else {
  app = getApps()[0];
}

// Export admin instances for API routes
export const apiAdminDb = getFirestore(app);
export const apiAdminAuth = getAuth(app);

// Export the app instance
export const apiAdminApp = app;
