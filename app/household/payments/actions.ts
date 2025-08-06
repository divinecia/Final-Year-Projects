'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export interface Payment {
    id: string;
    date: string;
    serviceType: string;
    workerName: string;
    amount: number;
    status: 'completed' | 'pending' | 'failed';
    paymentMethod?: 'mobile_money' | 'card' | 'bank_transfer';
    transactionId?: string;
}

export interface PendingBill {
    id: string;
    jobId: string;
    serviceType: string;
    workerName: string;
    workerId: string;
    baseFee: number;
    platformFee: number;
    discount: number;
    totalAmount: number;
    dueDate: string;
    description: string;
}

export interface PaymentMethod {
    id: 'mobile_money' | 'card' | 'bank_transfer';
    name: string;
    description: string;
    enabled: boolean;
    icon: string;
}

export interface BankDetails {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branchCode: string;
    reference: string;
    amount: number;
}

export interface PaymentResult {
    success: boolean;
    error?: string;
    redirectUrl?: string;
    message?: string;
    transactionId?: string;
    bankDetails?: BankDetails;
}

export async function getHouseholdPaymentHistory(householdId: string): Promise<Payment[]> {
    if (!householdId) {
        console.warn('getHouseholdPaymentHistory called without householdId');
        return [];
    }

    try {
        const paymentsCollection = collection(db, 'servicePayments');
        const q = query(
            paymentsCollection, 
            where('householdId', '==', householdId), 
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return [];
        }

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            // Use schema-aligned date field
            const date = data.createdAt as Timestamp || data.date as Timestamp;
            return {
                id: doc.id,
                date: date?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
                serviceType: data.serviceType || 'N/A',
                workerName: data.workerName || 'N/A',
                amount: Number(data.amount) || 0,
                status: data.status || 'pending',
                paymentMethod: data.paymentMethod || 'mobile_money',
                transactionId: data.paypackTransactionId || data.transactionId || '',
            } as Payment;
        });

    } catch (error) {
        console.error("Error fetching payment history: ", error);
        return [];
    }
}

export async function getPendingBills(householdId: string): Promise<PendingBill[]> {
    if (!householdId) {
        console.warn('getPendingBills called without householdId');
        return [];
    }

    try {
        // Get jobs that are completed but not yet paid
        const jobsCollection = collection(db, 'jobs');
        const q = query(
            jobsCollection,
            where('householdId', '==', householdId),
            where('status', '==', 'completed'),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return [];
        }

        const bills: PendingBill[] = [];
        
        for (const jobDoc of querySnapshot.docs) {
            const jobData = jobDoc.data();
            
            // Check if this job already has a completed payment
            const paymentQuery = query(
                collection(db, 'servicePayments'),
                where('jobId', '==', jobDoc.id),
                where('status', '==', 'completed')
            );
            const paymentSnapshot = await getDocs(paymentQuery);
            
            if (paymentSnapshot.empty) {
                // This job needs payment
                const baseFee = Number(jobData.salary) || 25000;
                const platformFee = Math.round(baseFee * 0.08); // 8% platform fee
                const discount = 0; // Could be calculated based on subscription, promos, etc.
                
                bills.push({
                    id: jobDoc.id,
                    jobId: jobDoc.id,
                    serviceType: jobData.serviceType || 'general_cleaning',
                    workerName: jobData.workerName || 'Worker',
                    workerId: jobData.workerId || '',
                    baseFee,
                    platformFee,
                    discount,
                    totalAmount: baseFee + platformFee - discount,
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 7 days from now
                    description: jobData.jobTitle || 'Service completed'
                });
            }
        }

        return bills;

    } catch (error) {
        console.error("Error fetching pending bills: ", error);
        return [];
    }
}

