import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, addDoc, collection, Timestamp } from 'firebase/firestore';
import { z } from 'zod';

// Schema for job application
const ApplyJobSchema = z.object({
  workerId: z.string().min(1, "Worker ID is required"),
  workerName: z.string().min(1, "Worker name is required"),
  coverLetter: z.string().optional(),
  proposedRate: z.number().min(1, "Proposed rate must be greater than 0").optional(),
});

export async function POST(
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
    const validatedData = ApplyJobSchema.parse(body);
    
    // Check if job exists and is open
    const jobRef = doc(db, 'jobs', jobId);
    const jobSnap = await getDoc(jobRef);
    
    if (!jobSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Job not found'
      }, { status: 404 });
    }
    
    const jobData = jobSnap.data();
    
    if (jobData.status !== 'open') {
      return NextResponse.json({
        success: false,
        error: 'Job is no longer accepting applications'
      }, { status: 400 });
    }
    
    // Check if worker already applied
    const existingApplicants: { workerId: string }[] = jobData.applicants || [];
    const hasApplied = existingApplicants.some((app) => app.workerId === validatedData.workerId);
    
    if (hasApplied) {
      return NextResponse.json({
        success: false,
        error: 'You have already applied for this job'
      }, { status: 400 });
    }
    
    // Create application object
    const application = {
      workerId: validatedData.workerId,
      workerName: validatedData.workerName,
      coverLetter: validatedData.coverLetter || '',
      proposedRate: validatedData.proposedRate,
      appliedAt: Timestamp.now(),
      status: 'pending'
    };
    
    // Add application to job's applicants array
    await updateDoc(jobRef, {
      applicants: arrayUnion(application),
      updatedAt: Timestamp.now(),
    });
    
    // Create notification for household
    await addDoc(collection(db, 'notifications'), {
      userId: jobData.householdId,
      title: 'New Job Application',
      description: `${validatedData.workerName} has applied for your job: ${jobData.jobTitle}`,
      type: 'job_application',
      read: false,
      createdAt: Timestamp.now(),
      actionUrl: `/household/jobs/${jobId}/applications`,
      metadata: {
        jobId: jobId,
        workerId: validatedData.workerId,
        workerName: validatedData.workerName,
      }
    });
    
    return NextResponse.json({
      success: true,
      data: application,
      message: 'Application submitted successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error applying for job:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid application data',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to submit application'
    }, { status: 500 });
  }
}

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
    
    const jobData = jobSnap.data();
    const applicants = jobData.applicants || [];
    
    // Format applicants data
    const formattedApplicants = applicants.map((app: Record<string, unknown>) => ({
      ...app,
      appliedAt: (typeof app.appliedAt === 'object' && app.appliedAt && 'toDate' in app.appliedAt && typeof (app.appliedAt as { toDate: () => Date }).toDate === 'function')
        ? (app.appliedAt as { toDate: () => Date }).toDate()?.toISOString() || new Date().toISOString()
        : new Date().toISOString(),
    }));
    
    return NextResponse.json({
      success: true,
      data: formattedApplicants,
      total: formattedApplicants.length,
      message: 'Applications retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch applications'
    }, { status: 500 });
  }
}
