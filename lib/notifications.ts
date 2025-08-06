'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

type UserType = 'household' | 'worker' | 'admin';
type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface NotificationData {
    title: string;
    description: string;
    type: NotificationType;
    userId: string;
    userType: UserType;
    jobId?: string | null;
    paymentId?: string | null;
    read: boolean;
    createdAt: Timestamp;
}

interface NotificationResult {
    success: boolean;
    error?: string;
}

/**
 * Creates a notification for a user according to the standardized schema
 */
export async function createNotification(
    userId: string,
    userType: UserType,
    title: string,
    description: string,
    type: NotificationType = 'info',
    jobId?: string,
    paymentId?: string
): Promise<NotificationResult> {
    try {
        const notificationsCollection = collection(db, 'notifications');
        const notification: NotificationData = {
            title,
            description,
            type,
            userId,
            userType,
            jobId: jobId ?? null,
            paymentId: paymentId ?? null,
            read: false,
            createdAt: Timestamp.now(),
        };

        await addDoc(notificationsCollection, notification);

        return { success: true };
    } catch (error) {
        console.error('Error creating notification:', error);
        return { success: false, error: (error instanceof Error ? error.message : 'Failed to create notification.') };
    }
}

/**
 * Helper to create job-related notifications
 */
export async function createJobNotification(
    userId: string,
    userType: UserType,
    jobId: string,
    title: string,
    description: string,
    type: NotificationType = 'info'
): Promise<NotificationResult> {
    return createNotification(userId, userType, title, description, type, jobId);
}

/**
 * Helper to create payment-related notifications
 */
export async function createPaymentNotification(
    userId: string,
    userType: UserType,
    paymentId: string,
    title: string,
    description: string,
    type: NotificationType = 'info'
): Promise<NotificationResult> {
    return createNotification(userId, userType, title, description, type, undefined, paymentId);
}
