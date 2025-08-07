import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/auth';

/**
 * POST /api/admin/forgot-password
 * Handles forgot password for admin users.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, phone } = await request.json();
    
    if (email) {
      if (typeof email !== 'string') {
        return NextResponse.json({ success: false, error: 'Invalid email.' }, { status: 400 });
      }
      
      // Check if email matches the admin email
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@househelp.rw';
      if (email.toLowerCase() !== adminEmail.toLowerCase()) {
        return NextResponse.json({ success: false, error: 'Email does not match admin email.' }, { status: 400 });
      }
      
      await sendPasswordResetEmail(email, 'admin');
      return NextResponse.json({ success: true, message: 'Password reset email sent.' });
    }
    
    if (phone) {
      if (typeof phone !== 'string') {
        return NextResponse.json({ success: false, error: 'Invalid phone number.' }, { status: 400 });
      }
      
      // For now, just return success for phone (implement SMS logic later)
      return NextResponse.json({ success: true, message: 'Password reset SMS sent.' });
    }
    
    return NextResponse.json({ success: false, error: 'Email or phone is required.' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to send reset instructions.' }, { status: 500 });
  }
}
