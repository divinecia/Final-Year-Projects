import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { z } from 'zod';

// Schema for notification creation
const CreateNotificationSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(['info', 'warning', 'error', 'success', 'job_application', 'payment', 'booking']).default('info'),
  actionUrl: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Schema for notification query parameters
const NotificationQuerySchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  read: z.enum(['true', 'false']).optional(),
  type: z.string().optional(),
  limit: z.string().transform(val => parseInt(val, 10)).optional(),
  offset: z.string().transform(val => parseInt(val, 10)).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedParams = NotificationQuerySchema.parse(params);
    
    // Build query
    const queryConstraints: import('firebase/firestore').QueryConstraint[] = [
      where('userId', '==', validatedParams.userId),
      orderBy('createdAt', 'desc')
    ];
    
    if (validatedParams.read !== undefined) {
      queryConstraints.push(where('read', '==', validatedParams.read === 'true'));
    }
    
    if (validatedParams.type) {
      queryConstraints.push(where('type', '==', validatedParams.type));
    }
    
    if (validatedParams.limit) {
      queryConstraints.push(limit(validatedParams.limit));
    }
    
    const q = query(collection(db, 'notifications'), ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    const notifications = querySnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    });
    
    return NextResponse.json({
      success: true,
      data: notifications,
      total: notifications.length,
      unreadCount: notifications.filter((n: Record<string, unknown>) => !n.read).length,
      message: 'Notifications retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching notifications:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch notifications'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = CreateNotificationSchema.parse(body);
    
    // Create notification document
    const notificationData = {
      ...validatedData,
      read: false,
      createdAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, 'notifications'), notificationData);
    
    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...notificationData },
      message: 'Notification created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating notification:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid notification data',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create notification'
    }, { status: 500 });
  }
}
