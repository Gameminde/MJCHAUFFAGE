
import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { SessionData } from '@/lib/auth';
import { cookies } from 'next/headers';

// Iron session configuration for API routes
const ironSessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || "complex_password_at_least_32_characters_long",
  cookieName: "MJ_CHAUFFAGE_SESSION",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export async function GET(request: Request) {
  const session = await getIronSession<SessionData>(cookies(), ironSessionOptions);

  if (!session.isLoggedIn || session.user?.role !== 'ADMIN') {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get('timeframe') || '30d';

  // Define start and end dates based on timeframe
  const endDate = new Date();
  let startDate = new Date();
  switch (timeframe) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    case '30d':
    default:
      startDate.setDate(endDate.getDate() - 30);
      break;
  }

  try {
    const backendUrl = `${process.env.BACKEND_API_URL}/analytics/kpis?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
    
    const backendResponse = await fetch(backendUrl, {
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.text();
      console.error('Backend API error:', errorData);
      return new NextResponse(JSON.stringify({ message: 'Failed to fetch analytics data from backend' }), { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}
