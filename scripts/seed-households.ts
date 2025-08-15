#!/usr/bin/env tsx

/**
 * Create realistic household users to populate the platform
 */

import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "househelp-42493",
  });
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

// Realistic household data for Rwanda
const householdProfiles = [
  {
    email: 'jean.mukamana@gmail.com',
    password: '@HouseHelp2025',
    firstName: 'Jean',
    lastName: 'Mukamana',
    phone: '+250788123456',
    location: 'Kimisagara, Nyarugenge, Kigali',
    householdType: 'family',
    familySize: 4,
    preferredLanguages: ['Kinyarwanda', 'French'],
    budget: '80000-120000',
    serviceNeeds: ['cleaning', 'cooking', 'childcare']
  },
  {
    email: 'grace.uwimana@yahoo.com',
    password: '@Family2025',
    firstName: 'Grace',
    lastName: 'Uwimana',
    phone: '+250789234567',
    location: 'Remera, Gasabo, Kigali',
    householdType: 'family',
    familySize: 6,
    preferredLanguages: ['Kinyarwanda', 'English'],
    budget: '100000-150000',
    serviceNeeds: ['cleaning', 'cooking', 'laundry', 'childcare']
  },
  {
    email: 'david.nzeyimana@outlook.com',
    password: '@Professional2025',
    firstName: 'David',
    lastName: 'Nzeyimana',
    phone: '+250790345678',
    location: 'Kibagabaga, Gasabo, Kigali',
    householdType: 'single_professional',
    familySize: 1,
    preferredLanguages: ['English', 'Kinyarwanda'],
    budget: '60000-90000',
    serviceNeeds: ['cleaning', 'laundry']
  },
  {
    email: 'marie.kayitesi@gmail.com',
    password: '@Working2025',
    firstName: 'Marie',
    lastName: 'Kayitesi',
    phone: '+250791456789',
    location: 'Kacyiru, Gasabo, Kigali',
    householdType: 'couple',
    familySize: 2,
    preferredLanguages: ['Kinyarwanda', 'French', 'English'],
    budget: '70000-100000',
    serviceNeeds: ['cleaning', 'cooking']
  },
  {
    email: 'patrick.bizimana@company.rw',
    password: '@Executive2025',
    firstName: 'Patrick',
    lastName: 'Bizimana',
    phone: '+250792567890',
    location: 'Nyarutarama, Gasabo, Kigali',
    householdType: 'family',
    familySize: 5,
    preferredLanguages: ['English', 'French'],
    budget: '150000-250000',
    serviceNeeds: ['cleaning', 'cooking', 'childcare', 'gardening', 'security']
  },
  {
    email: 'agnes.murekatete@kigali.rw',
    password: '@Senior2025',
    firstName: 'Agnes',
    lastName: 'Murekatete',
    phone: '+250793678901',
    location: 'Gisozi, Gasabo, Kigali',
    householdType: 'elderly',
    familySize: 2,
    preferredLanguages: ['Kinyarwanda'],
    budget: '90000-130000',
    serviceNeeds: ['cleaning', 'cooking', 'companion_care', 'shopping']
  },
  {
    email: 'samuel.habimana@tech.rw',
    password: '@Tech2025',
    firstName: 'Samuel',
    lastName: 'Habimana',
    phone: '+250794789012',
    location: 'Kiyovu, Nyarugenge, Kigali',
    householdType: 'young_professional',
    familySize: 1,
    preferredLanguages: ['English', 'Kinyarwanda'],
    budget: '50000-80000',
    serviceNeeds: ['cleaning', 'laundry', 'meal_prep']
  },
  {
    email: 'esperance.uwase@university.ac.rw',
    password: '@Academic2025',
    firstName: 'Esperance',
    lastName: 'Uwase',
    phone: '+250795890123',
    location: 'Muhima, Nyarugenge, Kigali',
    householdType: 'family',
    familySize: 3,
    preferredLanguages: ['French', 'English', 'Kinyarwanda'],
    budget: '85000-115000',
    serviceNeeds: ['cleaning', 'childcare', 'tutoring']
  }
];

async function createHouseholdUsers() {
  console.log('🏠 Creating realistic household users...\n');

  for (const household of householdProfiles) {
    try {
      console.log(`Creating household: ${household.firstName} ${household.lastName}`);

      // Check if user already exists
      let userRecord;
      try {
        userRecord = await adminAuth.getUserByEmail(household.email);
        console.log(`⚠️  User ${household.email} already exists (UID: ${userRecord.uid})`);
      } catch {
        // Create Firebase Auth user
        userRecord = await adminAuth.createUser({
          email: household.email,
          password: household.password,
          displayName: `${household.firstName} ${household.lastName}`,
          emailVerified: true
        });
        console.log(`✅ Firebase Auth user created (UID: ${userRecord.uid})`);
      }

      // Create Firestore household document
      const householdDocRef = adminDb.collection('households').doc(userRecord.uid);
      const householdData = {
        userId: userRecord.uid,
        email: household.email,
        firstName: household.firstName,
        lastName: household.lastName,
        displayName: `${household.firstName} ${household.lastName}`,
        phone: household.phone,
        location: household.location,
        householdType: household.householdType,
        familySize: household.familySize,
        preferredLanguages: household.preferredLanguages,
        budget: household.budget,
        serviceNeeds: household.serviceNeeds,
        profileComplete: true,
        verified: true,
        rating: Math.floor(Math.random() * 2) + 4, // 4.0-5.0 rating
        totalJobs: Math.floor(Math.random() * 8) + 2, // 2-10 jobs
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Last 7 days
      };

      await householdDocRef.set(householdData, { merge: true });
      console.log(`✅ Household document created`);

      console.log(`🎉 Household ready: ${household.firstName} ${household.lastName} (${household.location})\n`);

    } catch (error) {
      console.error(`❌ Failed to create household ${household.firstName} ${household.lastName}:`, error);
    }
  }

  console.log('📋 Household creation completed!\n');

  // List all households
  console.log('🔍 All household users:');
  const householdSnapshot = await adminDb.collection('households').get();
  console.log(`Total households: ${householdSnapshot.size}`);
  householdSnapshot.forEach(doc => {
    const data = doc.data();
    console.log(`  - ${data.firstName} ${data.lastName} (${data.location}) - ${data.serviceNeeds?.join(', ')}`);
  });
}

createHouseholdUsers().catch(console.error);
