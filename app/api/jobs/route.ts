import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { z } from 'zod';

// Schema for job creation
const CreateJobSchema = z.object({
  jobTitle: z.string().min(5, "Job title must be at least 5 characters."),
  serviceType: z.string().min(1, "Service type is required."),
  jobDescription: z.string().min(20, "Description must be at least 20 characters."),
  schedule: z.string().min(5, "Schedule details are required."),
  salary: z.number().min(1, "Salary must be greater than 0."),
  payFrequency: z.string().min(1, "Pay frequency is required."),
  householdId: z.string().min(1, "Household ID is required."),
  householdName: z.string().optional(),
  householdLocation: z.string().optional(),
  benefits: z.object({
    accommodation: z.boolean().default(false),
    meals: z.boolean().default(false),
    transportation: z.boolean().default(false),
  }).optional(),
});

// Schema for job query parameters
const JobQuerySchema = z.object({
  status: z.enum(['open', 'assigned', 'in_progress', 'completed', 'cancelled']).optional(),
  serviceType: z.string().optional(),
  householdId: z.string().optional(),
  workerId: z.string().optional(),
  limit: z.string().transform(val => parseInt(val, 10)).optional(),
  offset: z.string().transform(val => parseInt(val, 10)).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedParams = JobQuerySchema.parse(params);
    
    // Build query
    const jobsQuery = collection(db, 'jobs');
    const queryConstraints: import('firebase/firestore').QueryConstraint[] = [orderBy('createdAt', 'desc')];
    
    if (validatedParams.status) {
      queryConstraints.unshift(where('status', '==', validatedParams.status));
    }
    
    if (validatedParams.serviceType) {
      queryConstraints.unshift(where('serviceType', '==', validatedParams.serviceType));
    }
    
    if (validatedParams.householdId) {
      queryConstraints.unshift(where('householdId', '==', validatedParams.householdId));
    }
    
    if (validatedParams.workerId) {
      queryConstraints.unshift(where('workerId', '==', validatedParams.workerId));
    }
    
    if (validatedParams.limit) {
      queryConstraints.push(limit(validatedParams.limit));
    }
    
    const q = query(jobsQuery, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    const jobs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      };
    });
    
    return NextResponse.json({
      success: true,
      data: jobs,
      total: jobs.length,
      message: 'Jobs retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching jobs:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch jobs'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = CreateJobSchema.parse(body);
    
    // Create job document
    const jobData = {
      ...validatedData,
      status: 'open',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      applicants: [],
      viewCount: 0,
    };
    
    const docRef = await addDoc(collection(db, 'jobs'), jobData);
    
    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...jobData },
      message: 'Job created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating job:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid job data',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create job'
    }, { status: 500 });
  }
}
