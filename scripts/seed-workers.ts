#!/usr/bin/env tsx

/**
 * Create realistic worker profiles to populate the platform
 */

import * as admin from 'firebase-admin';
import serviceAccount from '../config/househelp-42493-firebase-adminsdk-fbsvc-4126e55eb7.json';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: 'househelp-42493'
  });
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

// Realistic worker profiles for Rwanda
const workerProfiles = [
  {
    email: 'claudine.uwimana@worker.rw',
    password: '@Worker2025',
    firstName: 'Claudine',
    lastName: 'Uwimana',
    phone: '+250783456789',
    location: 'Kimisagara, Nyarugenge, Kigali',
    age: 28,
    experience: '5 years',
    services: ['cleaning', 'cooking', 'childcare'],
    languages: ['Kinyarwanda', 'French'],
    hourlyRate: 2500,
    availability: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    description: 'Experienced housekeeper with excellent cooking skills. Loves working with children and maintains high cleanliness standards.',
    education: 'Secondary School',
    references: 3
  },
  {
    email: 'immaculee.mukeshimana@helper.rw',
    password: '@Helper2025',
    firstName: 'Immaculee',
    lastName: 'Mukeshimana',
    phone: '+250784567890',
    location: 'Remera, Gasabo, Kigali',
    age: 32,
    experience: '8 years',
    services: ['cleaning', 'laundry', 'ironing', 'organizing'],
    languages: ['Kinyarwanda', 'English'],
    hourlyRate: 2800,
    availability: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    description: 'Professional cleaner with expertise in laundry and home organization. Detail-oriented and reliable.',
    education: 'TVET Certificate in Hospitality',
    references: 5
  },
  {
    email: 'josephine.nyirahabimana@care.rw',
    password: '@Care2025',
    firstName: 'Josephine',
    lastName: 'Nyirahabimana',
    phone: '+250785678901',
    location: 'Kacyiru, Gasabo, Kigali',
    age: 35,
    experience: '10 years',
    services: ['childcare', 'cooking', 'tutoring', 'companion_care'],
    languages: ['Kinyarwanda', 'French', 'English'],
    hourlyRate: 3500,
    availability: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    description: 'Certified childcare provider with teaching background. Excellent with children of all ages and can help with homework.',
    education: 'Diploma in Early Childhood Development',
    references: 8
  },
  {
    email: 'damascene.nzeyimana@garden.rw',
    password: '@Garden2025',
    firstName: 'Damascene',
    lastName: 'Nzeyimana',
    phone: '+250786789012',
    location: 'Nyarutarama, Gasabo, Kigali',
    age: 42,
    experience: '15 years',
    services: ['gardening', 'landscaping', 'security', 'maintenance'],
    languages: ['Kinyarwanda', 'English'],
    hourlyRate: 3000,
    availability: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    description: 'Professional gardener and maintenance worker. Experienced in landscape design and home security.',
    education: 'Certificate in Agriculture',
    references: 6
  },
  {
    email: 'vestine.uwase@cook.rw',
    password: '@Cook2025',
    firstName: 'Vestine',
    lastName: 'Uwase',
    phone: '+250787890123',
    location: 'Gisozi, Gasabo, Kigali',
    age: 29,
    experience: '6 years',
    services: ['cooking', 'meal_prep', 'shopping', 'kitchen_management'],
    languages: ['Kinyarwanda', 'French'],
    hourlyRate: 3200,
    availability: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'sunday'],
    description: 'Professional cook specializing in both Rwandan and international cuisine. Expert meal planning and kitchen organization.',
    education: 'Certificate in Culinary Arts',
    references: 4
  },
  {
    email: 'alice.mukamana@senior.rw',
    password: '@Senior2025',
    firstName: 'Alice',
    lastName: 'Mukamana',
    phone: '+250788901234',
    location: 'Muhima, Nyarugenge, Kigali',
    age: 45,
    experience: '12 years',
    services: ['companion_care', 'personal_care', 'cooking', 'cleaning'],
    languages: ['Kinyarwanda'],
    hourlyRate: 2700,
    availability: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    description: 'Experienced in elderly care and personal assistance. Patient, caring, and reliable with excellent references.',
    education: 'Primary School + Care Training',
    references: 7
  },
  {
    email: 'fiona.uwimana@multi.rw',
    password: '@Multi2025',
    firstName: 'Fiona',
    lastName: 'Uwimana',
    phone: '+250789012345',
    location: 'Kiyovu, Nyarugenge, Kigali',
    age: 26,
    experience: '4 years',
    services: ['cleaning', 'cooking', 'laundry', 'pet_care'],
    languages: ['Kinyarwanda', 'English', 'French'],
    hourlyRate: 2600,
    availability: ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    description: 'Multi-skilled worker fluent in three languages. Great with pets and flexible with various household tasks.',
    education: 'Secondary School',
    references: 3
  },
  {
    email: 'boniface.habimana@driver.rw',
    password: '@Driver2025',
    firstName: 'Boniface',
    lastName: 'Habimana',
    phone: '+250790123456',
    location: 'Kibagabaga, Gasabo, Kigali',
    age: 38,
    experience: '12 years',
    services: ['driving', 'security', 'maintenance', 'shopping'],
    languages: ['Kinyarwanda', 'English'],
    hourlyRate: 4000,
    availability: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    description: 'Professional driver with clean driving record. Also provides security services and household maintenance.',
    education: 'Secondary School + Driving License',
    references: 9
  },
  {
    email: 'beatrice.nyiraneza@clean.rw',
    password: '@Clean2025',
    firstName: 'Beatrice',
    lastName: 'Nyiraneza',
    phone: '+250791234567',
    location: 'Kimihurura, Gasabo, Kigali',
    age: 33,
    experience: '7 years',
    services: ['cleaning', 'organizing', 'laundry', 'ironing'],
    languages: ['Kinyarwanda', 'English'],
    hourlyRate: 2400,
    availability: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    description: 'Professional cleaner with expertise in home organization and efficient cleaning systems. Very punctual and thorough.',
    education: 'TVET Certificate',
    references: 5
  },
  {
    email: 'sylvain.niyonshuti@handy.rw',
    password: '@Handy2025',
    firstName: 'Sylvain',
    lastName: 'Niyonshuti',
    phone: '+250792345678',
    location: 'Nyamirambo, Nyarugenge, Kigali',
    age: 40,
    experience: '18 years',
    services: ['maintenance', 'repairs', 'plumbing', 'electrical'],
    languages: ['Kinyarwanda', 'French'],
    hourlyRate: 4500,
    availability: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    description: 'Skilled handyman with extensive experience in home repairs, plumbing, and basic electrical work. Very reliable.',
    education: 'TVET Certificate in Construction',
    references: 12
  }
];

