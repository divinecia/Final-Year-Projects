// scripts/seed.ts
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore';
import { workers } from '../lib/seed-data';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

function getFirebaseConfig() {
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];

  for (const key of requiredVars) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

function getFirebaseApp() {
  const existingApps = getApps();
  if (existingApps.length === 0) {
    const config = getFirebaseConfig();
    console.log('Initializing Firebase with config for project:', config.projectId);
    return initializeApp(config);
  }
  return existingApps[0];
}

async function seedDatabase() {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const workerCollectionRef = collection(db, 'workers');
  const batch = writeBatch(db);

  console.log('Starting to seed worker collection...');

  workers.forEach((worker) => {
    const docRef = doc(workerCollectionRef);
    // Use the data as-is since client SDK handles Timestamps correctly
    batch.set(docRef, {
      ...worker,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  try {
    await batch.commit();
    console.log(`Successfully seeded ${workers.length} workers into the workers collection.`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

(async () => {
  try {
    await seedDatabase();
    console.log('Seeding script finished successfully.');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
})();