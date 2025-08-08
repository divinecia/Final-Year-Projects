
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, doc, updateDoc, getDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { createJobNotification } from '@/lib/notifications';

export type Job = {
    id: string;
    jobTitle: string;
    householdName: string;
    householdLocation: string;
    serviceType: string;
    status: 'open' | 'assigned' | 'completed' | 'cancelled';
    salary: number;
    payFrequency: string;
};

export async function getOpenJobs(): Promise<Job[]> {
  try {
    const jobsCollection = collection(db, 'jobs');
    const q = query(jobsCollection, where('status', '==', 'open'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return [];
    }

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        jobTitle: data.jobTitle || 'N/A',
        householdName: data.householdName || 'N/A',
        householdLocation: data.householdLocation || 'N/A',
        serviceType: data.serviceType || 'N/A',
        status: data.status,
        // Access salary from compensation object according to schema
        salary: data.compensation?.salary || data.salary || 0,
        payFrequency: data.compensation?.payFrequency || data.payFrequency || 'N/A',
      } as Job;
    });
  } catch (error) {
    console.error("Error fetching open jobs: ", error);
    return [];
  }
}


export async function applyForJob(jobId: string, workerId: string, coverLetter?: string): Promise<{ success: boolean, error?: string }> {
    if (!jobId || !workerId) {
        return { success: false, error: "Missing job or worker information." };
    }

    try {
        const workerRef = doc(db, 'workers', workerId);
        const workerSnap = await getDoc(workerRef);

        if (!workerSnap.exists()) {
             return { success: false, error: "Worker profile not found." };
        }
        const workerData = workerSnap.data();

        const jobRef = doc(db, 'jobs', jobId);
        const jobSnap = await getDoc(jobRef);
        
        if (!jobSnap.exists()) {
            return { success: false, error: "Job not found." };
        }
        
        const jobData = jobSnap.data();
        
        // Check if job is still open
        if (jobData.status !== 'open') {
            return { success: false, error: "This job is no longer accepting applications." };
        }
        
        // Check if worker already applied
        const existingApplicants = jobData.applicants || [];
        const hasApplied = existingApplicants.some((app: { workerId: string }) => app.workerId === workerId);
        
        if (hasApplied) {
            return { success: false, error: "You have already applied for this job." };
        }
        
        // Create application object with schema-aligned structure
        const application = {
            workerId: workerId,
            workerName: workerData.personalInfo?.fullName || workerData.fullName || 'Worker',
            workerEmail: workerData.personalInfo?.email || workerData.email || '',
            workerPhone: workerData.personalInfo?.phone || workerData.phone || '',
            profilePictureUrl: workerData.personalInfo?.profilePictureUrl || workerData.profilePictureUrl || '',
            services: workerData.workProfile?.services || workerData.services || [],
            rating: workerData.performance?.averageRating || workerData.rating || 0,
            completedJobs: workerData.performance?.completedJobs || workerData.completedJobs || 0,
            coverLetter: coverLetter || '',
            appliedAt: Timestamp.now(),
            status: 'pending'
        };
        
        // Add application to job
        await updateDoc(jobRef, {
            applicants: arrayUnion(application),
            updatedAt: Timestamp.now(),
        });
        
        // Create notification for household using the notification service
        await createJobNotification(
            jobData.householdId,
            'household',
            jobId,
            'New Job Application',
            `${workerData.personalInfo?.fullName || workerData.fullName} has applied for your job: ${jobData.jobTitle}`,
            'info'
        );
        
        revalidatePath('/worker/jobs');
        
        return { success: true };

    } catch (error) {
        console.error("Error applying for job: ", error);
        return { success: false, error: "Failed to apply for the job." };
    }
}
