import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { WorkerSettingsSchema } from '@/lib/schemas/worker';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get('workerId');

    if (!workerId) {
        return NextResponse.json({ error: 'Worker ID is required' }, { status: 400 });
    }

    try {
        const workerRef = doc(db, 'workers', workerId);
        const docSnap = await getDoc(workerRef);

        if (!docSnap.exists()) {
            return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
        }

        const data = docSnap.data();
        
        const profile = {
            id: docSnap.id,
            fullName: data.fullName || '',
            email: data.email || '',
            phone: data.phone || '',
            bio: data.bio || '',
            services: data.services || [],
            languages: data.languages || [],
            oneTimeJobs: data.availability?.preferences?.includes('one-time') || false,
            recurringJobs: data.availability?.preferences?.includes('recurring') || false,
            hourlyRate: [data.hourlyRate || 1500],
        };

        return NextResponse.json(profile);
    } catch (error) {
        console.error('Error fetching worker profile:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { workerId, data } = body;

        if (!workerId) {
            return NextResponse.json({ error: 'Worker ID is required' }, { status: 400 });
        }

        // Validate the data
        const validatedData = WorkerSettingsSchema.parse(data);

        const workerRef = doc(db, 'workers', workerId);
        
        const dataToUpdate = {
            fullName: validatedData.fullName,
            email: validatedData.email,
            bio: validatedData.bio,
            services: validatedData.services,
            languages: validatedData.languages,
            'availability.preferences': [
                ...(validatedData.oneTimeJobs ? ['one-time'] : []),
                ...(validatedData.recurringJobs ? ['recurring'] : []),
            ],
            hourlyRate: validatedData.hourlyRate[0],
        };

        await updateDoc(workerRef, dataToUpdate);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating worker profile:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
