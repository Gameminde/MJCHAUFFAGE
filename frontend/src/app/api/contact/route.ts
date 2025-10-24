
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation to ensure essential fields are present
    const { firstName, lastName, email, phone, message } = body;
    if (!firstName || !lastName || !email || !phone || !message) {
      return new NextResponse(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
    }

    const backendUrl = `${process.env.BACKEND_API_URL}/contact`;
    
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
      return new NextResponse(JSON.stringify({ message: 'Failed to send message', details: responseData }), { status: backendResponse.status });
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error in contact API route:', error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}
