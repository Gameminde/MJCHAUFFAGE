import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Call ipapi.co from server-side (no CORS issues)
    const response = await fetch(`https://ipapi.co/${clientIP}/json/`, {
      headers: {
        'User-Agent': 'MJ-CHAUFFAGE-Website/1.0'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`IP API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: {
        country: data.country_name || 'Algeria',
        city: data.city || 'Algiers',
        region: data.region || 'Algiers',
        timezone: data.timezone || 'Africa/Algiers',
        currency: data.currency || 'DZD',
        ip: clientIP
      }
    });

  } catch (error) {
    console.error('Geolocation API error:', error);
    
    // Return default data for Algeria
    return NextResponse.json({
      success: true,
      data: {
        country: 'Algeria',
        city: 'Algiers',
        region: 'Algiers',
        timezone: 'Africa/Algiers',
        currency: 'DZD',
        ip: 'unknown'
      }
    });
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
