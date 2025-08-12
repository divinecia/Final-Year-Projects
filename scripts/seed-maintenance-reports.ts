#!/usr/bin/env tsx

/**
 * Create system maintenance reports for the platform
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

const maintenanceTypes = [
  'server_maintenance',
  'database_optimization',
  'security_update',
  'feature_deployment',
  'bug_fix',
  'performance_optimization',
  'backup_maintenance',
  'system_monitoring',
  'api_enhancement',
  'ui_update'
];

const maintenanceStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];

async function createMaintenanceReports() {
  console.log('🔧 Creating system maintenance reports...\n');

  try {
    // Create 18-20 maintenance reports
    const totalReports = 19;
    
    for (let i = 0; i < totalReports; i++) {
      const maintenanceType = maintenanceTypes[Math.floor(Math.random() * maintenanceTypes.length)];
      const status = maintenanceStatuses[Math.floor(Math.random() * maintenanceStatuses.length)];
      
      // Create realistic maintenance descriptions
      let description = '';
      let impact = 'low';
      let duration = 30; // minutes
      
      switch (maintenanceType) {
        case 'server_maintenance':
          description = 'Scheduled server maintenance to improve system performance and stability.';
          impact = 'high';
          duration = 120;
          break;
        case 'database_optimization':
          description = 'Database indexing and query optimization to enhance application speed.';
          impact = 'medium';
          duration = 90;
          break;
        case 'security_update':
          description = 'Critical security patches and vulnerability fixes implementation.';
          impact = 'high';
          duration = 60;
          break;
        case 'feature_deployment':
          description = 'New feature rollout including enhanced user dashboard and messaging system.';
          impact = 'medium';
          duration = 45;
          break;
        case 'bug_fix':
          description = 'Resolution of reported bugs in payment processing and user authentication.';
          impact = 'low';
          duration = 30;
          break;
        case 'performance_optimization':
          description = 'System performance improvements and resource optimization.';
          impact = 'medium';
          duration = 75;
          break;
        default:
          description = `${maintenanceType.replace('_', ' ')} maintenance to ensure optimal system operation.`;
          impact = Math.random() > 0.5 ? 'medium' : 'low';
          duration = Math.floor(Math.random() * 90) + 30;
      }

      const scheduledDate = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000); // Next 30 days
      const completedDate = status === 'completed' ? 
        new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000) : null; // Last 60 days if completed

      const maintenanceData = {
        id: `maintenance_${Date.now()}_${i}`,
        type: maintenanceType,
        title: `${maintenanceType.replace('_', ' ').toUpperCase()} - ${status.toUpperCase()}`,
        description,
        status,
        priority: impact === 'high' ? 'critical' : impact === 'medium' ? 'normal' : 'low',
        impact,
        estimatedDuration: duration,
        actualDuration: status === 'completed' ? duration + Math.floor(Math.random() * 30) - 15 : null,
        scheduledStartTime: status === 'scheduled' || status === 'completed' ? scheduledDate : null,
        actualStartTime: status === 'in_progress' || status === 'completed' ? 
          new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000) : null, // Last 6 hours
        completedTime: completedDate,
        assignedTeam: Math.random() > 0.5 ? 'DevOps Team' : 'Backend Team',
        technician: Math.random() > 0.6 ? 'Jean Paul Mugabo' : Math.random() > 0.3 ? 'Grace Uwimana' : 'Samuel Nkurunziza',
        affectedServices: (() => {
          const services = ['authentication', 'payments', 'messaging', 'search', 'notifications'];
          const count = Math.floor(Math.random() * 3) + 1;
          return services.sort(() => 0.5 - Math.random()).slice(0, count);
        })(),
        userNotificationSent: status !== 'scheduled',
        rollbackPlan: impact === 'high',
        testingCompleted: status === 'completed',
        approvedBy: impact === 'high' ? 'System Administrator' : null,
        maintenanceWindow: {
          start: '02:00',
          end: '06:00',
          timezone: 'CAT'
        },
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Last 90 days
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        notes: status === 'completed' ? 'Maintenance completed successfully without issues.' : 
               status === 'cancelled' ? 'Maintenance cancelled due to system stability concerns.' : null
      };

      await adminDb.collection('system_maintenance').add(maintenanceData);
      console.log(`✅ Maintenance report created: ${maintenanceType} (${impact} impact, ${status})`);
    }

    console.log('\n📊 System Maintenance Statistics:');
    const maintenanceSnapshot = await adminDb.collection('system_maintenance').get();
    const allMaintenance = maintenanceSnapshot.docs.map(doc => doc.data());

    console.log(`Total maintenance reports: ${allMaintenance.length}`);
    
    console.log('\nBy Status:');
    maintenanceStatuses.forEach(status => {
      const count = allMaintenance.filter(m => m.status === status).length;
      console.log(`  ${status}: ${count} reports`);
    });

    console.log('\nBy Impact:');
    ['high', 'medium', 'low'].forEach(impact => {
      const count = allMaintenance.filter(m => m.impact === impact).length;
      console.log(`  ${impact} impact: ${count} reports`);
    });

    const completedMaintenance = allMaintenance.filter(m => m.status === 'completed');
    if (completedMaintenance.length > 0) {
      const avgDuration = completedMaintenance.reduce((sum, m) => sum + (m.actualDuration || 0), 0) / completedMaintenance.length;
      console.log(`\nAverage completion time: ${Math.round(avgDuration)} minutes`);
    }

  } catch (error) {
    console.error('❌ Error creating maintenance reports:', error);
  }
}

createMaintenanceReports();
