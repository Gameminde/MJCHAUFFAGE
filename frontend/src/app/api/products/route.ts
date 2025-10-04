import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const backendUrl = `${process.env.BACKEND_API_URL}/products`;
    
    // Forward query parameters to backend
    const queryString = searchParams.toString();
    const fullUrl = queryString ? `${backendUrl}?${queryString}` : backendUrl;
    
    const backendResponse = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Failed to fetch products', 
          details: responseData 
        }), 
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error in products API route:', error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendUrl = `${process.env.BACKEND_API_URL}/products`;
    
    // Get authorization header from request
    const authorization = request.headers.get('authorization');
    
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization && { 'Authorization': authorization }),
      },
      body: JSON.stringify(body),
    });

    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Failed to create product', 
          details: responseData 
        }), 
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error in products POST API route:', error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    );
  }
}