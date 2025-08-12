#!/usr/bin/env tsx

/**
 * Create payment transactions for the platform
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

const paymentMethods = ['mobile_money', 'bank_transfer', 'cash', 'credit_card'];
const paymentStatuses = ['pending', 'processing', 'completed', 'failed', 'refunded'];
const mobileProviders = ['MTN', 'Airtel', 'Tigo'];

async function createPayments() {
  console.log('💰 Creating payment transactions...\n');

  try {
    // Get households and workers for realistic transactions
    const householdsSnapshot = await adminDb.collection('households').get();
    const workersSnapshot = await adminDb.collection('workers').get();

    if (householdsSnapshot.empty || workersSnapshot.empty) {
      console.log('❌ No households or workers found. Please seed them first.');
      return;
    }

    const households = householdsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
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
      email: string;
      phone: string;
      services?: string[];
      [key: string]: unknown;
    }>;

    // Create 35-40 payment transactions
    const totalPayments = 38;
    
    for (let i = 0; i < totalPayments; i++) {
      const household = households[Math.floor(Math.random() * households.length)];
      const worker = workers[Math.floor(Math.random() * workers.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const status = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      
      // Generate realistic payment amounts (in RWF)
      const baseAmount = Math.floor(Math.random() * 80000) + 20000; // 20,000 - 100,000 RWF
      const platformFee = Math.round(baseAmount * 0.05); // 5% platform fee
      const processingFee = paymentMethod === 'mobile_money' ? Math.round(baseAmount * 0.02) : 
                           paymentMethod === 'credit_card' ? Math.round(baseAmount * 0.03) : 0;
      
      const workerAmount = baseAmount - platformFee - processingFee;
      const totalAmount = baseAmount + processingFee;

      // Service type
      const serviceType = worker.services?.[Math.floor(Math.random() * (worker.services?.length || 1))] || 'cleaning';
      
      // Generate transaction dates
      const createdDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000); // Last 60 days
      const processedDate = status !== 'pending' ? 
        new Date(createdDate.getTime() + Math.random() * 24 * 60 * 60 * 1000) : null;
      const completedDate = status === 'completed' ? 
        new Date((processedDate?.getTime() || createdDate.getTime()) + Math.random() * 6 * 60 * 60 * 1000) : null;

      const paymentData = {
        id: `pay_${Date.now()}_${i}`,
        transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        
        // Parties
        payerId: household.id,
        payerName: `${household.firstName} ${household.lastName}`,
        payerEmail: household.email,
        payerPhone: household.phone,
        recipientId: worker.id,
        recipientName: `${worker.firstName} ${worker.lastName}`,
        recipientEmail: worker.email,
        recipientPhone: worker.phone,
        
        // Payment details
        paymentMethod,
        mobileProvider: paymentMethod === 'mobile_money' ? 
          mobileProviders[Math.floor(Math.random() * mobileProviders.length)] : null,
        status,
        serviceType,
        description: `Payment for ${serviceType} services`,
        
        // Amounts
        baseAmount,
        platformFee,
        processingFee,
        workerAmount,
        totalAmount,
        currency: 'RWF',
        
        // Timing
        createdAt: createdDate,
        processedAt: processedDate,
        completedAt: completedDate,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        
        // Additional details
        jobDuration: Math.floor(Math.random() * 6) + 2, // 2-8 hours
        hourlyRate: Math.round(baseAmount / (Math.floor(Math.random() * 6) + 2)),
        paymentReference: `REF${Math.floor(Math.random() * 900000) + 100000}`,
        
        // Status tracking
        isRefundable: status === 'completed' && Math.random() > 0.8,
        refundAmount: status === 'refunded' ? Math.round(baseAmount * 0.9) : 0, // 10% processing fee for refunds
        refundReason: status === 'refunded' ? 'Service cancelled by household' : null,
        
        // Verification
        requiresVerification: totalAmount > 150000, // Large payments need verification
        isVerified: status === 'completed',
        verifiedBy: status === 'completed' && totalAmount > 150000 ? 'Payment Team' : null,
        
        // Dispute handling
        isDisputed: status === 'failed' && Math.random() > 0.7,
        disputeReason: status === 'failed' && Math.random() > 0.7 ? 'Service quality issue' : null,
        disputeStatus: status === 'failed' && Math.random() > 0.7 ? 'under_review' : null,
        
        // Receipt
        receiptGenerated: status === 'completed',
        receiptUrl: status === 'completed' ? `https://receipts.househelp.rw/${Date.now()}.pdf` : null,
        
        // Integration details
        externalTransactionId: paymentMethod === 'mobile_money' ? 
          `MM${Math.floor(Math.random() * 9000000000) + 1000000000}` : null,
        gatewayResponse: status === 'failed' ? 'Insufficient funds' : 
                        status === 'completed' ? 'Payment successful' : null,
        
        // Metadata
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        userAgent: 'HouseHelp Mobile App v1.2.0',
        location: 'Kigali, Rwanda',
        
        // Rating (for completed payments)
        serviceRating: status === 'completed' ? Math.floor(Math.random() * 2) + 4 : null, // 4-5 stars
        paymentExperience: status === 'completed' ? 
          Math.random() > 0.2 ? 'smooth' : 'had_issues' : null
      };

      await adminDb.collection('payments').add(paymentData);
      console.log(`✅ Payment created: ${household.firstName} → ${worker.firstName} (${totalAmount.toLocaleString()} RWF, ${status})`);
    }

    console.log('\n📊 Payment Statistics:');
    const paymentsSnapshot = await adminDb.collection('payments').get();
    const allPayments = paymentsSnapshot.docs.map(doc => doc.data());

    console.log(`Total payments: ${allPayments.length}`);
    
    // Total transaction volume
    const totalVolume = allPayments.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    console.log(`Total transaction volume: ${totalVolume.toLocaleString()} RWF`);
    
    // Revenue (platform fees)
    const totalRevenue = allPayments.reduce((sum, p) => sum + (p.platformFee || 0), 0);
    console.log(`Platform revenue: ${totalRevenue.toLocaleString()} RWF`);

    console.log('\nBy Status:');
    paymentStatuses.forEach(status => {
      const count = allPayments.filter(p => p.status === status).length;
      const volume = allPayments.filter(p => p.status === status)
        .reduce((sum, p) => sum + (p.totalAmount || 0), 0);
      console.log(`  ${status}: ${count} payments (${volume.toLocaleString()} RWF)`);
    });

    console.log('\nBy Payment Method:');
    paymentMethods.forEach(method => {
      const count = allPayments.filter(p => p.paymentMethod === method).length;
      console.log(`  ${method}: ${count} payments`);
    });

    const completedPayments = allPayments.filter(p => p.status === 'completed');
    if (completedPayments.length > 0) {
      const avgPayment = completedPayments.reduce((sum, p) => sum + (p.totalAmount || 0), 0) / completedPayments.length;
      console.log(`\nAverage completed payment: ${Math.round(avgPayment).toLocaleString()} RWF`);
    }

  } catch (error) {
    console.error('❌ Error creating payments:', error);
  }
}

createPayments();
