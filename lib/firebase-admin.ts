import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Validate environment variables
const requiredEnvVars = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(`Missing Firebase Admin environment variables: ${missingVars.join(', ')}`);
}

// Firebase Admin configuration from environment variables
const firebaseAdminConfig: ServiceAccount = {
  projectId: requiredEnvVars.projectId!,
  clientEmail: requiredEnvVars.clientEmail!,
  privateKey: requiredEnvVars.privateKey!.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin SDK (only if not already initialized)
let app;
if (!getApps().length) {
  app = initializeApp({
    credential: cert(firebaseAdminConfig),
    projectId: firebaseAdminConfig.projectId,
  });
} else {
  app = getApps()[0];
}

// Export admin instances
export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);

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

export default adminDb;
