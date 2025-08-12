import { NextRequest, NextResponse } from 'next/server';
import { setSessionCookie, clearSessionCookie } from '@/lib/server-auth';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    
    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    // In a production app, you'd verify the ID token here
    // For now, we'll just set it as the session cookie
    await setSessionCookie(idToken);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session cookie error:', error);
    return NextResponse.json({ error: 'Failed to set session' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear session error:', error);
    return NextResponse.json({ error: 'Failed to clear session' }, { status: 500 });
  }
}
