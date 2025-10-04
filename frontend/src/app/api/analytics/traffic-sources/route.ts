import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7d';
    
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Try to fetch real data from backend
    try {
      const response = await fetch(`${backendUrl}/api/analytics/traffic-sources?timeframe=${timeframe}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      } else {
        throw new Error(`Backend responded with status: ${response.status}`);
      }
    } catch (backendError) {
      console.warn('Backend analytics unavailable, returning empty data:', backendError);
      
      // Return empty data structure instead of mock data
      return NextResponse.json({
        success: true,
        data: {
          totalSessions: 0,
          sources: [],
          message: 'Analytics data temporarily unavailable. Please check your database connection.'
        }
      });
    }

  } catch (error) {
    console.error('Traffic sources analytics error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch traffic sources analytics' 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}