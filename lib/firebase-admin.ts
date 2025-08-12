import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';

// Bulletproof Firebase Admin initialization with deployment-ready configuration
let firebaseAdminConfig: ServiceAccount;

// Method 1: Environment variables (production/deployment - required for Vercel)
if (process.env.FIREBASE_ADMIN_PROJECT_ID && 
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL && 
    process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
  
  firebaseAdminConfig = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };
  console.log('🔑 Using Firebase Admin credentials from environment variables');
  
// Method 2: Fallback for local development only
} else if (process.env.NODE_ENV === 'development') {
  try {
    const serviceAccountPath = path.join(process.cwd(), 'config/househelp-42493-firebase-adminsdk-fbsvc-4126e55eb7.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
      const serviceAccount = JSON.parse(serviceAccountContent);
      
      firebaseAdminConfig = {
        projectId: serviceAccount.project_id || 'househelp-42493',
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
      };
      console.log('🔑 Using Firebase Admin credentials from service account file (development only)');
    } else {
      throw new Error('Service account file not found and environment variables not set');
    }
  } catch (error) {
    console.error('❌ Failed to load Firebase Admin credentials:', error);
    throw new Error('Firebase Admin SDK initialization failed: No valid credentials found');
  }
} else {
  // Production without environment variables - this will cause a clear error
  console.error('❌ Missing required Firebase Admin environment variables for production deployment');
  console.error('Required: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY');
  throw new Error('Firebase Admin SDK: Missing required environment variables for production');
}

// Initialize Firebase Admin SDK with enhanced configuration
let app;
try {
  if (!getApps().length) {
    app = initializeApp({
      credential: cert(firebaseAdminConfig),
      projectId: firebaseAdminConfig.projectId || 'househelp-42493',
      databaseURL: `https://househelp-42493-default-rtdb.firebaseio.com/`,
      storageBucket: 'househelp-42493.appspot.com',
    });
    console.log('🚀 Firebase Admin SDK initialized successfully');
  } else {
    app = getApps()[0];
    console.log('♻️ Using existing Firebase Admin app instance');
  }
} catch (error) {
  console.error('❌ Firebase Admin SDK initialization failed:', error);
  throw error;
}

// Export admin instances
export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);

// Enhanced helper functions
export const adminHelpers = {
  async createUserWithClaims(userData: {
    email: string;
    password: string;
    displayName?: string;
    customClaims?: Record<string, unknown>;
  }) {
    try {
      console.log(`🔨 Creating user: ${userData.email}`);
      
      const userRecord = await adminAuth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
      });

      if (userData.customClaims) {
        await adminAuth.setCustomUserClaims(userRecord.uid, userData.customClaims);
        console.log(`✅ Custom claims set for user: ${userData.email}`);
      }

      console.log(`✅ User created successfully: ${userData.email}`);
      return userRecord;
    } catch (error) {
      console.error(`❌ Failed to create user: ${userData.email}`, error);
      throw error;
    }
  },

  async getUserByEmail(email: string) {
    try {
      return await adminAuth.getUserByEmail(email);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as { code: string }).code === 'auth/user-not-found') {
        return null;
      }
      console.error(`❌ Error getting user by email: ${email}`, error);
      throw error;
    }
  },

  async verifyTokenAndGetClaims(idToken: string) {
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      throw error;
    }
  },

  async createDocument(collection: string, docId: string, data: Record<string, unknown>) {
    try {
      const docRef = adminDb.collection(collection).doc(docId);
      await docRef.set(data, { merge: true });
      console.log(`✅ Document created: ${collection}/${docId}`);
      return docRef;
    } catch (error) {
      console.error(`❌ Failed to create document: ${collection}/${docId}`, error);
      throw error;
    }
  },

  async getDocument(collection: string, docId: string) {
    try {
      const doc = await adminDb.collection(collection).doc(docId).get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error(`❌ Error getting document: ${collection}/${docId}`, error);
      throw error;
    }
  },

  async queryCollection(collection: string, limit: number = 100) {
    try {
      const snapshot = await adminDb.collection(collection).limit(limit).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`❌ Error querying collection: ${collection}`, error);
      throw error;
    }
  },

  async batchWrite(operations: Array<{ collection: string; docId: string; data: Record<string, unknown> }>) {
    try {
      const batch = adminDb.batch();
      
      operations.forEach(({ collection, docId, data }) => {
        const docRef = adminDb.collection(collection).doc(docId);
        batch.set(docRef, data, { merge: true });
      });
      
      await batch.commit();
      console.log(`✅ Batch write completed: ${operations.length} operations`);
    } catch (error) {
      console.error(`❌ Batch write failed`, error);
      throw error;
    }
  },

  async deleteDocument(collection: string, docId: string) {
    try {
      await adminDb.collection(collection).doc(docId).delete();
      console.log(`✅ Document deleted: ${collection}/${docId}`);
    } catch (error) {
      console.error(`❌ Failed to delete document: ${collection}/${docId}`, error);
      throw error;
    }
  }
};