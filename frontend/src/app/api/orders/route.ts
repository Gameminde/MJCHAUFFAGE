import { NextRequest, NextResponse } from 'next/server'

interface OrderItem {
  productId: string
  quantity: number
  unitPrice: number
}

interface ShippingAddress {
  street: string
  city: string
  postalCode: string
  region: string
  country: string
}

interface CustomerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface OrderRequest {
  items: OrderItem[]
  shippingAddress: ShippingAddress
  customerInfo: CustomerInfo
  paymentMethod: string
  subtotal: number
  shippingAmount: number
  totalAmount: number
  currency: string
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderRequest = await request.json()

    // Validate required fields
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Order must contain at least one item' },
        { status: 400 }
      )
    }

    if (!body.shippingAddress || !body.customerInfo) {
      return NextResponse.json(
        { success: false, message: 'Shipping address and customer info are required' },
        { status: 400 }
      )
    }

    // Create order data for backend
    const orderData = {
      items: body.items,
      shippingAddress: body.shippingAddress,
      customerInfo: body.customerInfo,
      paymentMethod: body.paymentMethod,
      subtotal: body.subtotal,
      shippingAmount: body.shippingAmount,
      totalAmount: body.totalAmount,
      currency: body.currency
    }

    // Call backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/api/orders/guest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { success: false, message: errorData.message || 'Failed to create order' },
        { status: response.status }
      )
    }

    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: result.data
    })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}