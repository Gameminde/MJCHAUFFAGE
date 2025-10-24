export async function GET() {
  try {
    const response = await fetch('https://ipapi.co/json/');

    if (!response.ok) {
      return Response.json(
        { country: 'DZ', city: 'Algiers' },
        { status: 200 }
      );
    }

    const data = await response.json();
    return Response.json(data, {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate'
      }
    });
  } catch (error) {
    console.error('Geolocation fetch failed:', error);
    return Response.json(
      { country: 'DZ', city: 'Algiers' },
      { status: 200 }
    );
  }
}
