import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Househelp Platform API is running'
  });
}

export async function POST() {
  return NextResponse.json({ 
    error: 'Method not supported for this endpoint' 
  }, { status: 405 });
}
