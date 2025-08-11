import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, addDoc, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { z } from 'zod';

// Schema for payment creation
const CreatePaymentSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  householdId: z.string().min(1, "Household ID is required"),
  workerId: z.string().optional(),
  amount: z.number().min(1, "Amount must be greater than 0"),
  method: z.enum(['mobile_money', 'card', 'bank_transfer']),
  phoneNumber: z.string().optional(),
  description: z.string().optional(),
});

// Schema for payment query parameters
const PaymentQuerySchema = z.object({
  householdId: z.string().optional(),
  workerId: z.string().optional(),
  status: z.enum(['pending', 'completed', 'failed', 'cancelled']).optional(),
  method: z.enum(['mobile_money', 'card', 'bank_transfer']).optional(),
  limit: z.string().transform(val => parseInt(val, 10)).default('20'),
  offset: z.string().transform(val => parseInt(val, 10)).default('0'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedParams = PaymentQuerySchema.parse(params);
    
    // Build query
    const queryConstraints: import('firebase/firestore').QueryConstraint[] = [orderBy('createdAt', 'desc')];
    
    if (validatedParams.householdId) {
      queryConstraints.unshift(where('householdId', '==', validatedParams.householdId));
    }
    
    if (validatedParams.workerId) {
      queryConstraints.unshift(where('workerId', '==', validatedParams.workerId));
    }
    
    if (validatedParams.status) {
      queryConstraints.unshift(where('status', '==', validatedParams.status));
    }
    
    if (validatedParams.method) {
      queryConstraints.unshift(where('method', '==', validatedParams.method));
    }
    
    if (validatedParams.limit) {
      queryConstraints.push(limit(validatedParams.limit));
    }
    
    const q = query(collection(db, 'servicePayments'), ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    const payments = await Promise.all(
      querySnapshot.docs.map(async (docSnapshot): Promise<Record<string, unknown>> => {
        const data = docSnapshot.data();
        // Get job details
        let jobDetails = null;
        if (data.jobId) {
          const jobDoc = await getDoc(doc(db, 'jobs', data.jobId));
          if (jobDoc.exists()) {
            const jobData = jobDoc.data();
            jobDetails = {
              id: data.jobId,
              title: jobData.jobTitle || 'N/A',
              serviceType: jobData.serviceType || 'N/A',
            };
          }
        }
        return {
          id: docSnapshot.id,
          ...data,
          jobDetails,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          completedAt: data.completedAt?.toDate?.()?.toISOString() || null,
        };
      })
    );
    
    // Calculate summary statistics
    const totalAmount = payments.reduce((sum, payment) => sum + (typeof payment.amount === 'number' ? payment.amount : 0), 0);
    const completedPayments = payments.filter((p) => p.status === 'completed');
    const pendingPayments = payments.filter((p) => p.status === 'pending');
    
    return NextResponse.json({
      success: true,
      data: payments,
      total: payments.length,
      summary: {
        totalAmount,
        completedCount: completedPayments.length,
        pendingCount: pendingPayments.length,
        completedAmount: completedPayments.reduce((sum: number, p: { amount?: number }) => sum + (p.amount || 0), 0),
      },
      message: 'Payments retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching payments:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch payments'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = CreatePaymentSchema.parse(body);
    
    // Generate transaction ID
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create payment document
    const paymentData = {
      ...validatedData,
      transactionId,
      status: 'pending' as const,
      createdAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, 'servicePayments'), paymentData);
    
    // Process payment based on method
    let processResult = { success: true, message: 'Payment initiated' };
    
    if (validatedData.method === 'mobile_money') {
      // Integrate with mobile money API (e.g., Paypack)
      if (validatedData.phoneNumber) {
        processResult = await processMobileMoneyPayment({
          amount: validatedData.amount,
          phoneNumber: validatedData.phoneNumber,
          provider: 'airtel' // Default provider, could be made configurable
        }, transactionId);
      } else {
        processResult = { success: false, message: 'Phone number required for mobile money payment' };
      }
    } else if (validatedData.method === 'card') {
      // Card payment would need additional fields in a real implementation
      processResult = { success: false, message: 'Card payment not yet implemented' };
    } else if (validatedData.method === 'bank_transfer') {
      // Bank transfer doesn't need additional user input
      processResult = await processBankTransfer({
        amount: validatedData.amount,
        bankAccount: '', // These would be provided by the platform
        routingNumber: ''
      }, transactionId);
    }
    
    // Update payment status based on processing result
    if (!processResult.success) {
      await updateDoc(doc(db, 'servicePayments', docRef.id), {
        status: 'failed',
        failureReason: processResult.message,
        updatedAt: Timestamp.now(),
      });
    }
    
    return NextResponse.json({
      success: processResult.success,
      data: { 
        id: docRef.id, 
        ...paymentData,
        createdAt: paymentData.createdAt.toDate().toISOString(),
      },
      message: processResult.message
    }, { status: processResult.success ? 201 : 400 });
    
  } catch (error) {
    console.error('Error creating payment:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid payment data',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create payment'
    }, { status: 500 });
  }
}

// Helper functions for payment processing
async function processMobileMoneyPayment(paymentData: { amount: number; phoneNumber: string; provider: string }, transactionId: string) {
  try {
    // This would integrate with actual mobile money API
    // For now, simulate successful processing
    return {
      success: true,
      message: 'Mobile money payment initiated successfully',
      paymentUrl: `/payments/mobile-money/${transactionId}`
    };
  } catch {
    return {
      success: false,
      message: 'Failed to process mobile money payment'
    };
  }
}

async function processBankTransfer(paymentData: { amount: number; bankAccount: string; routingNumber: string }, transactionId: string) {
  try {
    // For bank transfers, provide bank details
    return {
      success: true,
      message: 'Bank transfer details provided',
      bankDetails: {
        accountName: 'Househelp Platform Ltd',
        accountNumber: '4001020304050607',
        bankName: 'Bank of Kigali',
        reference: transactionId.slice(-8).toUpperCase(),
      }
    };
  } catch {
    return {
      success: false,
      message: 'Failed to process bank transfer'
    };
  }
}
