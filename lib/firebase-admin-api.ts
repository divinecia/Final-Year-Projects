/**
 * Firebase Admin SDK configuration specifically for API routes
 * This uses the service account JSON file directly instead of environment variables
 */

import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from '../config/househelp-42493-firebase-adminsdk-fbsvc-ad129f5ed0.json';

// Initialize Firebase Admin SDK for API routes using service account JSON
let app;
if (!getApps().length) {
  app = initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
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
