import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { config } from '@/lib/config'

function getBackendBase() {
  return config.api.ssrBaseURL.replace(/\/$/, '')
}

export async function GET(request: NextRequest) {
  try {
    const backendUrl = `${getBackendBase()}/auth/me`
    const cookie = request.headers.get('cookie') || ''

    // Get NextAuth session to retrieve access token for social login users
    const session = await getServerSession(authOptions)
    const accessToken = (session?.user as any)?.accessToken

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
    }

    // If we have an access token from NextAuth, add it as Bearer token
    // This fixes the issue where social login cookies aren't set in the browser
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    const res = await fetch(backendUrl, {
      method: 'GET',
      headers,
    })

    const body = await res.text()
    const resp = new NextResponse(body || '{}', {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
    })

    // Forward set-cookie if any
    const setCookie = res.headers.get('set-cookie')
    if (setCookie) resp.headers.set('set-cookie', setCookie)

    return resp
  } catch (err) {
    console.error('Auth me proxy error:', err)
    return NextResponse.json({ success: false, message: 'Auth me proxy failed' }, { status: 500 })
  }
}
