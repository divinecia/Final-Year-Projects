import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, writeBatch, query, collection, where, getDocs } from 'firebase/firestore';
import { z } from 'zod';

// Schema for marking notifications as read
const MarkReadSchema = z.object({
  notificationIds: z.array(z.string()).optional(),
  markAllAsRead: z.boolean().optional(),
  userId: z.string().min(1, "User ID is required when marking all as read").optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const { notificationId } = await params;
    
    if (!notificationId) {
      return NextResponse.json({
        success: false,
        error: 'Notification ID is required'
      }, { status: 400 });
    }
    
    const notificationRef = doc(db, 'notifications', notificationId);
    const notificationSnap = await getDoc(notificationRef);
    
    if (!notificationSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Notification not found'
      }, { status: 404 });
    }
    
    // Mark notification as read
    await updateDoc(notificationRef, {
      read: true,
      readAt: new Date(),
    });
    
    return NextResponse.json({
      success: true,
      message: 'Notification marked as read'
    });
    
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to mark notification as read'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = MarkReadSchema.parse(body);
    
    if (validatedData.markAllAsRead && validatedData.userId) {
      // Mark all notifications as read for the user
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', validatedData.userId),
        where('read', '==', false)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const batch = writeBatch(db);
        querySnapshot.docs.forEach(doc => {
          batch.update(doc.ref, {
            read: true,
            readAt: new Date(),
          });
        });
        await batch.commit();
      }
      
      return NextResponse.json({
        success: true,
        message: `Marked ${querySnapshot.size} notifications as read`
      });
      
    } else if (validatedData.notificationIds && validatedData.notificationIds.length > 0) {
      // Mark specific notifications as read
      const batch = writeBatch(db);
      
      for (const notificationId of validatedData.notificationIds) {
        const notificationRef = doc(db, 'notifications', notificationId);
        batch.update(notificationRef, {
          read: true,
          readAt: new Date(),
        });
      }
      
      await batch.commit();
      
      return NextResponse.json({
        success: true,
        message: `Marked ${validatedData.notificationIds.length} notifications as read`
      });
      
    } else {
      return NextResponse.json({
        success: false,
        error: 'Either provide notification IDs or set markAllAsRead with userId'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to mark notifications as read'
    }, { status: 500 });
  }
}
