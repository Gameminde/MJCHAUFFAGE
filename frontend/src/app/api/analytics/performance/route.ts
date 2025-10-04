import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

interface PerformanceMetric {
  type?: string
  lcp?: number
  fid?: number
  cls?: number
  fcp?: number
  ttfb?: number
  url?: string
  userAgent?: string
  connection?: string
  timestamp?: number
  duration?: number
  status?: number
}

export async function POST(request: NextRequest) {
  try {
    const headersList = headers()
    const userAgent = headersList.get('user-agent') || 'unknown'
    const ip = headersList.get('x-forwarded-for') || 'unknown'
    
    const body: PerformanceMetric = await request.json()
    
    // Validate required fields
    if (!body.timestamp) {
      return NextResponse.json(
        { error: 'Timestamp is required' },
        { status: 400 }
      )
    }

    // Log performance metrics (in production, send to analytics service)
    console.log('Performance Metric:', {
      ...body,
      ip,
      userAgent,
      receivedAt: new Date().toISOString(),
    })

    // In a real implementation, you would:
    // 1. Store metrics in database
    // 2. Send to analytics service (Google Analytics, DataDog, etc.)
    // 3. Trigger alerts for poor performance
    
    // Example: Store in database
    /*
    await prisma.performanceMetric.create({
      data: {
        type: body.type || 'web_vital',
        lcp: body.lcp,
        fid: body.fid,
        cls: body.cls,
        fcp: body.fcp,
        ttfb: body.ttfb,
        url: body.url,
        userAgent: body.userAgent || userAgent,
        connection: body.connection,
        timestamp: new Date(body.timestamp),
        duration: body.duration,
        status: body.status,
        ip,
      },
    })
    */

    // Check for performance issues and log warnings
    if (body.lcp && body.lcp > 2500) {
      console.warn(`Poor LCP detected: ${body.lcp}ms on ${body.url}`)
    }
    
    if (body.fid && body.fid > 100) {
      console.warn(`Poor FID detected: ${body.fid}ms on ${body.url}`)
    }
    
    if (body.cls && body.cls > 0.1) {
      console.warn(`Poor CLS detected: ${body.cls} on ${body.url}`)
    }
    
    if (body.duration && body.duration > 2000) {
      console.warn(`Slow API call detected: ${body.duration}ms to ${body.url}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing performance metric:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}