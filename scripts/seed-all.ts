import * as admin from 'firebase-admin';

async function generateSystemSummary() {
  try {
    // Initialize Firebase if not already done
    if (!admin.apps.length) {
 admin.initializeApp();
    }

    const db = admin.firestore();
    
    console.log('🏠 HOUSEHELP PLATFORM - COMPREHENSIVE SYSTEM SUMMARY');
    console.log('=' .repeat(70));
    console.log('\n📊 PLATFORM DATA OVERVIEW:');
    console.log('-' .repeat(40));
    
    // Count documents in each collection
    const collections = [
      { name: 'admin', label: 'Admin Users' },
      { name: 'households', label: 'Household Users' }, 
      { name: 'workers', label: 'Service Workers' },
      { name: 'jobs', label: 'Job Postings' },
      { name: 'applications', label: 'Job Applications' },
      { name: 'notifications', label: 'System Notifications' },
      { name: 'reviews', label: 'Reviews & Ratings' },
      { name: 'isange_reports', label: 'Isange Reports' },
      { name: 'system_maintenance', label: 'Maintenance Reports' },
      { name: 'urgent_services', label: 'Urgent Services' },
      { name: 'payments', label: 'Payment Transactions' },
      { name: 'servicePayments', label: 'Service Payments' },
      { name: 'trainingPayments', label: 'Training Payments' },
      { name: 'conversations', label: 'Chat Conversations' },
      { name: 'messages', label: 'Chat Messages' },
      { name: 'worker_tracking', label: 'Worker Tracking' },
      { name: 'worker_training', label: 'Training Records' }
    ];
    
    const stats: { [key: string]: number } = {};
    let totalDocuments = 0;
    
    for (const { name, label } of collections) {
      try {
        if (name === 'messages') {
          // Count messages across all conversations (subcollections)
          let messageCount = 0;
          const conversationsSnapshot = await db.collection('conversations').get();
          for (const conversationDoc of conversationsSnapshot.docs) {
            const messagesSnapshot = await conversationDoc.ref.collection('messages').get();
            messageCount += messagesSnapshot.size;
          }
          stats[name] = messageCount;
          totalDocuments += messageCount;
          console.log(`   • ${label}: ${messageCount}`);
        } else {
          const snapshot = await db.collection(name).get();
          stats[name] = snapshot.size;
          totalDocuments += snapshot.size;
          console.log(`   • ${label}: ${snapshot.size}`);
        }
      } catch {
        stats[name] = 0;
        console.log(`   • ${label}: 0 (collection not found)`);
      }
    }
    
    console.log('\n🎯 FEATURE COMPLETENESS:');
    console.log('-' .repeat(40));
    
    // Feature status based on data availability
    const features = [
      { name: 'User Management System', check: (stats.admin || 0) > 0 && (stats.households || 0) > 0 },
      { name: 'Job Management System', check: (stats.jobs || 0) > 0 && (stats.applications || 0) > 0 },
      { name: 'Booking/Appointment System', check: (stats.jobs || 0) > 0 },
      { name: 'Analytics & Reporting System', check: (stats.servicePayments || 0) > 0 || (stats.payments || 0) > 0 },
      { name: 'Notification System', check: (stats.notifications || 0) > 0 },
      { name: 'Service Quality Tracking', check: (stats.reviews || 0) > 0 },
      { name: 'Worker Training System', check: (stats.worker_training || 0) > 0 },
      { name: 'Isange Reporting System', check: (stats.isange_reports || 0) > 0 },
      { name: 'System Maintenance Tracking', check: (stats.system_maintenance || 0) > 0 },
      { name: 'Emergency Services', check: (stats.urgent_services || 0) > 0 },
      { name: 'Payment Processing', check: (stats.payments || 0) > 0 },
      { name: 'Real-time Communication', check: (stats.conversations || 0) > 0 && (stats.messages || 0) > 0 },
      { name: 'Worker Location Tracking', check: (stats.worker_tracking || 0) > 0 }
    ];
    
    features.forEach(({ name, check }) => {
      const status = check ? '✅ OPERATIONAL' : '❌ NOT CONFIGURED';
      console.log(`   ${name}: ${status}`);
    });
    
    const operationalFeatures = features.filter(f => f.check).length;
    const completionPercentage = Math.round((operationalFeatures / features.length) * 100);
    
    console.log('\n📈 PLATFORM STATISTICS:');
    console.log('-' .repeat(40));
    console.log(`   • Total Database Documents: ${totalDocuments.toLocaleString()}`);
    console.log(`   • Active Collections: ${collections.length}`);
    console.log(`   • Operational Features: ${operationalFeatures}/${features.length}`);
    console.log(`   • Platform Completion: ${completionPercentage}%`);
    
    if (completionPercentage === 100) {
      console.log('\n🚀 PLATFORM STATUS: FULLY OPERATIONAL!');
      console.log('   All critical business features are loaded with realistic data.');
      console.log('   The HouseHelp platform is ready for comprehensive testing.');
    } else if (completionPercentage >= 75) {
      console.log('\n⚠️  PLATFORM STATUS: MOSTLY OPERATIONAL');
      console.log('   Most features are ready. Some areas need additional data.');
    } else {
      console.log('\n🔧 PLATFORM STATUS: IN DEVELOPMENT');
      console.log('   Platform needs more data population to be fully functional.');
    }
    
    console.log('\n🔍 QUICK ACCESS SUMMARY:');
    console.log('-' .repeat(40));
    console.log(`   • Ready for user management testing: ${(stats.admin || 0) > 0 && (stats.households || 0) > 0 ? 'YES' : 'NO'}`);
    console.log(`   • Ready for job management testing: ${(stats.jobs || 0) > 0 && (stats.applications || 0) > 0 ? 'YES' : 'NO'}`);
    console.log(`   • Ready for booking/appointment testing: ${(stats.jobs || 0) > 0 ? 'YES' : 'NO'}`);
    console.log(`   • Ready for analytics & reporting testing: ${(stats.servicePayments || 0) > 0 || (stats.payments || 0) > 0 ? 'YES' : 'NO'}`);
    console.log(`   • Ready for notification system testing: ${(stats.notifications || 0) > 0 ? 'YES' : 'NO'}`);
    console.log(`   • Ready for service quality testing: ${(stats.reviews || 0) > 0 ? 'YES' : 'NO'}`);
    console.log(`   • Ready for emergency services testing: ${(stats.urgent_services || 0) > 0 ? 'YES' : 'NO'}`);
    console.log(`   • Ready for payment system testing: ${(stats.payments || 0) > 0 ? 'YES' : 'NO'}`);
    console.log(`   • Ready for communication testing: ${(stats.messages || 0) > 0 ? 'YES' : 'NO'}`);
    console.log(`   • Ready for tracking system testing: ${(stats.worker_tracking || 0) > 0 ? 'YES' : 'NO'}`);
    
    console.log('\n' + '=' .repeat(70));
    
  } catch (error) {
    console.error('❌ Error generating system summary:', error);
  }
}

// Run the system summary
generateSystemSummary().catch((error) => {
  console.error('❌ System summary failed:', error);
  process.exit(1);
});