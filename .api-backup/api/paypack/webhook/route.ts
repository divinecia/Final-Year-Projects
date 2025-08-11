
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, updateDoc, doc, addDoc, Timestamp, getDoc } from 'firebase/firestore';

// Helper function to create a notification
async function createNotification(userId: string, title: string, description: string) {
    try {
        await addDoc(collection(db, 'notifications'), {
            userId,
            title,
            description,
            createdAt: Timestamp.now(),
            read: false,
        });
    } catch (error) {
        console.error("Error creating notification from webhook: ", error);
    }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("Received Paypack webhook:", data);

    const { transactionId, status, amount } = data;

    if (!transactionId || !status) {
      return NextResponse.json({ error: 'Missing transactionId or status' }, { status: 400 });
    }

    const paymentRef = doc(db, 'servicePayments', transactionId);
    const paymentSnap = await getDoc(paymentRef);
    
    if (!paymentSnap.exists()) {
        return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }
    const paymentData = paymentSnap.data();

    let newStatus: 'completed' | 'failed' | 'pending' = 'pending';
    if (status.toLowerCase() === 'successful') {
        newStatus = 'completed';
    } else if (['failed', 'cancelled', 'expired'].includes(status.toLowerCase())) {
        newStatus = 'failed';
    }

    await updateDoc(paymentRef, {
        status: newStatus,
    });

    // If payment was successful, notify the worker
    if (newStatus === 'completed' && paymentData.workerId) {
        await createNotification(
            paymentData.workerId,
            "Payment Received",
            `You have received a payment of ${amount} RWF from ${paymentData.householdName}.`
        );
    }

    console.log(`Updated payment ${transactionId} to status: ${newStatus}`);

    return NextResponse.json({ message: 'Webhook received successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
