#!/usr/bin/env tsx

/**
 * Create realistic service payments and training payments for analytics
 */

import * as admin from 'firebase-admin';
import serviceAccount from '../config/househelp-42493-firebase-adminsdk-fbsvc-ad129f5ed0.json';

// Type definitions
interface Job {
  id: string;
  title?: string;
  services?: string[];
}

interface Worker {
  id: string;
  firstName?: string;
  lastName?: string;
}

interface Household {
  id: string;
  firstName?: string;
  lastName?: string;
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: 'househelp-42493'
  });
}

const adminDb = admin.firestore();

const trainingCourses = [
  'Basic Housekeeping',
  'Childcare Fundamentals',
  'Elderly Care',
  'First Aid Certification',
  'Cooking Skills',
  'Customer Service',
  'Safety & Security'
];

const paymentStatuses = ['completed', 'pending', 'failed'];

async function createServicePayments() {
  console.log('💳 Creating service payments for analytics...\n');

  try {
    // Get existing jobs to create payments for
    const jobsSnapshot = await adminDb.collection('jobs').get();
    const jobs = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Job[];

    // Get existing workers and households
    const workersSnapshot = await adminDb.collection('workers').get();
    const workers = workersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Worker[];
    
    const householdsSnapshot = await adminDb.collection('households').get();
    const households = householdsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Household[];

    const servicePaymentsToCreate = Math.min(45, jobs.length); // Create up to 45 service payments

    for (let i = 0; i < servicePaymentsToCreate; i++) {
      const job = jobs[i % jobs.length];
      const worker = workers[Math.floor(Math.random() * workers.length)];
      const household = households[Math.floor(Math.random() * households.length)];
      const status = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      
      // Create realistic payment amounts based on service type
      const serviceType = job.services && job.services.length > 0 ? job.services[0] : 'house_cleaning';
      const baseAmount = getBaseAmountForService(serviceType);
      const platformFee = Math.round(baseAmount * 0.08); // 8% platform fee
      const tax = Math.round(baseAmount * 0.18); // 18% VAT
      const netAmount = baseAmount - platformFee - tax;
      
      // Create payment date within last 6 months
      const paymentDate = new Date();
      paymentDate.setDate(paymentDate.getDate() - Math.floor(Math.random() * 180));

      const servicePaymentData = {
        jobId: job.id,
        jobTitle: job.title || 'Service Job',
        serviceType: serviceType,
        workerId: worker.id,
        workerName: `${worker.firstName || 'Worker'} ${worker.lastName || i + 1}`,
        householdId: household.id,
        householdName: `${household.firstName || 'Household'} ${household.lastName || i + 1}`,
        amount: baseAmount,
        netAmount: netAmount,
        platformFee: platformFee,
        tax: tax,
        status: status,
        paymentMethod: Math.random() > 0.5 ? 'mobile_money' : 'bank_transfer',
        transactionId: `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        createdAt: admin.firestore.Timestamp.fromDate(paymentDate),
        paidAt: status === 'completed' ? admin.firestore.Timestamp.fromDate(paymentDate) : null,
        currency: 'RWF'
      };

      await adminDb.collection('servicePayments').add(servicePaymentData);
      console.log(`✅ Service payment created: ${servicePaymentData.jobTitle} - ${baseAmount} RWF (${status})`);
    }

    // Get service payments count
    const servicePaymentsSnapshot = await adminDb.collection('servicePayments').get();
    console.log(`\n📊 Service Payments Statistics:`);
    console.log(`Total service payments: ${servicePaymentsSnapshot.size}`);

    // Count by status
    const statusCounts = { completed: 0, pending: 0, failed: 0 };
    let totalRevenue = 0;
    
    servicePaymentsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      statusCounts[data.status as keyof typeof statusCounts]++;
      if (data.status === 'completed') {
        totalRevenue += data.amount || 0;
      }
    });

    console.log(`By Status:`);
    console.log(`  completed: ${statusCounts.completed} payments`);
    console.log(`  pending: ${statusCounts.pending} payments`);
    console.log(`  failed: ${statusCounts.failed} payments`);
    console.log(`Total revenue: ${totalRevenue.toLocaleString()} RWF`);

  } catch (error) {
    console.error('❌ Error creating service payments:', error);
  }
}

async function createTrainingPayments() {
  console.log('\n🎓 Creating training payments for analytics...\n');

  try {
    // Get existing workers
    const workersSnapshot = await adminDb.collection('workers').get();
    const workers = workersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Worker[];

    const trainingPaymentsToCreate = 25;

    for (let i = 0; i < trainingPaymentsToCreate; i++) {
      const worker = workers[Math.floor(Math.random() * workers.length)];
      const course = trainingCourses[Math.floor(Math.random() * trainingCourses.length)];
      const status = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      
      // Training course prices
      const courseAmount = getTrainingCoursePrice(course);
      const platformFee = Math.round(courseAmount * 0.05); // 5% platform fee for training
      const netAmount = courseAmount - platformFee;
      
      // Create payment date within last 4 months
      const paymentDate = new Date();
      paymentDate.setDate(paymentDate.getDate() - Math.floor(Math.random() * 120));

      const trainingPaymentData = {
        workerId: worker.id,
        workerName: `${worker.firstName || 'Worker'} ${worker.lastName || i + 1}`,
        courseTitle: course,
        courseId: `COURSE_${course.toLowerCase().replace(/\s+/g, '_')}`,
        amount: courseAmount,
        netAmount: netAmount,
        platformFee: platformFee,
        status: status,
        paymentMethod: Math.random() > 0.7 ? 'mobile_money' : 'bank_transfer',
        transactionId: `TRN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        createdAt: admin.firestore.Timestamp.fromDate(paymentDate),
        completedAt: status === 'completed' ? admin.firestore.Timestamp.fromDate(paymentDate) : null,
        currency: 'RWF',
        certificateIssued: status === 'completed'
      };

      await adminDb.collection('trainingPayments').add(trainingPaymentData);
      console.log(`✅ Training payment created: ${course} - ${courseAmount} RWF (${status})`);
    }

    // Get training payments count
    const trainingPaymentsSnapshot = await adminDb.collection('trainingPayments').get();
    console.log(`\n📊 Training Payments Statistics:`);
    console.log(`Total training payments: ${trainingPaymentsSnapshot.size}`);

    // Count by status
    const statusCounts = { completed: 0, pending: 0, failed: 0 };
    let totalRevenue = 0;
    
    trainingPaymentsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      statusCounts[data.status as keyof typeof statusCounts]++;
      if (data.status === 'completed') {
        totalRevenue += data.amount || 0;
      }
    });

    console.log(`By Status:`);
    console.log(`  completed: ${statusCounts.completed} courses`);
    console.log(`  pending: ${statusCounts.pending} courses`);
    console.log(`  failed: ${statusCounts.failed} courses`);
    console.log(`Total training revenue: ${totalRevenue.toLocaleString()} RWF`);

  } catch (error) {
    console.error('❌ Error creating training payments:', error);
  }
}

function getBaseAmountForService(serviceType: string): number {
  const servicePrices = {
    house_cleaning: 25000,
    babysitting: 30000,
    cooking: 20000,
    laundry: 15000,
    gardening: 35000,
    elderly_care: 40000,
    pet_care: 18000
  };
  
  return servicePrices[serviceType as keyof typeof servicePrices] || 25000;
}

function getTrainingCoursePrice(course: string): number {
  const coursePrices = {
    'Basic Housekeeping': 15000,
    'Childcare Fundamentals': 25000,
    'Elderly Care': 30000,
    'First Aid Certification': 35000,
    'Cooking Skills': 20000,
    'Customer Service': 18000,
    'Safety & Security': 22000
  };
  
  return coursePrices[course as keyof typeof coursePrices] || 20000;
}

async function main() {
  console.log('🚀 Starting analytics payments seeding...\n');
  
  await createServicePayments();
  await createTrainingPayments();
  
  console.log('\n🎉 Analytics payments seeding completed successfully!');
}

// Run the script
main().catch(console.error);
