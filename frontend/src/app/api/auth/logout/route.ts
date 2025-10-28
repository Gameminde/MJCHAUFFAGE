import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

function getBackendBase() {
  return config.api.ssrBaseURL.replace(/\/$/, '')
}

export async function POST(_request: NextRequest) {
  try {
    const backendUrl = `${getBackendBase()}/auth/logout`

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    const resp = new NextResponse(await res.text(), {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
    })

    const setCookie = res.headers.get('set-cookie')
    if (setCookie) resp.headers.set('set-cookie', setCookie)

    return resp
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Auth logout proxy failed' }, { status: 500 })
  }
}
