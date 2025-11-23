import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: any) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: any) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protected routes logic
    // Admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Allow access to admin login page without auth
        if (request.nextUrl.pathname === '/admin/login') {
            if (user) {
                // If already logged in, check role and redirect accordingly
                const { data: profile } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
                    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
                }
            }
            return response
        }

        if (!user) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }

        // Check for admin role
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'ADMIN' && profile?.role !== 'SUPER_ADMIN') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // User protected routes
    if (request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/profile') ||
        request.nextUrl.pathname.startsWith('/checkout')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }
    }

    // Auth routes (login/register) - redirect to home/dashboard if already logged in
    if (request.nextUrl.pathname.startsWith('/auth/login') || request.nextUrl.pathname.startsWith('/auth/register')) {
        if (user) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return response
}
