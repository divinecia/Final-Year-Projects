import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    env: {
      hasProjectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      nodeEnv: process.env.NODE_ENV,
    },
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('FIREBASE'))
  });
}
