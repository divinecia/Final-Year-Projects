#!/usr/bin/env tsx

/**
 * Create Isange (One Stop Center) reports for the platform
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

// Isange incident types
const incidentTypes = [
  'harassment',
  'discrimination',
  'unfair_payment',
  'workplace_safety',
  'contract_violation',
  'verbal_abuse',
  'working_conditions',
  'payment_delay',
  'inappropriate_behavior',
  'privacy_violation'
];

const reportStatuses = ['pending', 'under_investigation', 'resolved', 'closed'];

async function createIsangeReports() {
  console.log('🚨 Creating Isange One Stop Center reports...\n');

  try {
    // Get users for realistic reporting
    const workersSnapshot = await adminDb.collection('workers').get();
    const householdsSnapshot = await adminDb.collection('households').get();

    if (workersSnapshot.empty && householdsSnapshot.empty) {
      console.log('❌ No users found. Please seed users first.');
      return;
    }

    const allUsers = [
      ...workersSnapshot.docs.map(doc => ({ id: doc.id, type: 'worker', ...doc.data() })),
      ...householdsSnapshot.docs.map(doc => ({ id: doc.id, type: 'household', ...doc.data() }))
    ] as Array<{
      id: string;
      type: string;
      firstName: string;
      lastName: string;
      email: string;
      [key: string]: unknown;
    }>;

    // Create 12-15 reports
    const totalReports = 14;
    
    for (let i = 0; i < totalReports; i++) {
      const reporter = allUsers[Math.floor(Math.random() * allUsers.length)];
      const incidentType = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
      const status = reportStatuses[Math.floor(Math.random() * reportStatuses.length)];
      
      // Create incident description based on type
      let description = '';
      let severity = 'medium';
      
      switch (incidentType) {
        case 'harassment':
          description = 'Reported inappropriate behavior and harassment during work hours. Request immediate investigation.';
          severity = 'high';
          break;
        case 'unfair_payment':
          description = 'Payment was significantly lower than agreed upon. No proper explanation provided.';
          severity = 'medium';
          break;
        case 'workplace_safety':
          description = 'Unsafe working conditions including lack of proper safety equipment and hazardous environment.';
          severity = 'high';
          break;
        case 'payment_delay':
          description = 'Payment has been delayed for over two weeks without proper communication.';
          severity = 'medium';
          break;
        case 'discrimination':
          description = 'Experienced discriminatory treatment based on background. Seeking fair resolution.';
          severity = 'high';
          break;
        default:
          description = `Issue related to ${incidentType.replace('_', ' ')}. Requesting assistance and proper resolution.`;
          severity = Math.random() > 0.5 ? 'medium' : 'low';
      }

      const reportData = {
        id: `isange_${Date.now()}_${i}`,
        reporterId: reporter.id,
        reporterName: `${reporter.firstName} ${reporter.lastName}`,
        reporterType: reporter.type,
        reporterEmail: reporter.email,
        incidentType,
        severity,
        title: `${incidentType.replace('_', ' ').toUpperCase()} - ${reporter.type === 'worker' ? 'Worker' : 'Household'} Report`,
        description,
        status,
        priority: severity === 'high' ? 'urgent' : severity === 'medium' ? 'normal' : 'low',
        assignedOfficer: Math.random() > 0.6 ? 'Officer Jean Damascene' : Math.random() > 0.3 ? 'Officer Marie Uwase' : null,
        location: 'Kigali, Rwanda',
        incidentDate: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000), // Last 45 days
        reportedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
        lastUpdated: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000), // Last 15 days
        followUpRequired: severity === 'high' || status === 'under_investigation',
        evidenceSubmitted: Math.random() > 0.4,
        isAnonymous: Math.random() > 0.7,
        supportProvided: status === 'resolved' || status === 'closed',
        resolutionNotes: status === 'resolved' ? 'Issue resolved through mediation and agreement between parties.' : null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await adminDb.collection('isange_reports').add(reportData);
      console.log(`✅ Isange report created: ${incidentType} (${severity} severity, ${status})`);
    }

    console.log('\n📊 Isange Report Statistics:');
    const reportsSnapshot = await adminDb.collection('isange_reports').get();
    const allReports = reportsSnapshot.docs.map(doc => doc.data());

    console.log(`Total reports: ${allReports.length}`);
    
    console.log('\nBy Status:');
    reportStatuses.forEach(status => {
      const count = allReports.filter(report => report.status === status).length;
      console.log(`  ${status}: ${count} reports`);
    });

    console.log('\nBy Severity:');
    ['high', 'medium', 'low'].forEach(severity => {
      const count = allReports.filter(report => report.severity === severity).length;
      console.log(`  ${severity}: ${count} reports`);
    });

    console.log('\nBy Type:');
    incidentTypes.slice(0, 5).forEach(type => {
      const count = allReports.filter(report => report.incidentType === type).length;
      console.log(`  ${type}: ${count} reports`);
    });

  } catch (error) {
    console.error('❌ Error creating Isange reports:', error);
  }
}

createIsangeReports();
