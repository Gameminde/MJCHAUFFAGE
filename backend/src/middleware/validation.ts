import { Request, Response, NextFunction } from 'express'

export const validatePaymentRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { amount, currency, method, orderId, customerInfo, shippingAddress } = req.body
  const errors: string[] = []

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    errors.push('Valid amount is required')
  }

  if (currency !== 'DZD') {
    errors.push('Currency must be DZD')
  }

  if (!method || !['CASH_ON_DELIVERY', 'DAHABIA_CARD'].includes(method)) {
    errors.push('Valid payment method is required')
  }

  if (!orderId || typeof orderId !== 'string') {
    errors.push('Valid order ID is required')
  }

  if (!customerInfo || typeof customerInfo !== 'object') {
    errors.push('Customer information is required')
  }

  if (!shippingAddress || typeof shippingAddress !== 'object') {
    errors.push('Shipping address is required')
  }

  if (method === 'DAHABIA_CARD') {
    const { cardData } = req.body
    if (!cardData || typeof cardData !== 'object') {
      errors.push('Card data is required for Dahabia payments')
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, error: 'Validation failed', details: errors })
    return
  }

  next()
}

export const validateVerificationRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { transactionId } = req.params

  if (!transactionId || typeof transactionId !== 'string') {
    res.status(400).json({ success: false, error: 'Valid transaction ID is required' })
    return
  }

  next()
}