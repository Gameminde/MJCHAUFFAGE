import axios from 'axios'

interface DahabiaPaymentRequest {
  orderId: string
  amount: number
  currency: string
  merchantReference: string
  customerInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  returnUrl: string
  cancelUrl: string
}

interface DahabiaPaymentResponse {
  success: boolean
  paymentId: string
  paymentUrl: string
  referenceNumber: string
  expiresAt: string
  status: 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'CANCELLED' | 'FAILED'
}

export class DahabiaPaymentService {
  private static readonly API_BASE_URL = process.env.DAHABIA_API_URL || 'https://api.poste.dz'
  private static readonly MERCHANT_ID = process.env.DAHABIA_MERCHANT_ID
  private static readonly SECRET_KEY = process.env.DAHABIA_SECRET_KEY

  /**
   * Create a Dahabia payment session
   * Note: This is a mock implementation as the actual Algeria Post Dahabia API
   * documentation is not publicly available. In production, this would need
   * to be updated with the real API endpoints and authentication methods.
   */
  static async createPayment(request: DahabiaPaymentRequest): Promise<DahabiaPaymentResponse> {
    try {
      // Mock implementation for development
      if (process.env.NODE_ENV === 'development') {
        return this.createMockPayment(request)
      }

      // Production implementation would go here
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'X-Merchant-ID': this.MERCHANT_ID
      }

      const payload = {
        amount: request.amount,
        currency: request.currency,
        reference: request.merchantReference,
        description: `Order payment for ${request.orderId}`,
        customer: {
          first_name: request.customerInfo.firstName,
          last_name: request.customerInfo.lastName,
          email: request.customerInfo.email,
          phone: request.customerInfo.phone
        },
        urls: {
          return_url: request.returnUrl,
          cancel_url: request.cancelUrl,
          notification_url: `${process.env.BACKEND_URL}/api/payments/dahabia/webhook`
        },
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
      }

      const response = await axios.post(
        `${this.API_BASE_URL}/payments/create`,
        payload,
        { headers, timeout: 30000 }
      )

      return {
        success: true,
        paymentId: response.data.payment_id,
        paymentUrl: response.data.payment_url,
        referenceNumber: response.data.reference,
        expiresAt: response.data.expires_at,
        status: 'PENDING'
      }

    } catch (error) {
      throw new Error('Failed to create Dahabia payment session')
    }
  }

  /**
   * Check payment status
   */
  static async checkPaymentStatus(paymentId: string): Promise<DahabiaPaymentResponse> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return this.getMockPaymentStatus(paymentId)
      }

      const headers = {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'X-Merchant-ID': this.MERCHANT_ID
      }

      const response = await axios.get(
        `${this.API_BASE_URL}/payments/${paymentId}/status`,
        { headers, timeout: 15000 }
      )

      return {
        success: true,
        paymentId: response.data.payment_id,
        paymentUrl: response.data.payment_url,
        referenceNumber: response.data.reference,
        expiresAt: response.data.expires_at,
        status: response.data.status
      }

    } catch (error) {
      throw new Error('Failed to check payment status')
    }
  }

  /**
   * Process payment webhook from Algeria Post
   */
  static async processWebhook(payload: any, signature: string): Promise<boolean> {
    try {
      if (!this.verifyWebhookSignature(payload, signature)) {
        return false
      }

      // Update order payment status in database
      // This would be implemented in the order service
      // payload contains payment_id, status, reference

      return true

    } catch (error) {
      return false
    }
  }

  /**
   * Generate authentication token for Algeria Post API
   */
  private static getAuthToken(): string {
    // In production, this would implement the actual authentication method
    // required by Algeria Post (could be API key, JWT, etc.)
    return process.env.DAHABIA_SECRET_KEY || 'mock-token'
  }

  /**
   * Verify webhook signature
   */
  private static verifyWebhookSignature(payload: any, signature: string): boolean {
    // Implement signature verification based on Algeria Post documentation
    // This is typically done using HMAC-SHA256 with the merchant secret
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', this.SECRET_KEY)
      .update(JSON.stringify(payload))
      .digest('hex')
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  }

  /**
   * Mock payment creation for development
   */
  private static createMockPayment(request: DahabiaPaymentRequest): DahabiaPaymentResponse {
    const paymentId = `MOCK_${Date.now()}`
    const referenceNumber = `DAH${request.merchantReference}`
    
    return {
      success: true,
      paymentId,
      paymentUrl: `${process.env.FRONTEND_URL}/payment/dahabia/mock?paymentId=${paymentId}`,
      referenceNumber,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      status: 'PENDING'
    }
  }

  /**
   * Mock payment status check for development
   */
  private static getMockPaymentStatus(paymentId: string): DahabiaPaymentResponse {
    // Simulate different payment statuses for testing
    const statuses: Array<'PENDING' | 'AUTHORIZED' | 'CAPTURED'> = ['PENDING', 'AUTHORIZED', 'CAPTURED']
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    
    return {
      success: true,
      paymentId,
      paymentUrl: '',
      referenceNumber: `DAH${paymentId}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      status: randomStatus
    }
  }

  /**
   * Format amount for Dahabia (convert to fils if needed)
   */
  static formatAmount(amount: number): number {
    // Algeria Post might require amounts in fils (1 DZD = 100 fils)
    // This would depend on their API specification
    return Math.round(amount * 100)
  }

  /**
   * Validate Dahabia card number format
   */
  static validateCardNumber(cardNumber: string): boolean {
    // Implement Dahabia card number validation
    // This would follow the specific format rules for Dahabia cards
    const cleaned = cardNumber.replace(/\s+/g, '')
    
    // Basic validation (actual format may differ)
    return /^\d{16}$/.test(cleaned) && this.luhnCheck(cleaned)
  }

  /**
   * Luhn algorithm for card number validation
   */
  private static luhnCheck(cardNumber: string): boolean {
    let sum = 0
    let isEven = false

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }
}

export default DahabiaPaymentService