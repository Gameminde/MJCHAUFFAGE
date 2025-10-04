import { NextRequest, NextResponse } from 'next/server';

interface AnalyticsEvent {
  type: string;
  data: any;
  timestamp: string;
}

interface EventBatch {
  events: AnalyticsEvent[];
}

export async function POST(request: NextRequest) {
  try {
    const { events }: EventBatch = await request.json();

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Invalid events data' },
        { status: 400 }
      );
    }

    // Get client IP and user agent
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Process each event
    const processedEvents = await Promise.allSettled(
      events.map(event => processAnalyticsEvent(event, clientIP, userAgent))
    );

    // Count successful and failed events
    const successful = processedEvents.filter(result => result.status === 'fulfilled').length;
    const failed = processedEvents.filter(result => result.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      processed: successful,
      failed: failed,
      total: events.length
    });

  } catch (error) {
    console.error('Analytics events processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics events' },
      { status: 500 }
    );
  }
}

async function processAnalyticsEvent(
  event: AnalyticsEvent, 
  clientIP: string, 
  userAgent: string
): Promise<void> {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  try {
    // Forward the event to the backend analytics service
    const response = await fetch(`${backendUrl}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-IP': clientIP,
        'X-User-Agent': userAgent,
      },
      body: JSON.stringify({
        eventType: event.type,
        eventData: event.data,
        timestamp: event.timestamp,
        clientIP,
        userAgent
      })
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

  } catch (error) {
    console.error(`Failed to process ${event.type} event:`, error);
    throw error;
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}