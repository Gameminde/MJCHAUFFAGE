import { NextRequest, NextResponse } from 'next/server'

export async function adminAuthMiddleware(req: NextRequest) {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isAdminLoginRoute = req.nextUrl.pathname === '/admin/login'

  // Allow access to login page
  if (isAdminLoginRoute) {
    return NextResponse.next()
  }

  // Protect admin routes - Check for accessToken cookie
  if (isAdminRoute) {
    // ✅ Check for HTTP-only accessToken cookie
    const authToken = req.cookies.get('accessToken')?.value
    
    if (!authToken) {
      // Redirect to login if no token
      const loginUrl = new URL('/admin/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
    
    // TODO: Optionally verify token with backend
    // For now, presence of cookie is sufficient
    return NextResponse.next()
  }

  return NextResponse.next()
}