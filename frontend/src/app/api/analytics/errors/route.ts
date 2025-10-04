import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

interface ErrorReport {
  error: string
  stack?: string
  componentStack?: string
  errorInfo?: any
  timestamp: string
  url: string
  userAgent: string
  userId?: string
  sessionId?: string
}

export async function POST(request: NextRequest) {
  try {
    const headersList = headers()
    const userAgent = headersList.get('user-agent') || 'unknown'
    const ip = headersList.get('x-forwarded-for') || 'unknown'
    
    const body: ErrorReport = await request.json()
    
    // Validate required fields
    if (!body.error || !body.timestamp || !body.url) {
      return NextResponse.json(
        { error: 'Error, timestamp, and URL are required' },
        { status: 400 }
      )
    }

    // Log error (in production, send to error tracking service)
    console.error('Frontend Error Report:', {
      ...body,
      ip,
      serverUserAgent: userAgent,
      receivedAt: new Date().toISOString(),
    })

    // In a real implementation, you would:
    // 1. Store errors in database
    // 2. Send to error tracking service (Sentry, Bugsnag, etc.)
    // 3. Trigger alerts for critical errors
    // 4. Group similar errors
    
    // Example: Store in database
    /*
    await prisma.errorLog.create({
      data: {
        level: 'error',
        message: body.error,
        stackTrace: body.stack,
        url: body.url,
        userAgent: body.userAgent,
        userId: body.userId,
        sessionId: body.sessionId,
        metadata: {
          componentStack: body.componentStack,
          errorInfo: body.errorInfo,
          ip,
        },
        createdAt: new Date(body.timestamp),
      },
    })
    */

    // Check for critical errors that need immediate attention
    const criticalKeywords = ['payment', 'checkout', 'auth', 'security', 'database']
    const isCritical = criticalKeywords.some(keyword => 
      body.error.toLowerCase().includes(keyword) || 
      body.url.toLowerCase().includes(keyword)
    )
    
    if (isCritical) {
      console.error('CRITICAL ERROR DETECTED:', {
        error: body.error,
        url: body.url,
        timestamp: body.timestamp,
      })
      
      // In production, trigger immediate alerts (Slack, email, etc.)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing error report:', error)
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