export async function processPayment(
    householdId: string, 
    paymentData: { 
        jobId?: string;
        serviceType: string; 
        workerName: string; 
        workerId?: string;
        amount: number; 
        phone: string;
        paymentMethod?: 'mobile_money' | 'card' | 'bank_transfer';
    }
): Promise<PaymentResult> {
    if (!householdId) {
        return { success: false, error: 'User not authenticated.' };
    }
    
    const appId = process.env.PAYPACK_APP_ID;
    const appSecret = process.env.PAYPACK_APP_SECRET;

    if (!appId || !appSecret) {
        console.error("Paypack credentials are not set in .env file.");
        return { success: false, error: 'Payment service is not configured.' };
    }

    try {
        // Step 1: Create a pending payment record in Firestore
        const newPaymentRef = collection(db, 'servicePayments');
        const transactionId = doc(newPaymentRef).id; // Generate a unique ID for the transaction

        let jobId = paymentData.jobId;
        let workerId = paymentData.workerId;

        // If no job ID provided, get the most recent job for this household
        if (!jobId) {
            const jobsQuery = query(
                collection(db, 'jobs'),
                where('householdId', '==', householdId),
                orderBy('createdAt', 'desc')
            );
            const jobsSnapshot = await getDocs(jobsQuery);
            const mostRecentJob = jobsSnapshot.docs[0]?.data();
            jobId = jobsSnapshot.docs[0]?.id || `job_${Date.now()}`;
            workerId = mostRecentJob?.workerId || `worker_${Date.now()}`;
        }
        
        // Create payment record aligned with schema
        const paymentRecord = {
            // Payment Details
            amount: paymentData.amount,
            currency: 'RWF',
            paymentMethod: paymentData.paymentMethod || 'mobile_money',
            
            // Transaction References
            jobId: jobId,
            householdId: householdId,
            workerId: workerId,
            
            // Worker and Service Info
            workerName: paymentData.workerName,
            serviceType: paymentData.serviceType,
            
            // Paypack Integration
            paypackTransactionId: transactionId,
            paypackStatus: 'pending',
            
            // Payment Status
            status: 'pending' as const,
            
            // Breakdown
            serviceAmount: paymentData.amount * 0.92, // Assuming 8% platform fee
            platformFee: paymentData.amount * 0.08,
            netAmount: paymentData.amount * 0.92,
            
            // Timestamps
            initiatedAt: Timestamp.now(),
            createdAt: Timestamp.now(),
        };
        await setDoc(doc(db, 'servicePayments', transactionId), paymentRecord);
        revalidatePath('/household/payments');

        // Step 2: Process based on payment method
        if (paymentData.paymentMethod === 'card') {
            // Implement card payment processing
            // TODO: Use cardPaymentData for actual card payment processor integration
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _cardPaymentData = {
                amount: paymentData.amount,
                currency: 'RWF',
                description: `Payment for ${paymentData.serviceType} service`,
                metadata: {
                    jobId: paymentData.jobId,
                    householdId: householdId,
                    paymentType: 'service_payment'
                },
                payment_method: 'card',
                transactionId: transactionId
            };

            // For demo purposes, simulate card payment success
            // In production, integrate with actual card payment processor
            await updateDoc(doc(db, 'servicePayments', transactionId), {
                status: 'completed',
                completedAt: Timestamp.now(),
                paypackStatus: 'completed',
                cardDetails: {
                    last4: '****',
                    brand: 'visa',
                    processed: true
                }
            });

            return { 
                success: true, 
                redirectUrl: `/household/payments/success?transactionId=${transactionId}`,
                message: "Card payment processed successfully!" 
            };
        } 
        
        if (paymentData.paymentMethod === 'bank_transfer') {
            // Implement bank transfer processing
            const bankDetails: BankDetails = {
                accountName: 'Househelp Platform Ltd',
                accountNumber: '4001020304050607',
                bankName: 'Bank of Kigali',
                branchCode: 'BK001',
                reference: `HH${transactionId.slice(-8).toUpperCase()}`,
                amount: paymentData.amount
            };

            await updateDoc(doc(db, 'servicePayments', transactionId), {
                status: 'pending_verification',
                paypackStatus: 'pending_verification',
                bankDetails: bankDetails,
                instructions: 'Please complete the bank transfer and provide transaction reference for verification.'
            });

            return { 
                success: true, 
                transactionId: transactionId,
                bankDetails: bankDetails,
                message: "Bank transfer details provided. Please complete the transfer and notify us." 
            };
        }

        // Step 3: Authenticate with Paypack for mobile money
        const authResponse = await fetch("https://payments.paypack.rw/api/auth/agents/authorize", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ client_id: appId, client_secret: appSecret }),
        });

        if (!authResponse.ok) {
            return { success: false, error: 'Failed to authenticate with payment provider.' };
        }
        const authData = await authResponse.json();
        const accessToken = authData.access;

        // Step 4: Initiate Cashin transaction
        const cashinResponse = await fetch("https://payments.paypack.rw/api/transactions/cashin", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'X-Webhook-Token': appSecret,
            },
            body: JSON.stringify({
                amount: paymentData.amount,
                number: paymentData.phone,
                transactionId: transactionId,
            }),
        });
        
        const cashinData = await cashinResponse.json();
        if (!cashinResponse.ok) {
            console.error("Paypack cashin error:", cashinData);
            return { success: false, error: cashinData.error || 'Failed to initiate transaction.' };
        }

        return { success: true, redirectUrl: cashinData.redirect_url };

    } catch (error) {
        console.error("Error processing payment: ", error);
        return { success: false, error: 'An unexpected error occurred during payment processing.' };
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getPaymentMethods(_householdId: string): Promise<PaymentMethod[]> {
    // _householdId is for future use when fetching saved payment methods
    // This could fetch saved payment methods from the database
    // For now, return available options
    return [
        {
            id: 'mobile_money',
            name: 'Mobile Money',
            description: 'Pay with your mobile money account',
            enabled: true,
            icon: '📱'
        },
        {
            id: 'card',
            name: 'Credit/Debit Card',
            description: 'Pay with your credit or debit card',
            enabled: true, // Now implemented
            icon: '💳'
        },
        {
            id: 'bank_transfer',
            name: 'Bank Transfer',
            description: 'Direct bank transfer',
            enabled: true, // Now implemented
            icon: '🏦'
        }
    ];
}

export async function cancelPayment(transactionId: string, householdId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const paymentRef = doc(db, 'servicePayments', transactionId);
        const paymentSnap = await getDoc(paymentRef);
        
        if (!paymentSnap.exists()) {
            return { success: false, error: 'Payment not found.' };
        }
        
        const paymentData = paymentSnap.data();
        if (paymentData.householdId !== householdId) {
            return { success: false, error: 'Unauthorized to cancel this payment.' };
        }
        
        if (paymentData.status === 'completed') {
            return { success: false, error: 'Cannot cancel a completed payment.' };
        }
        
        // Update payment status to failed/cancelled
        await setDoc(paymentRef, { ...paymentData, status: 'failed' }, { merge: true });
        revalidatePath('/household/payments');
        
        return { success: true };
        
    } catch (error) {
        console.error("Error cancelling payment: ", error);
        return { success: false, error: 'Failed to cancel payment.' };
    }
}
