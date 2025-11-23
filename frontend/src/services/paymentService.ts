import { PaymentMethod, DahabiaCardData, PaymentRequest, PaymentResponse } from '@/types/payment'

const ENABLE_PAYMENTS = true
const ENABLE_CARD_PAYMENTS = false

class PaymentService {
  static PAYMENT_METHODS: PaymentMethod[] = [
    {
      id: 'CASH_ON_DELIVERY',
      name: 'Cash on Delivery',
      nameAr: 'الدفع عند الاستلام',
      nameFr: 'Paiement à la livraison',
      description: 'Pay when you receive your order',
      enabled: true,
      fees: 0,
    },
    {
      id: 'DAHABIA_CARD',
      name: 'Dahabia Card',
      nameAr: 'بطاقة الذهبية',
      nameFr: 'Carte Dahabia',
      description: 'Algeria Post electronic payment card',
      enabled: ENABLE_CARD_PAYMENTS,
      fees: 0,
      provider: 'Algeria Post',
    },
  ]

  static getPaymentMethods(): PaymentMethod[] {
    return this.PAYMENT_METHODS.filter(method => method.enabled)
  }

  static getPaymentMethod(id: string): PaymentMethod | undefined {
    return this.PAYMENT_METHODS.find(method => method.id === id)
  }

  static formatCurrency(amount: number, locale: 'ar' | 'fr' = 'ar'): string {
    const formatter = new Intl.NumberFormat(
      locale === 'ar' ? 'ar-DZ' : 'fr-DZ',
      {
        style: 'currency',
        currency: 'DZD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )

    return formatter.format(amount)
  }

  static validateDahabiaCard(cardData: DahabiaCardData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validate card number (16 digits)
    if (!/^\d{16}$/.test(cardData.cardNumber.replace(/\s/g, ''))) {
      errors.push('Card number must be 16 digits')
    }

    // Validate expiry date (MM/YY format)
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardData.expiryDate)) {
      errors.push('Expiry date must be in MM/YY format')
    } else {
      const [month, year] = cardData.expiryDate.split('/')
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1)
      if (expiryDate < new Date()) {
        errors.push('Card has expired')
      }
    }

    // Validate CVV (3 digits)
    if (!/^\d{3}$/.test(cardData.cvv)) {
      errors.push('CVV must be 3 digits')
    }

    // Validate card holder name
    if (!cardData.cardHolder.trim() || cardData.cardHolder.length < 2) {
      errors.push('Card holder name is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static validateAlgerianPhone(phone: string): boolean {
    // Algerian mobile phone patterns
    const patterns = [
      /^\+213[567]\d{8}$/, // International format
      /^0[567]\d{8}$/, // National format
      /^[567]\d{8}$/, // Without leading zero
    ]

    return patterns.some(pattern => pattern.test(phone.replace(/\s/g, '')))
  }

  static formatAlgerianPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '')

    if (cleaned.startsWith('213')) {
      return `+${cleaned}`
    } else if (cleaned.startsWith('0')) {
      return `+213${cleaned.slice(1)}`
    } else if (cleaned.length === 9) {
      return `+213${cleaned}`
    }

    return phone
  }

  static async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      if (!ENABLE_PAYMENTS) {
        return { success: false, error: 'Payments disabled' }
      }
      // Validate payment method
      const method = this.getPaymentMethod(paymentRequest.method)
      if (!method) {
        return {
          success: false,
          error: 'Invalid payment method'
        }
      }

      // Validate Dahabia card if needed
      if (paymentRequest.method === 'DAHABIA_CARD' && !ENABLE_CARD_PAYMENTS) {
        return { success: false, error: 'Payment method disabled' }
      }
      if (paymentRequest.method === 'DAHABIA_CARD' && paymentRequest.cardData) {
        const validation = this.validateDahabiaCard(paymentRequest.cardData)
        if (!validation.isValid) {
          return {
            success: false,
            error: validation.errors.join(', ')
          }
        }
      }

      // Validate phone number
      if (!this.validateAlgerianPhone(paymentRequest.customerInfo.phone)) {
        return {
          success: false,
          error: 'Invalid Algerian phone number'
        }
      }

      // Mock payment processing for serverless
      // In a real serverless setup, you might call a Supabase Edge Function here
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            transactionId: `TXN_${Date.now()}`,
            message: 'Payment processed successfully',
          });
        }, 1000);
      });

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      }
    }
  }

  static async verifyPayment(transactionId: string): Promise<PaymentResponse> {
    try {
      if (!ENABLE_PAYMENTS) {
        return { success: false, error: 'Payments disabled' }
      }

      // Mock verification
      return {
        success: true,
        transactionId,
        message: 'Payment verified'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment verification failed'
      }
    }
  }

  // Algeria Post Dahabia specific methods
  static async initiateDahabiaPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    // This would integrate with Algeria Post's Dahabia payment gateway
    // For now, we simulate the process
    return {
      success: true,
      transactionId: `DAH_${Date.now()}`,
      message: 'Payment initiated successfully',
      redirectUrl: `/payment/dahabia/confirm`
    }
  }

  static generateOrderReference(orderId: string): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `MJC-${orderId}-${timestamp}-${random}`.toUpperCase()
  }

  // Shipping costs calculation for Algerian wilayas
  static calculateShippingCost(wilaya: string, totalAmount: number): number {
    const shippingRates: Record<string, number> = {
      'Alger': 500,
      'Blida': 600,
      'Boumerdès': 650,
      'Tipaza': 700,
      'Constantine': 800,
      'Oran': 850,
      'Annaba': 900,
      'Batna': 950,
      'Sétif': 800,
      'Tlemcen': 950,
      // Add more wilayas as needed
    }

    const baseCost = shippingRates[wilaya] || 1000 // Default for unlisted wilayas

    // Free shipping for orders above 50,000 DZD
    if (totalAmount >= 50000) {
      return 0
    }

    return baseCost
  }

  // Generate payment summary for display
  static generatePaymentSummary(
    subtotal: number,
    shippingCost: number,
    paymentMethod: string,
    locale: 'ar' | 'fr' = 'ar'
  ) {
    const total = subtotal + shippingCost
    const method = this.getPaymentMethod(paymentMethod)

    return {
      subtotal: this.formatCurrency(subtotal, locale),
      shipping: this.formatCurrency(shippingCost, locale),
      total: this.formatCurrency(total, locale),
      paymentMethodName: method ? (locale === 'ar' ? method.nameAr : method.nameFr) : paymentMethod,
      freeShippingThreshold: this.formatCurrency(50000, locale)
    }
  }

  // Promise-based wrapper to match UI expectations
  static async getShippingCost(wilaya: string, totalAmount: number): Promise<number> {
    return this.calculateShippingCost(wilaya, totalAmount)
  }

  // Refund payment helper used by admin orders service
  static async refundPayment(params: { paymentIntentId: string; amount?: number; reason?: string }): Promise<{ refundId: string }> {
    // Mock refund
    return { refundId: `RFND_${Date.now()}` }
  }
}

export default PaymentService