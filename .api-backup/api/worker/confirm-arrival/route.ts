import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, addDoc, collection, Timestamp, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { jobId, workerId, location } = await request.json();
    
    if (!jobId || !workerId) {
      return NextResponse.json({
        success: false,
        error: 'Job ID and Worker ID are required'
      }, { status: 400 });
    }

    // Update job status to 'arrived'
    const jobRef = doc(db, 'jobs', jobId);
    const jobSnap = await getDoc(jobRef);
    
    if (!jobSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Job not found'
      }, { status: 404 });
    }

    const jobData = jobSnap.data();
    
    await updateDoc(jobRef, {
      status: 'arrived',
      arrivedAt: Timestamp.now(),
      workerLocation: location || null,
      updatedAt: Timestamp.now(),
    });

    // Create notification for household
    await addDoc(collection(db, 'notifications'), {
      userId: jobData.householdId,
      title: 'Worker Has Arrived',
      description: `${jobData.workerName} has arrived for your ${jobData.jobTitle} appointment.`,
      type: 'info',
      read: false,
      createdAt: Timestamp.now(),
      metadata: {
        jobId: jobId,
        workerId: workerId,
        arrivedAt: Timestamp.now(),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Arrival confirmed successfully'
    });
    
  } catch (error) {
    console.error('Error confirming arrival:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to confirm arrival'
    }, { status: 500 });
  }
}