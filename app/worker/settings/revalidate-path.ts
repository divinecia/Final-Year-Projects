// Utility to revalidate a Next.js path on the server
import { revalidatePath as nextRevalidatePath } from 'next/cache';

export function revalidatePath(path: string) {
  return nextRevalidatePath(path);
}
