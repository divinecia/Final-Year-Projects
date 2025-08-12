import * as admin from "firebase-admin";
import serviceAccountFallback from "./househelp-42493-firebase-adminsdk-fbsvc-4126e55eb7.json" assert { type: "json" };

// Use environment variables for consistency with other admin configs
const createServiceAccount = () => {
  try {
    // Try service account JSON from environment first
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    }
    
    // Fallback to individual environment variables
    return {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || 'househelp-42493',
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || '',
    };
  } catch (error) {
    console.error('Error creating service account:', error);
    // Final fallback to local service account file
    return serviceAccountFallback;
  }
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(createServiceAccount()),
    projectId: 'househelp-42493'
  });
}

export default admin;
