#!/usr/bin/env tsx

/**
 * Create urgent service requests for the platform
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

const urgentServiceTypes = [
  'emergency_cleaning',
  'urgent_childcare',
  'last_minute_cooking',
  'emergency_eldercare',
  'urgent_laundry',
  'immediate_pet_care',
  'emergency_housesitting',
  'urgent_party_help',
  'emergency_medical_assistance',
  'urgent_moving_help'
];

const urgencyLevels = ['critical', 'high', 'medium'];
const requestStatuses = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];

async function createUrgentServices() {
  console.log('🚨 Creating urgent service requests...\n');

  try {
    // Get households and workers
    const householdsSnapshot = await adminDb.collection('households').get();
    const workersSnapshot = await adminDb.collection('workers').get();

    if (householdsSnapshot.empty) {
      console.log('❌ No households found. Please seed households first.');
      return;
    }

    const households = householdsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Array<{
      id: string;
      firstName: string;
      lastName: string;
      location: string;
      phone: string;
      [key: string]: unknown;
    }>;

    const workers = workersSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Array<{
      id: string;
      firstName: string;
      lastName: string;
      services?: string[];
      [key: string]: unknown;
    }>;

    // Create 15-18 urgent service requests
    const totalRequests = 16;
    
    for (let i = 0; i < totalRequests; i++) {
      const household = households[Math.floor(Math.random() * households.length)];
      const serviceType = urgentServiceTypes[Math.floor(Math.random() * urgentServiceTypes.length)];
      const urgency = urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)];
      const status = requestStatuses[Math.floor(Math.random() * requestStatuses.length)];
      
      // Assign worker if status is not pending
      let assignedWorker = null;
      if (status !== 'pending' && workers.length > 0) {
        assignedWorker = workers[Math.floor(Math.random() * workers.length)];
      }

      // Create realistic service descriptions
      let description = '';
      let estimatedDuration = 2; // hours
      let priceMultiplier = 1.5; // urgent services cost more
      
      switch (serviceType) {
        case 'emergency_cleaning':
          description = 'Urgent cleaning needed for unexpected guests arriving in 2 hours. Full house cleaning required.';
          estimatedDuration = 3;
          priceMultiplier = 1.8;
          break;
        case 'urgent_childcare':
          description = 'Emergency childcare needed immediately. Parent has medical appointment that cannot be postponed.';
          estimatedDuration = 4;
          priceMultiplier = 2.0;
          break;
        case 'last_minute_cooking':
          description = 'Need experienced cook for dinner party tonight. 15 guests, traditional Rwandan cuisine preferred.';
          estimatedDuration = 5;
          priceMultiplier = 1.7;
          break;
        case 'emergency_eldercare':
          description = 'Urgent elderly care assistance needed. Regular caregiver is unavailable due to family emergency.';
          estimatedDuration = 6;
          priceMultiplier = 2.2;
          break;
        case 'urgent_laundry':
          description = 'Large amount of laundry must be done today. Important business trip tomorrow morning.';
          estimatedDuration = 2;
          priceMultiplier = 1.4;
          break;
        default:
          description = `Urgent ${serviceType.replace('_', ' ')} service needed immediately. Time sensitive situation.`;
          estimatedDuration = Math.floor(Math.random() * 4) + 2;
          priceMultiplier = 1.5 + Math.random() * 0.5;
      }

      const basePrice = 15000; // Base hourly rate in RWF
      const totalPrice = Math.round(basePrice * estimatedDuration * priceMultiplier);

      const requestedTime = new Date(Date.now() + Math.random() * 6 * 60 * 60 * 1000); // Next 6 hours
      const createdTime = new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000); // Last 48 hours

      const urgentServiceData = {
        id: `urgent_${Date.now()}_${i}`,
        householdId: household.id,
        householdName: `${household.firstName} ${household.lastName}`,
        householdPhone: household.phone,
        householdLocation: household.location || `${household.district}, ${household.sector}, Kigali`,
        serviceType,
        title: `URGENT: ${serviceType.replace('_', ' ').toUpperCase()}`,
        description,
        urgencyLevel: urgency,
        status,
        estimatedDuration,
        estimatedPrice: totalPrice,
        actualPrice: status === 'completed' ? totalPrice + Math.floor(Math.random() * 5000) - 2500 : null,
        priceMultiplier,
        requestedStartTime: requestedTime,
        assignedWorkerId: assignedWorker?.id || null,
        assignedWorkerName: assignedWorker ? `${assignedWorker.firstName} ${assignedWorker.lastName}` : null,
        assignedAt: assignedWorker ? new Date(createdTime.getTime() + Math.random() * 30 * 60 * 1000) : null,
        startedAt: status === 'in_progress' || status === 'completed' ? 
          new Date(requestedTime.getTime() - Math.random() * 60 * 60 * 1000) : null,
        completedAt: status === 'completed' ? 
          new Date(requestedTime.getTime() + estimatedDuration * 60 * 60 * 1000) : null,
        specialInstructions: Math.random() > 0.5 ? 'Please bring your own cleaning supplies' : null,
        locationDetails: 'Gate code: 1234. Call upon arrival.',
        emergencyContact: household.phone,
        requiresBackground: urgency === 'critical',
        paymentMethod: Math.random() > 0.5 ? 'mobile_money' : 'cash',
        paymentStatus: status === 'completed' ? 'paid' : status === 'cancelled' ? 'refunded' : 'pending',
        rating: status === 'completed' ? Math.floor(Math.random() * 2) + 4 : null, // 4-5 stars
        feedback: status === 'completed' ? 'Excellent urgent service. Very professional and quick response.' : null,
        responseTime: assignedWorker ? Math.floor(Math.random() * 15) + 5 : null, // 5-20 minutes
        createdAt: createdTime,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: status === 'pending' || status === 'assigned' || status === 'in_progress'
      };

      await adminDb.collection('urgent_services').add(urgentServiceData);
      console.log(`✅ Urgent service created: ${serviceType} (${urgency} urgency, ${status})`);
    }

    console.log('\n📊 Urgent Services Statistics:');
    const servicesSnapshot = await adminDb.collection('urgent_services').get();
    const allServices = servicesSnapshot.docs.map(doc => doc.data());

    console.log(`Total urgent requests: ${allServices.length}`);
    
    console.log('\nBy Status:');
    requestStatuses.forEach(status => {
      const count = allServices.filter(s => s.status === status).length;
      console.log(`  ${status}: ${count} requests`);
    });

    console.log('\nBy Urgency:');
    urgencyLevels.forEach(level => {
      const count = allServices.filter(s => s.urgencyLevel === level).length;
      console.log(`  ${level}: ${count} requests`);
    });

    const completedServices = allServices.filter(s => s.status === 'completed');
    if (completedServices.length > 0) {
      const avgResponseTime = completedServices
        .filter(s => s.responseTime)
        .reduce((sum, s) => sum + (s.responseTime || 0), 0) / completedServices.filter(s => s.responseTime).length;
      console.log(`\nAverage response time: ${Math.round(avgResponseTime)} minutes`);
      
      const avgPrice = completedServices.reduce((sum, s) => sum + (s.actualPrice || 0), 0) / completedServices.length;
      console.log(`Average service price: ${Math.round(avgPrice).toLocaleString()} RWF`);
    }

  } catch (error) {
    console.error('❌ Error creating urgent services:', error);
  }
}

createUrgentServices();
