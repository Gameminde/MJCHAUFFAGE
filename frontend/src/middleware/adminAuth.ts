import { NextRequest, NextResponse } from 'next/server'

export async function adminAuthMiddleware(req: NextRequest) {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isAdminLoginRoute = req.nextUrl.pathname === '/admin/login'

  // Allow access to login page
  if (isAdminLoginRoute) {
    return NextResponse.next()
  }

  // Protect admin routes - SIMPLIFIED VERSION
  // Since NextAuth is disabled, we'll use a simple session check
  if (isAdminRoute) {
    // For now, allow access to all admin routes without authentication
    // This will be replaced with proper authentication once NextAuth is enabled
    return NextResponse.next()
  }

  return NextResponse.next()
}