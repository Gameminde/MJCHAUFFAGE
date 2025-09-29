
import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { SessionData } from '@/lib/auth';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Iron session configuration for API routes
const ironSessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || "complex_password_at_least_32_characters_long",
  cookieName: "MJ_CHAUFFAGE_SESSION",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export async function POST(request: Request) {
  const session = await getIronSession<SessionData>(cookies(), ironSessionOptions);

  // 1. Check for user authentication
  if (!session.isLoggedIn || !session.user?.id) {
    return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
  }

  try {
    const body = await request.json();

    // 2. Prepare the data for the backend
    const backendData = {
      ...body,
      // The backend expects the user ID to be inferred from the token,
      // so we don't need to pass it explicitly.
    };

    const backendUrl = `${process.env.BACKEND_API_URL}/orders`;
    
    // 3. Call the backend API
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.token}`, // Pass the user's token
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData),
    });

    // 4. Handle the backend response
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      console.error('Backend API error:', errorData);
      return new NextResponse(JSON.stringify({ message: errorData.message || 'Failed to create order on backend' }), { status: backendResponse.status });
    }

    const responseData = await backendResponse.json();

    // Optional: Revalidate paths if you want to update user's order history page
    revalidatePath('/dashboard/orders');

    // 5. Return a success response to the client
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error processing order request:', error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}
