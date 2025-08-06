import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const reportData = await request.json();
    
    // Save maintenance request to admin queue
    await addDoc(collection(db, 'maintenanceRequests'), {
      ...reportData,
      type: 'maintenance',
      priority: reportData.urgency || 'medium',
      status: 'open',
      assignedTo: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Create notification for admin
    await addDoc(collection(db, 'notifications'), {
      userId: 'admin', // This should be actual admin user ID
      title: 'New Maintenance Request',
      description: `System maintenance request: ${reportData.notificationTitle}`,
      type: 'maintenance',
      read: false,
      createdAt: Timestamp.now(),
      metadata: {
        reportId: reportData.id,
        urgency: reportData.urgency,
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Maintenance request sent to admin team.' 
    });
    
  } catch (error) {
    console.error('Error sending maintenance request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send maintenance request' },
      { status: 500 }
    );
  }
}