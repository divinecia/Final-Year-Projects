'use server';

import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a file to Firebase Storage and returns its download URL.
 * @param file The file to upload.
 * @param path The storage path (e.g., 'profile-pictures/').
 * @returns The download URL of the uploaded file.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  if (!file) throw new Error('No file provided for upload.');
  if (!path) throw new Error('No storage path provided.');

  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const fileRef = ref(storage, `${path.replace(/\/?$/, '/')}${timestamp}-${sanitizedFileName}`);

  try {
    const arrayBuffer = await file.arrayBuffer();
    const snapshot = await uploadBytes(fileRef, arrayBuffer, {
      contentType: file.type || 'application/octet-stream',
    });
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('File upload failed.');
  }
}
