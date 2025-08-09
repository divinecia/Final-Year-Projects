#!/usr/bin/env tsx

/**
 * Create realistic jobs, applications, and platform activity
 */

import * as admin from 'firebase-admin';
import serviceAccount from '../config/househelp-42493-firebase-adminsdk-fbsvc-ad129f5ed0.json';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: 'househelp-42493'
  });
}

const adminDb = admin.firestore();

// Sample job postings
const jobPostings = [
  {
    title: 'Weekly House Cleaning',
    description: 'Looking for reliable cleaner for weekly deep cleaning. 4-bedroom house in Remera.',
    services: ['cleaning'],
    budget: '60000-80000',
    duration: 'ongoing',
    location: 'Remera, Gasabo, Kigali',
    requirements: 'Experience with deep cleaning, own cleaning supplies preferred',
    schedule: 'Every Saturday, 8 hours',
    urgency: 'medium',
    status: 'active'
  },
  {
    title: 'Childcare for Twin Toddlers',
    description: 'Need experienced childcare provider for 2-year-old twins. Monday to Friday.',
    services: ['childcare'],
    budget: '150000-200000',
    duration: 'ongoing',
    location: 'Kacyiru, Gasabo, Kigali',
    requirements: 'Early childhood development training, references required',
    schedule: 'Monday-Friday, 7am-6pm',
    urgency: 'high',
    status: 'active'
  },
  {
    title: 'Cooking and Meal Prep',
    description: 'Professional cook needed for meal preparation. Rwandan and international cuisine.',
    services: ['cooking', 'meal_prep'],
    budget: '90000-120000',
    duration: '6 months',
    location: 'Nyarutarama, Gasabo, Kigali',
    requirements: 'Culinary training, experience with varied cuisines',
    schedule: 'Monday, Wednesday, Friday - 4 hours each',
    urgency: 'medium',
    status: 'filled'
  },
  {
    title: 'Elderly Companion Care',
    description: 'Caring companion needed for elderly grandmother. Light housekeeping included.',
    services: ['companion_care', 'personal_care', 'light_cleaning'],
    budget: '100000-130000',
    duration: 'ongoing',
    location: 'Muhima, Nyarugenge, Kigali',
    requirements: 'Experience with elderly care, patient and kind personality',
    schedule: 'Tuesday-Saturday, 6 hours daily',
    urgency: 'high',
    status: 'active'
  },
  {
    title: 'Garden Maintenance',
    description: 'Regular garden maintenance for large property. Landscaping knowledge preferred.',
    services: ['gardening', 'landscaping'],
    budget: '70000-90000',
    duration: 'seasonal',
    location: 'Kiyovu, Nyarugenge, Kigali',
    requirements: 'Gardening experience, knowledge of local plants',
    schedule: 'Bi-weekly, 8 hours',
    urgency: 'low',
    status: 'active'
  },
  {
    title: 'Full-time Live-in Housekeeper',
    description: 'Seeking live-in housekeeper for busy family. Cooking, cleaning, childcare.',
    services: ['cleaning', 'cooking', 'childcare', 'laundry'],
    budget: '200000-250000',
    duration: 'ongoing',
    location: 'Kimihurura, Gasabo, Kigali',
    requirements: 'Multiple skills, live-in arrangement, excellent references',
    schedule: 'Live-in, 6 days per week',
    urgency: 'high',
    status: 'active'
  }
];

