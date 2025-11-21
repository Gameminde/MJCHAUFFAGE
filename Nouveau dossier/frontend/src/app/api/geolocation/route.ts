export async function GET() {
  try {
    // Abort external call if it takes too long (common cause of dev "aborted" errors)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch('https://ipapi.co/json/', {
      // Let Next.js cache this on the server side and revalidate periodically
      next: { revalidate: 3600 },
      signal: controller.signal,
    });
    clearTimeout(timeout);

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
