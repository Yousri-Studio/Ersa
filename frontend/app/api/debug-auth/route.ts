import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token');
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    serverSide: {
      hasAuthCookie: !!authToken,
      cookieValue: authToken ? `${authToken.value.substring(0, 20)}...` : null,
    },
    instructions: 'Check browser console for client-side state',
  });
}

