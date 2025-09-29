import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function adminAuthMiddleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isAdminLoginRoute = req.nextUrl.pathname === '/admin/login'

  // Allow access to login page
  if (isAdminLoginRoute) {
    // If already authenticated as admin, redirect to admin dashboard
    if (token && (token.role === 'ADMIN' || token.role === 'SUPER_ADMIN')) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    return NextResponse.next()
  }

  // Protect admin routes
  if (isAdminRoute) {
    // Not authenticated
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    // Not an admin
    if (token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
}