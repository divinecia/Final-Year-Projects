import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, Timestamp, addDoc, collection, deleteDoc } from 'firebase/firestore';
import { z } from 'zod';

// Schema for user status update
const UpdateUserStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended']),
  reason: z.string().optional(),
  userType: z.enum(['worker', 'household', 'admin']),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('type') || 'worker';
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }
    
    // Determine collection name
    const collectionName = userType === 'admin' ? 'admin' : userType;
    
    const userRef = doc(db, collectionName, userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }
    
    const userData = userSnap.data();
    const user = {
      id: userSnap.id,
      userType: userType,
      ...userData,
      createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: userData.updatedAt?.toDate?.()?.toISOString() || null,
      lastActive: userData.lastActive?.toDate?.()?.toISOString() || null,
    };
    
    return NextResponse.json({
      success: true,
      data: user,
      message: 'User retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }
    
    // Validate request body
    const validatedData = UpdateUserStatusSchema.parse(body);
    
    // Determine collection name
    const collectionName = validatedData.userType === 'admin' ? 'admin' : validatedData.userType;
    
    const userRef = doc(db, collectionName, userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }
    
    const currentData = userSnap.data();
    
    // Update user status
    const updateData: { [key: string]: string | Timestamp } = {
      status: validatedData.status,
      updatedAt: Timestamp.now(),
    };
    
    // Add status change log
    if (validatedData.reason) {
      updateData.statusChangeReason = validatedData.reason;
      updateData.statusChangedAt = Timestamp.now();
    }
    
    await updateDoc(userRef, updateData);
    
    // Create audit log
    await addDoc(collection(db, 'adminLogs'), {
      action: 'user_status_change',
      targetUserId: userId,
      targetUserType: validatedData.userType,
      oldStatus: currentData.status || 'active',
      newStatus: validatedData.status,
      reason: validatedData.reason || '',
      timestamp: Timestamp.now(),
      // Note: In a real app, you'd get the admin ID from authentication
      adminId: 'system',
    });
    
    // Create notification for the user (if not suspended)
    if (validatedData.status !== 'suspended') {
      await addDoc(collection(db, 'notifications'), {
        userId: userId,
        title: 'Account Status Updated',
        description: `Your account status has been changed to: ${validatedData.status}`,
        type: 'info',
        read: false,
        createdAt: Timestamp.now(),
      });
    }
    
    // Get updated user data
    const updatedUserSnap = await getDoc(userRef);
    const updatedData = updatedUserSnap.data();
    
    return NextResponse.json({
      success: true,
      data: {
        id: userId,
        userType: validatedData.userType,
        ...updatedData,
        createdAt: updatedData?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: updatedData?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      },
      message: 'User status updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update user'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('type') || 'worker';

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Determine collection name
    const collectionName = userType === 'admin' ? 'admin' : userType;

    const userRef = doc(db, collectionName, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    await deleteDoc(userRef);

    // Create audit log
    await addDoc(collection(db, 'adminLogs'), {
      action: 'user_deleted',
      targetUserId: userId,
      targetUserType: userType,
      timestamp: Timestamp.now(),
      adminId: 'system', // In real app, get admin ID from auth
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete user'
    }, { status: 500 });
  }
}
