import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    // Fetch full profile from users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      // Fallback if profile not found but user is authenticated
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.user_metadata?.role || 'CUSTOMER',
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || ''
        }
      })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
        phone: profile.phone,
      }
    })
  } catch (err) {
    console.error('Auth me error:', err)
    return NextResponse.json({ success: false, message: 'Auth me failed' }, { status: 500 })
  }
}
