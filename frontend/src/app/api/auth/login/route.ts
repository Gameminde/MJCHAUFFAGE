import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

function getBackendBase() {
  return config.api.ssrBaseURL.replace(/\/$/, '')
}

export async function POST(request: NextRequest) {
  try {
    const backendUrl = `${getBackendBase()}/auth/login`
    const body = await request.text()

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('content-type') || 'application/json',
      },
      body,
    })

    const resp = new NextResponse(await res.text(), {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
    })

    // Forward Set-Cookie from backend to client
    const setCookie = res.headers.get('set-cookie')
    if (setCookie) {
      resp.headers.set('set-cookie', setCookie)
    }

    return resp
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Auth login proxy failed' }, { status: 500 })
  }
}
