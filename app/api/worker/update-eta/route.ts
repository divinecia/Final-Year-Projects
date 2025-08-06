import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, addDoc, collection, Timestamp, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { jobId, workerId, eta, currentLocation } = await request.json();
    
    if (!jobId || !workerId || !eta) {
      return NextResponse.json({
        success: false,
        error: 'Job ID, Worker ID, and ETA are required'
      }, { status: 400 });
    }

    // Update job with new ETA
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
      estimatedArrival: eta,
      currentLocation: currentLocation || null,
      status: 'on_way',
      updatedAt: Timestamp.now(),
    });

    // Create notification for household
    const etaDate = new Date(eta);
    const etaTime = etaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    await addDoc(collection(db, 'notifications'), {
      userId: jobData.householdId,
      title: 'Worker ETA Updated',
      description: `${jobData.workerName} will arrive at approximately ${etaTime}.`,
      type: 'info',
      read: false,
      createdAt: Timestamp.now(),
      metadata: {
        jobId: jobId,
        workerId: workerId,
        eta: eta,
        currentLocation: currentLocation,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'ETA updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating ETA:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update ETA'
    }, { status: 500 });
  }
}