import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { z } from 'zod';

// Schema for job updates
const UpdateJobSchema = z.object({
  jobTitle: z.string().min(5).optional(),
  serviceType: z.string().min(1).optional(),
  jobDescription: z.string().min(20).optional(),
  schedule: z.string().min(5).optional(),
  salary: z.number().min(1).optional(),
  payFrequency: z.string().min(1).optional(),
  status: z.enum(['open', 'assigned', 'in_progress', 'completed', 'cancelled']).optional(),
  workerId: z.string().optional(),
  workerName: z.string().optional(),
  benefits: z.object({
    accommodation: z.boolean(),
    meals: z.boolean(),
    transportation: z.boolean(),
  }).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    
    if (!jobId) {
      return NextResponse.json({
        success: false,
        error: 'Job ID is required'
      }, { status: 400 });
    }
    
    const jobRef = doc(db, 'jobs', jobId);
    const jobSnap = await getDoc(jobRef);
    
    if (!jobSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Job not found'
      }, { status: 404 });
    }
    
    const data = jobSnap.data();
    const job = {
      id: jobSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
    };
    
    // Increment view count
    await updateDoc(jobRef, {
      viewCount: (data.viewCount || 0) + 1,
    });
    
    return NextResponse.json({
      success: true,
      data: job,
      message: 'Job retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch job'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const body = await request.json();
    
    if (!jobId) {
      return NextResponse.json({
        success: false,
        error: 'Job ID is required'
      }, { status: 400 });
    }
    
    // Validate request body
    const validatedData = UpdateJobSchema.parse(body);
    
    const jobRef = doc(db, 'jobs', jobId);
    const jobSnap = await getDoc(jobRef);
    
    if (!jobSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Job not found'
      }, { status: 404 });
    }
    
    // Update job document
    const updateData = {
      ...validatedData,
      updatedAt: Timestamp.now(),
    };
    
    await updateDoc(jobRef, updateData);
    
    // Get updated job data
    const updatedJobSnap = await getDoc(jobRef);
    const updatedData = updatedJobSnap.data();
    
    return NextResponse.json({
      success: true,
      data: {
        id: jobId,
        ...updatedData,
        createdAt: updatedData?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: updatedData?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      },
      message: 'Job updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating job:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid job data',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update job'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    
    if (!jobId) {
      return NextResponse.json({
        success: false,
        error: 'Job ID is required'
      }, { status: 400 });
    }
    
    const jobRef = doc(db, 'jobs', jobId);
    const jobSnap = await getDoc(jobRef);
    
    if (!jobSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Job not found'
      }, { status: 404 });
    }
    
    // Instead of deleting, mark as cancelled
    await updateDoc(jobRef, {
      status: 'cancelled',
      updatedAt: Timestamp.now(),
      cancelledAt: Timestamp.now(),
    });
    
    return NextResponse.json({
      success: true,
      message: 'Job cancelled successfully'
    });
    
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete job'
    }, { status: 500 });
  }
}
