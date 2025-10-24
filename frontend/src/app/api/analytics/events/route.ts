export async function POST(req: Request) {
  try {
    const body = await req.json();

    const backendUrl = process.env.BACKEND_API_URL
      || `${process.env.API_URL_SSR || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1`;

    const res = await fetch(`${backendUrl}/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    });

    const data = await res.json().catch(() => ({ success: res.ok }));
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: 'Forwarding failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
