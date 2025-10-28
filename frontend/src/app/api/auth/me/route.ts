import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

function getBackendBase() {
  return config.api.ssrBaseURL.replace(/\/$/, '')
}

export async function GET(request: NextRequest) {
  try {
    const backendUrl = `${getBackendBase()}/auth/me`
    const cookie = request.headers.get('cookie') || ''

    const res = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { cookie } : {}),
      },
    })

    const body = await res.text()
    const resp = new NextResponse(body || '{}', {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
    })

    // Forward set-cookie if any (unlikely on /me but harmless)
    const setCookie = res.headers.get('set-cookie')
    if (setCookie) resp.headers.set('set-cookie', setCookie)

    return resp
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Auth me proxy failed' }, { status: 500 })
  }
}
