#!/usr/bin/env tsx

/**
 * Create worker arrival tracking and ETA data
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

const adminDb = admin.firestore();

const trackingStatuses = ['scheduled', 'en_route', 'nearby', 'arrived', 'working', 'completed', 'cancelled'];
const transportMethods = ['walking', 'motorcycle', 'bus', 'bicycle', 'car'];

// Kigali locations for realistic tracking
const kigaliLocations = [
  { name: 'Kimisagara, Nyarugenge', coordinates: { lat: -1.9644, lng: 30.0583 } },
  { name: 'Remera, Gasabo', coordinates: { lat: -1.9358, lng: 30.1055 } },
  { name: 'Kacyiru, Gasabo', coordinates: { lat: -1.9408, lng: 30.0816 } },
  { name: 'Nyarutarama, Gasabo', coordinates: { lat: -1.9242, lng: 30.1055 } },
  { name: 'Kiyovu, Nyarugenge', coordinates: { lat: -1.9536, lng: 30.0583 } },
  { name: 'Gisozi, Gasabo', coordinates: { lat: -1.9164, lng: 30.0816 } },
  { name: 'Muhima, Nyarugenge', coordinates: { lat: -1.9536, lng: 30.0644 } },
  { name: 'Kibagabaga, Gasabo', coordinates: { lat: -1.9358, lng: 30.1277 } }
];

async function createWorkerTracking() {
  console.log('📍 Creating worker arrival tracking data...\n');

  try {
    // Get workers and households
    const workersSnapshot = await adminDb.collection('workers').get();
    const householdsSnapshot = await adminDb.collection('households').get();

    if (workersSnapshot.empty || householdsSnapshot.empty) {
      console.log('❌ No workers or households found. Please seed them first.');
      return;
    }

    const workers = workersSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Array<{
      id: string;
      firstName: string;
      lastName: string;
      phone: string;
      [key: string]: unknown;
    }>;

    const households = householdsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Array<{
      id: string;
      firstName: string;
      lastName: string;
      location: string;
      [key: string]: unknown;
    }>;

    // Create 25-30 tracking records
    const totalTrackings = 28;
    
    for (let i = 0; i < totalTrackings; i++) {
      const worker = workers[Math.floor(Math.random() * workers.length)];
      const household = households[Math.floor(Math.random() * households.length)];
      const status = trackingStatuses[Math.floor(Math.random() * trackingStatuses.length)];
      const transport = transportMethods[Math.floor(Math.random() * transportMethods.length)];
      
      // Generate realistic timing
      const scheduledTime = new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000); // Next 24 hours
      const actualStartTime = status !== 'scheduled' ? 
        new Date(scheduledTime.getTime() - Math.random() * 30 * 60 * 1000) : null; // Started up to 30 min early/late
      
      // Pick locations
      const workerLocation = kigaliLocations[Math.floor(Math.random() * kigaliLocations.length)];
      const householdLocation = kigaliLocations[Math.floor(Math.random() * kigaliLocations.length)];
      
      // Calculate realistic distance and ETA
      const distance = Math.random() * 15 + 2; // 2-17 km (realistic for Kigali)
      let estimatedDuration = 0;
      
      switch (transport) {
        case 'walking':
          estimatedDuration = distance * 12; // 12 min/km
          break;
        case 'bicycle':
          estimatedDuration = distance * 4; // 4 min/km
          break;
        case 'motorcycle':
          estimatedDuration = distance * 2.5; // 2.5 min/km
          break;
        case 'bus':
          estimatedDuration = distance * 3.5; // 3.5 min/km (with stops)
          break;
        case 'car':
          estimatedDuration = distance * 2; // 2 min/km
          break;
      }
      
      // Add traffic factor
      const trafficFactor = Math.random() * 0.5 + 0.8; // 0.8x to 1.3x normal time
      estimatedDuration = Math.round(estimatedDuration * trafficFactor);
      
      const etaTime = actualStartTime ? 
        new Date(actualStartTime.getTime() + estimatedDuration * 60 * 1000) : 
        new Date(scheduledTime.getTime() + estimatedDuration * 60 * 1000);

      // Arrival time (if status shows arrived or beyond)
      const arrivedTime = ['arrived', 'working', 'completed'].includes(status) ? 
        new Date(etaTime.getTime() + (Math.random() - 0.5) * 20 * 60 * 1000) : null; // ±20 minutes from ETA

      const trackingData = {
        id: `track_${Date.now()}_${i}`,
        jobId: `job_${Date.now()}_${i}`, // Reference to a job
        workerId: worker.id,
        workerName: `${worker.firstName} ${worker.lastName}`,
        workerPhone: worker.phone,
        householdId: household.id,
        householdName: `${household.firstName} ${household.lastName}`,
        householdLocation: household.location || `${household.district}, ${household.sector}, Kigali`,
        
        // Status and timing
        status,
        scheduledTime,
        actualStartTime,
        estimatedArrivalTime: etaTime,
        actualArrivalTime: arrivedTime,
        completedTime: status === 'completed' ? 
          new Date((arrivedTime?.getTime() || Date.now()) + Math.random() * 4 * 60 * 60 * 1000) : null,
        
        // Location and route
        workerCurrentLocation: {
          name: workerLocation.name,
          coordinates: workerLocation.coordinates,
          lastUpdated: new Date(Date.now() - Math.random() * 10 * 60 * 1000) // Last 10 minutes
        },
        destinationLocation: {
          name: householdLocation.name,
          coordinates: householdLocation.coordinates,
          address: household.location || `${household.district}, ${household.sector}, Kigali`
        },
        
        // Journey details
        transportMethod: transport,
        estimatedDistance: Math.round(distance * 10) / 10, // Round to 1 decimal
        estimatedDuration, // in minutes
        actualDuration: arrivedTime && actualStartTime ? 
          Math.round((arrivedTime.getTime() - actualStartTime.getTime()) / (1000 * 60)) : null,
        
        // Route tracking
        routePoints: (() => {
          const points = [];
          if (status !== 'scheduled') {
            // Generate route points
            const steps = Math.floor(Math.random() * 8) + 3; // 3-10 route points
            for (let j = 0; j < steps; j++) {
              const progress = j / (steps - 1);
              points.push({
                coordinates: {
                  lat: workerLocation.coordinates.lat + (householdLocation.coordinates.lat - workerLocation.coordinates.lat) * progress,
                  lng: workerLocation.coordinates.lng + (householdLocation.coordinates.lng - workerLocation.coordinates.lng) * progress
                },
                timestamp: new Date((actualStartTime?.getTime() || Date.now()) + (estimatedDuration * progress * 60 * 1000)),
                accuracy: Math.floor(Math.random() * 20) + 5 // 5-25 meters
              });
            }
          }
          return points;
        })(),
        
        // Real-time updates
        lastLocationUpdate: status !== 'scheduled' ? 
          new Date(Date.now() - Math.random() * 15 * 60 * 1000) : null, // Last 15 minutes
        isGPSEnabled: Math.random() > 0.1, // 90% have GPS on
        batteryLevel: status !== 'scheduled' ? Math.floor(Math.random() * 70) + 30 : null, // 30-100%
        networkSignal: status !== 'scheduled' ? 
          ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)] : null,
        
        // Delays and issues
        isDelayed: arrivedTime && etaTime ? arrivedTime > etaTime : false,
        delayReason: arrivedTime && etaTime && arrivedTime > etaTime ? 
          ['traffic', 'transport_issue', 'route_change', 'weather', 'emergency'][Math.floor(Math.random() * 5)] : null,
        delayDuration: arrivedTime && etaTime && arrivedTime > etaTime ? 
          Math.round((arrivedTime.getTime() - etaTime.getTime()) / (1000 * 60)) : 0,
        
        // Communication
        notificationsEnabled: true,
        lastNotificationSent: status !== 'scheduled' ? 
          new Date(Date.now() - Math.random() * 60 * 60 * 1000) : null, // Last hour
        householdNotified: status !== 'scheduled',
        emergencyContactAvailable: true,
        
        // Service details
        serviceType: 'cleaning', // Default service
        estimatedServiceDuration: Math.floor(Math.random() * 4) + 2, // 2-6 hours
        specialInstructions: Math.random() > 0.6 ? 'Please call upon arrival' : null,
        accessInstructions: 'Gate code: 1234',
        
        // Quality metrics
        trackingAccuracy: Math.random() > 0.8 ? 'high' : 'medium',
        responseTime: Math.floor(Math.random() * 300) + 30, // 30-330 seconds for status updates
        customerSatisfaction: status === 'completed' ? Math.floor(Math.random() * 2) + 4 : null, // 4-5 rating
        
        // Metadata
        createdAt: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000), // Last 48 hours
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        trackingVersion: '2.1.0',
        isActive: ['scheduled', 'en_route', 'nearby', 'working'].includes(status),
        priority: Math.random() > 0.8 ? 'high' : 'normal'
      };

      await adminDb.collection('worker_tracking').add(trackingData);
      console.log(`✅ Tracking created: ${worker.firstName} → ${household.firstName} (${status}, ${transport}, ${Math.round(distance)}km)`);
    }

    console.log('\n📊 Worker Tracking Statistics:');
    const trackingSnapshot = await adminDb.collection('worker_tracking').get();
    const allTracking = trackingSnapshot.docs.map(doc => doc.data());

    console.log(`Total tracking records: ${allTracking.length}`);
    
    console.log('\nBy Status:');
    trackingStatuses.forEach(status => {
      const count = allTracking.filter(t => t.status === status).length;
      console.log(`  ${status}: ${count} records`);
    });
    
    console.log('\nBy Transport Method:');
    transportMethods.forEach(method => {
      const count = allTracking.filter(t => t.transportMethod === method).length;
      console.log(`  ${method}: ${count} workers`);
    });
    
    const completedTrips = allTracking.filter(t => t.status === 'completed' && t.actualDuration);
    if (completedTrips.length > 0) {
      const avgDuration = completedTrips.reduce((sum, t) => sum + (t.actualDuration || 0), 0) / completedTrips.length;
      console.log(`\nAverage journey time: ${Math.round(avgDuration)} minutes`);
    }
    
    const delayedTrips = allTracking.filter(t => t.isDelayed).length;
    console.log(`Delayed arrivals: ${delayedTrips} (${Math.round(delayedTrips / allTracking.length * 100)}%)`);

  } catch (error) {
    console.error('❌ Error creating worker tracking:', error);
  }
}

createWorkerTracking();
