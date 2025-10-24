interface PaymentRequest {
  amount: number
  currency: 'DZD'
  orderId: string
  customerInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  shippingAddress: {
    address: string
    city: string
    wilaya: string
    postalCode?: string
  }
}

interface DahabiaPaymentRequest extends PaymentRequest {
  cardData: {
    cardNumber: string
    expiryDate: string
    cvv: string
    cardHolder: string
  }
}

interface PaymentResponse {
  success: boolean
  transactionId?: string
  message?: string
  redirectUrl?: string
  error?: string
}

export class PaymentService {
  // Cash on Delivery payment processing
  static async processCashOnDelivery(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Validate phone number (Algerian format)
      if (!this.validateAlgerianPhone(request.customerInfo.phone)) {
        return {
          success: false,
          error: 'Invalid Algerian phone number format'
        }
      }

      // Generate transaction ID for COD
      const transactionId = `COD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1000))

      return {
        success: true,
        transactionId,
        message: 'Cash on Delivery order confirmed',
        redirectUrl: `/order-confirmation/${transactionId}`
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to process Cash on Delivery payment'
      }
    }
  }

  // Dahabia Card payment processing
  static async processDahabiaPayment(request: DahabiaPaymentRequest): Promise<PaymentResponse> {
    try {
      // Validate card data
      const cardValidation = this.validateDahabiaCard(request.cardData)
      if (!cardValidation.isValid) {
        return {
          success: false,
          error: cardValidation.errors.join(', ')
        }
      }

      // Validate phone number
      if (!this.validateAlgerianPhone(request.customerInfo.phone)) {
        return {
          success: false,
          error: 'Invalid Algerian phone number format'
        }
      }

      // Generate transaction ID for Dahabia
      const transactionId = `DAH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Simulate Algeria Post Dahabia gateway integration
      const gatewayResponse = await this.callDahabiaGateway({
        ...request,
        transactionId
      })

      if (gatewayResponse.success) {
        return {
          success: true,
          transactionId,
          message: 'Dahabia payment processed successfully',
          redirectUrl: `/payment-success/${transactionId}`
        }
      } else {
        return {
          success: false,
          error: gatewayResponse.error || 'Dahabia payment failed'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to process Dahabia payment'
      }
    }
  }

  // Simulate Algeria Post Dahabia gateway call
  private static async callDahabiaGateway(request: DahabiaPaymentRequest & { transactionId: string }): Promise<PaymentResponse> {
    // This would be the actual integration with Algeria Post's Dahabia gateway
    // For now, we simulate the process
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simulate random success/failure (90% success rate for demo)
      const isSuccess = Math.random() > 0.1

      if (isSuccess) {
        return {
          success: true,
          transactionId: request.transactionId,
          message: 'Payment authorized by Algeria Post'
        }
      } else {
        return {
          success: false,
          error: 'Payment declined by Algeria Post'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Gateway communication error'
      }
    }
  }

  // Verify Dahabia payment with Algeria Post
  static async verifyDahabiaPayment(transactionId: string): Promise<PaymentResponse> {
    try {
      // Simulate gateway verification call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In real implementation, this would call Algeria Post verification API
      const isVerified = transactionId.startsWith('DAH_')

      return {
        success: isVerified,
        transactionId,
        message: isVerified ? 'Payment verified' : 'Payment verification failed'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Payment verification failed'
      }
    }
  }

  // Validate Dahabia card data
  static validateDahabiaCard(cardData: DahabiaPaymentRequest['cardData']): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validate card number (16 digits)
    const cardNumber = cardData.cardNumber.replace(/\s/g, '')
    if (!/^\d{16}$/.test(cardNumber)) {
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

  // Validate Algerian phone numbers
  static validateAlgerianPhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '')
    
    // Algerian mobile patterns
    const patterns = [
      /^213[567]\d{8}$/, // +213 format
      /^0[567]\d{8}$/, // 0X format
      /^[567]\d{8}$/, // Without prefix
    ]

    return patterns.some(pattern => pattern.test(cleaned))
  }

  // Format Algerian phone numbers
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

  // Calculate shipping costs for Algerian wilayas
  static calculateShippingCost(wilaya: string, totalAmount: number): number {
    const shippingRates: Record<string, number> = {
      'Adrar': 1200,
      'Chlef': 800,
      'Laghouat': 1000,
      'Oum El Bouaghi': 900,
      'Batna': 950,
      'Béjaïa': 700,
      'Biskra': 1000,
      'Béchar': 1400,
      'Blida': 600,
      'Bouira': 700,
      'Tamanrasset': 2000,
      'Tébessa': 1100,
      'Tlemcen': 950,
      'Tiaret': 850,
      'Tizi Ouzou': 650,
      'Alger': 500, // Capital - lowest shipping
      'Djelfa': 900,
      'Jijel': 800,
      'Sétif': 800,
      'Saïda': 950,
      'Skikda': 850,
      'Sidi Bel Abbès': 900,
      'Annaba': 900,
      'Guelma': 950,
      'Constantine': 800,
      'Médéa': 700,
      'Mostaganem': 850,
      'MSila': 900,
      'Mascara': 900,
      'Ouargla': 1300,
      'Oran': 850,
      'El Bayadh': 1100,
      'Illizi': 2200,
      'Bordj Bou Arréridj': 850,
      'Boumerdès': 650,
      'El Tarf': 1000,
      'Tindouf': 2500,
      'Tissemsilt': 900,
      'El Oued': 1200,
      'Khenchela': 1000,
      'Souk Ahras': 1000,
      'Tipaza': 700,
      'Mila': 900,
      'Aïn Defla': 750,
      'Naâma': 1200,
      'Aïn Témouchent': 900,
      'Ghardaïa': 1100,
      'Relizane': 850
    }

    const baseCost = shippingRates[wilaya] || 1000 // Default for unlisted areas

    // Free shipping for orders above 50,000 DZD
    if (totalAmount >= 50000) {
      return 0
    }

    return baseCost
  }

  // Format currency for Algeria
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

  // Generate payment summary
  static generatePaymentSummary(
    subtotal: number,
    wilaya: string,
    paymentMethod: string,
    locale: 'ar' | 'fr' = 'ar'
  ) {
    const shippingCost = this.calculateShippingCost(wilaya, subtotal)
    const total = subtotal + shippingCost

    return {
      subtotal: this.formatCurrency(subtotal, locale),
      shipping: this.formatCurrency(shippingCost, locale),
      total: this.formatCurrency(total, locale),
      freeShippingThreshold: this.formatCurrency(50000, locale),
      isFreeShipping: subtotal >= 50000,
      paymentMethod,
      wilaya
    }
  }
}