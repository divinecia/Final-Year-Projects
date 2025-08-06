'use server';

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  getDocs,
  Timestamp,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface DatabaseResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

function getUserCollection(userType: 'household' | 'worker' | 'admin'): string {
  return userType === 'admin' ? 'admins' : userType;
}

function handleError(error: unknown, message: string): DatabaseResult<never> {
  if (error instanceof Error) {
    return { success: false, error: `${message}: ${error.message}` };
  }
  return { success: false, error: message };
}

/**
 * Create a document in Firestore
 */
export async function createDocument<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: T
): Promise<DatabaseResult<string>> {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { success: true, data: docId };
  } catch (error) {
    return handleError(error, 'Failed to create document');
  }
}

/**
 * Read a document from Firestore
 */
export async function readDocument<T extends DocumentData>(
  collectionName: string,
  docId: string
): Promise<DatabaseResult<T & { id: string }>> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } as T & { id: string } };
    }
    return { success: false, error: 'Document not found' };
  } catch (error) {
    return handleError(error, 'Failed to read document');
  }
}

/**
 * Update a document in Firestore
 */
export async function updateDocument<T extends DocumentData>(
  collectionName: string,
  docId: string,
  updates: Partial<T>
): Promise<DatabaseResult<string>> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    return { success: true, data: docId };
  } catch (error) {
    return handleError(error, 'Failed to update document');
  }
}

/**
 * Delete a document from Firestore
 */
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<DatabaseResult<string>> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return { success: true, data: docId };
  } catch (error) {
    return handleError(error, 'Failed to delete document');
  }
}

/**
 * Query documents from Firestore
 */
export async function queryDocuments<T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<DatabaseResult<(T & { id: string })[]>> {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const docs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (T & { id: string })[];

    return { success: true, data: docs };
  } catch (error) {
    return handleError(error, 'Failed to query documents');
  }
}

/**
 * Check if a document exists
 */
export async function documentExists(
  collectionName: string,
  docId: string
): Promise<DatabaseResult<boolean>> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return { success: true, data: docSnap.exists() };
  } catch (error) {
    return handleError(error, 'Failed to check document');
  }
}

/**
 * User-specific database operations
 */

export async function createUserProfile<T extends DocumentData>(
  userType: 'household' | 'worker' | 'admin',
  userId: string,
  profileData: T
): Promise<DatabaseResult<string>> {
  return createDocument(getUserCollection(userType), userId, profileData);
}

export async function getUserProfile<T extends DocumentData>(
  userType: 'household' | 'worker' | 'admin',
  userId: string
): Promise<DatabaseResult<T & { id: string }>> {
  return readDocument(getUserCollection(userType), userId);
}

export async function updateUserProfile<T extends DocumentData>(
  userType: 'household' | 'worker' | 'admin',
  userId: string,
  updates: Partial<T>
): Promise<DatabaseResult<string>> {
  return updateDocument(getUserCollection(userType), userId, updates);
}

export async function deleteUserProfile(
  userType: 'household' | 'worker' | 'admin',
  userId: string
): Promise<DatabaseResult<string>> {
  return deleteDocument(getUserCollection(userType), userId);
}
