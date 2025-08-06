'use server';

import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'firebase-session-token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: '/',
};

// Server-side cookie operations
export async function setSessionCookie(sessionToken: string) {
  (await cookies()).set(SESSION_COOKIE_NAME, sessionToken, COOKIE_OPTIONS);
}

export async function getSessionCookie() {
  return (await cookies()).get(SESSION_COOKIE_NAME)?.value;
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}

// Server-side user operations
export async function getUserFromSession() {
  const sessionToken = await getSessionCookie();
  if (!sessionToken) return null;
  
  try {
    // In a real implementation, you'd verify the JWT token here
    // For now, we'll just return a basic structure
    return { uid: sessionToken, email: null };
  } catch (error) {
    console.error('Error verifying session:', error);
    return null;
  }
}
