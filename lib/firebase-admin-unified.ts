/**
 * Unified Firebase Admin SDK Configuration
 * This file provides a consistent Firebase Admin setup for all contexts
 */

import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Import local service account as fallback
import serviceAccountFallback from '../config/househelp-42493-firebase-adminsdk-fbsvc-ad129f5ed0.json' assert { type: "json" };

// Service account configuration priority:
// 1. Environment variable with complete JSON
// 2. Individual environment variables
// 3. Local service account file (development)
const createServiceAccount = (): ServiceAccount => {
  try {
    // Method 1: Complete service account JSON from environment
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) as ServiceAccount;
    }
    
    // Method 2: Individual environment variables (preferred for production)
    const envConfig = {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    };
    
    if (envConfig.projectId && envConfig.privateKey && envConfig.clientEmail) {
      return envConfig as ServiceAccount;
    }
    
    // Method 3: Local service account file (development fallback)
    console.log('Using local service account file for development');
    return serviceAccountFallback as ServiceAccount;
    
  } catch (error) {
    console.error('Error creating service account:', error);
    throw new Error('Firebase service account configuration is invalid');
  }
};

// Initialize Firebase Admin SDK (singleton pattern)
let app;
if (!getApps().length) {
  try {
    app = initializeApp({
      credential: cert(createServiceAccount()),
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || 'househelp-42493',
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization failed:', error);
    throw error;
  }
} else {
  app = getApps()[0];
}

// Export admin instances
export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);
export const adminApp = app;

// Helper functions for common admin operations
export const adminHelpers = {
  // Create user with custom claims
  async createUserWithClaims(userData: {
    email: string;
    password: string;
    displayName?: string;
    customClaims?: Record<string, unknown>;
  }) {
    try {
      const userRecord = await adminAuth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
      });

      if (userData.customClaims) {
        await adminAuth.setCustomUserClaims(userRecord.uid, userData.customClaims);
      }

      return userRecord;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Get user by email
  async getUserByEmail(email: string) {
    try {
      return await adminAuth.getUserByEmail(email);
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  },

  // Verify ID token and get user claims
  async verifyTokenAndGetClaims(idToken: string) {
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.error('Error verifying token:', error);
      throw error;
    }
  },

  // Batch operations for Firestore
  async batchWrite(operations: Array<{ 
    collection: string; 
    doc: string; 
    data: FirebaseFirestore.DocumentData; 
    operation: 'set' | 'update' | 'delete' 
  }>) {
    const batch = adminDb.batch();
    
    operations.forEach(op => {
      const docRef = adminDb.collection(op.collection).doc(op.doc);
      switch (op.operation) {
        case 'set':
          batch.set(docRef, op.data);
          break;
        case 'update':
          batch.update(docRef, op.data);
          break;
        case 'delete':
          batch.delete(docRef);
          break;
      }
    });

    return batch.commit();
  }
};

// Legacy exports for backward compatibility
export default adminDb;

// For API routes specifically
export { adminDb as apiAdminDb, adminAuth as apiAdminAuth, adminApp as apiAdminApp };