async function createWorkerUsers() {
  console.log('👷 Creating realistic worker users...\n');

  for (const worker of workerProfiles) {
    try {
      console.log(`Creating worker: ${worker.firstName} ${worker.lastName}`);

      // Check if user already exists
      let userRecord;
      try {
        userRecord = await adminAuth.getUserByEmail(worker.email);
        console.log(`⚠️  User ${worker.email} already exists (UID: ${userRecord.uid})`);
      } catch {
        // Create Firebase Auth user
        userRecord = await adminAuth.createUser({
          email: worker.email,
          password: worker.password,
          displayName: `${worker.firstName} ${worker.lastName}`,
          emailVerified: true
        });
        console.log(`✅ Firebase Auth user created (UID: ${userRecord.uid})`);
      }

      // Create Firestore worker document
      const workerDocRef = adminDb.collection('workers').doc(userRecord.uid);
      const workerData = {
        userId: userRecord.uid,
        email: worker.email,
        firstName: worker.firstName,
        lastName: worker.lastName,
        displayName: `${worker.firstName} ${worker.lastName}`,
        phone: worker.phone,
        location: worker.location,
        age: worker.age,
        experience: worker.experience,
        services: worker.services,
        languages: worker.languages,
        hourlyRate: worker.hourlyRate,
        availability: worker.availability,
        description: worker.description,
        education: worker.education,
        references: worker.references,
        profileComplete: true,
        verified: true,
        backgroundCheck: 'completed',
        rating: Math.floor(Math.random() * 10) / 2 + 4, // 4.0-4.9 rating
        totalJobs: Math.floor(Math.random() * 15) + 5, // 5-20 jobs
        completionRate: Math.floor(Math.random() * 10) + 90, // 90-100% completion
        responseTime: Math.floor(Math.random() * 30) + 15, // 15-45 minutes
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
        isAvailable: Math.random() > 0.3, // 70% available
        lastActive: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000) // Last 2 days
      };

      await workerDocRef.set(workerData, { merge: true });
      console.log(`✅ Worker document created`);
      
      console.log(`🎉 Worker ready: ${worker.firstName} ${worker.lastName} (${worker.services.join(', ')})\n`);

    } catch (error) {
      console.error(`❌ Failed to create worker ${worker.firstName} ${worker.lastName}:`, error);
    }
  }

  console.log('📋 Worker creation completed!\n');
  
  // List all workers
  console.log('🔍 All worker users:');
  const workerSnapshot = await adminDb.collection('workers').get();
  console.log(`Total workers: ${workerSnapshot.size}`);
  workerSnapshot.forEach(doc => {
    const data = doc.data();
    console.log(`  - ${data.firstName} ${data.lastName} - ${data.services?.join(', ')} - ${data.hourlyRate} RWF/hr`);
  });
}

createWorkerUsers().catch(console.error);
