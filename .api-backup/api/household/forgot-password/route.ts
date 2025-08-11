import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/auth';

/**
 * POST /api/household/forgot-password
 * Handles forgot password for household users.
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid email.' }, { status: 400 });
    }
    await sendPasswordResetEmail(email, 'household');
    return NextResponse.json({ success: true, message: 'Password reset email sent.' });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to send reset email.' }, { status: 500 });
  }
}
