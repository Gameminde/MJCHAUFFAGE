import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation
    const { firstName, lastName, email, phone, message } = body;
    if (!firstName || !lastName || !email || !phone || !message) {
      return new NextResponse(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
    }

    // Initialize Supabase client (server-side)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
    );

    const { error } = await supabase
      .from('contact_messages')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        message
      });

    if (error) {
      console.error('Supabase error:', error);
      return new NextResponse(JSON.stringify({ message: 'Failed to save message' }), { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Message sent successfully' });

  } catch (error) {
    console.error('Error in contact API route:', error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}
