'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import * as z from "zod";

export const packageSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Package name must be at least 3 characters."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  billingCycle: z.enum(['one-time', 'weekly', 'monthly']),
  description: z.string().min(10, "Description must be at least 10 characters."),
  services: z.array(z.string()).min(1, "You must select at least one service."),
  status: z.enum(['active', 'archived']).default('active'),
});

export type ServicePackage = z.infer<typeof packageSchema> & { id: string, createdAt?: string };
export type ServicePackageFormData = z.infer<typeof packageSchema>;

function formatPackage(doc: QueryDocumentSnapshot<DocumentData>): ServicePackage {
  const data = doc.data() as {
    name: string;
    price: number;
    billingCycle: 'one-time' | 'weekly' | 'monthly';
    description: string;
    services: string[];
    status: 'active' | 'archived';
    createdAt?: Timestamp;
  };
  const createdAt = data.createdAt;
  return {
    id: doc.id,
    name: data.name,
    price: data.price,
    billingCycle: data.billingCycle,
    description: data.description,
    services: data.services,
    status: data.status,
    createdAt: createdAt ? createdAt.toDate().toLocaleDateString() : undefined,
  };
}

export async function createPackage(data: ServicePackageFormData) {
  const parse = packageSchema.safeParse(data);
  if (!parse.success) {
    return { success: false, error: parse.error.flatten().fieldErrors };
  }
  try {
    const packageData = {
      ...parse.data,
      createdAt: Timestamp.now(),
      status: 'active'
    };
    await addDoc(collection(db, 'servicePackages'), packageData);
    revalidatePath('/admin/packages');
    return { success: true };
  } catch (error) {
    console.error("Error creating package: ", error);
    return { success: false, error: "Failed to create package." };
  }
}

export async function getPackages(): Promise<ServicePackage[]> {
  try {
    const packagesCollection = collection(db, 'servicePackages');
    const q = query(packagesCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return [];
    }

    return querySnapshot.docs.map(formatPackage);
  } catch (error) {
    console.error("Error fetching packages: ", error);
    return [];
  }
}

export async function updatePackage(packageId: string, data: ServicePackageFormData) {
  const parse = packageSchema.safeParse(data);
  if (!parse.success) {
    return { success: false, error: parse.error.flatten().fieldErrors };
  }
  try {
    const packageRef = doc(db, 'servicePackages', packageId);
    await updateDoc(packageRef, parse.data);
    revalidatePath('/admin/packages');
    return { success: true };
  } catch (error) {
    console.error("Error updating package: ", error);
    return { success: false, error: "Failed to update package." };
  }
}

export async function deletePackage(packageId: string) {
  try {
    const packageRef = doc(db, 'servicePackages', packageId);
    await deleteDoc(packageRef);
    revalidatePath('/admin/packages');
    return { success: true };
  } catch (error) {
    console.error("Error deleting package: ", error);
    return { success: false, error: "Failed to delete package." };
  }
}