async function createJobsAndActivity() {
  console.log('💼 Creating realistic jobs and platform activity...\n');

  // Get some households and workers for realistic data
  const householdsSnapshot = await adminDb.collection('households').limit(5).get();
  const workersSnapshot = await adminDb.collection('workers').limit(8).get();

  const households = householdsSnapshot.docs;
  const workers = workersSnapshot.docs;

  if (households.length === 0 || workers.length === 0) {
    console.log('⚠️ Please run household and worker seeding first!');
    return;
  }

  console.log(`Using ${households.length} households and ${workers.length} workers for realistic activity`);

  // Create jobs
  for (let i = 0; i < jobPostings.length; i++) {
    const jobData = jobPostings[i];
    const household = households[i % households.length];
    const householdData = household.data();

    try {
      const jobRef = adminDb.collection('jobs').doc();
      const job = {
        id: jobRef.id,
        ...jobData,
        householdId: household.id,
        householdName: `${householdData.firstName} ${householdData.lastName}`,
        householdEmail: householdData.email,
        postedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        applicationsCount: 0,
        viewsCount: Math.floor(Math.random() * 50) + 10
      };

      await jobRef.set(job);
      console.log(`✅ Job created: ${jobData.title}`);

      // Create applications for this job
      const applicationsCount = Math.floor(Math.random() * 5) + 2; // 2-6 applications per job
      for (let j = 0; j < applicationsCount; j++) {
        const worker = workers[j % workers.length];
        const workerData = worker.data();

        const applicationRef = adminDb.collection('applications').doc();
        const application = {
          id: applicationRef.id,
          jobId: jobRef.id,
          workerId: worker.id,
          householdId: household.id,
          workerName: `${workerData.firstName} ${workerData.lastName}`,
          workerEmail: workerData.email,
          workerPhone: workerData.phone,
          householdName: `${householdData.firstName} ${householdData.lastName}`,
          proposedRate: workerData.hourlyRate,
          message: `Hello! I'm interested in this ${jobData.services[0]} position. I have ${workerData.experience} of experience and excellent references. I'm available for the proposed schedule.`,
          status: Math.random() > 0.7 ? 'accepted' : Math.random() > 0.5 ? 'pending' : 'reviewed',
          appliedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000), // Last 5 days
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await applicationRef.set(application);
      }

      // Update job application count
      await jobRef.update({ applicationsCount });
      
    } catch (error) {
      console.error(`❌ Failed to create job ${jobData.title}:`, error);
    }
  }

  // Create some notifications
  console.log('\n📢 Creating notifications...');
  const notifications = [
    {
      type: 'new_application',
      title: 'New Application Received',
      message: 'You have received a new application for your cleaning job.',
      priority: 'medium'
    },
    {
      type: 'job_accepted',
      title: 'Application Accepted',
      message: 'Great news! Your application for the childcare position has been accepted.',
      priority: 'high'
    },
    {
      type: 'job_reminder',
      title: 'Job Starting Tomorrow',
      message: 'Reminder: Your cleaning job starts tomorrow at 9 AM.',
      priority: 'high'
    },
    {
      type: 'payment_received',
      title: 'Payment Processed',
      message: 'Payment of 75,000 RWF has been processed for your recent work.',
      priority: 'medium'
    },
    {
      type: 'profile_update',
      title: 'Profile Verification Complete',
      message: 'Your profile has been successfully verified. You can now apply for jobs.',
      priority: 'low'
    }
  ];

  for (let i = 0; i < Math.min(10, households.length + workers.length); i++) {
    const notification = notifications[i % notifications.length];
    const recipient = i < households.length ? households[i] : workers[i - households.length];
    const recipientData = recipient.data();

    const notificationRef = adminDb.collection('notifications').doc();
    await notificationRef.set({
      id: notificationRef.id,
      userId: recipient.id,
      userName: `${recipientData.firstName} ${recipientData.lastName}`,
      ...notification,
      read: Math.random() > 0.6, // 40% unread
      createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000), // Last 3 days
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  console.log('✅ Notifications created');

  // Summary
  console.log('\n📊 Platform Activity Summary:');
  const jobsCount = await adminDb.collection('jobs').get();
  const applicationsCount = await adminDb.collection('applications').get();
  const notificationsCount = await adminDb.collection('notifications').get();
  
  console.log(`  - Jobs: ${jobsCount.size}`);
  console.log(`  - Applications: ${applicationsCount.size}`);
  console.log(`  - Notifications: ${notificationsCount.size}`);
  console.log(`  - Households: ${households.length}`);
  console.log(`  - Workers: ${workers.length}`);
  
  console.log('\n🎉 Realistic platform activity created successfully!');
}

createJobsAndActivity().catch(console.error);
