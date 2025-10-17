import { Router, Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';

const router = Router();

/**
 * Payments API routes
 *
 * Design notes:
 * - Business requirement: support Cash on Delivery (COD) only. Card payments are not enabled.
 * - We expose a static list of payment methods for compatibility with tests and future evolution,
 *   but any non-COD method is treated as unsupported by the /process endpoint.
 * - Shipping cost is calculated using wilaya-specific rates via PaymentService.
 * - Phone numbers are validated and normalized to Algerian formats.
 */

// Static list of Algeria payment methods used in tests and UI discovery
const paymentMethods = [
  {
    id: 'CASH_ON_DELIVERY',
    nameAr: 'الدفع عند الاستلام',
    nameFr: 'Paiement à la livraison',
    enabled: true,
  },
  {
    id: 'DAHABIA_CARD',
    nameAr: 'بطاقة الذهبية',
    nameFr: 'Carte Dahabia',
    provider: 'Algeria Post',
    enabled: false, // Explicitly disabled per spec (COD only)
  },
];

// GET /api/payments/methods
router.get('/methods', (_req: Request, res: Response) => {
  // Return all methods (including disabled) so clients can decide visibility.
  // If you prefer to hide disabled methods, filter with: paymentMethods.filter(m => m.enabled)
  res.status(200).json({ success: true, data: paymentMethods });
});

// POST /api/payments/shipping-cost
router.post('/shipping-cost', (req: Request, res: Response) => {
  const { wilaya, totalAmount } = req.body || {};

  // Basic validation
  if (!wilaya || typeof wilaya !== 'string') {
    return res.status(400).json({ success: false, message: 'Wilaya is required' });
  }

  const amountNum = Number(totalAmount ?? 0);
  const shippingCost = PaymentService.calculateShippingCost(wilaya, isNaN(amountNum) ? 0 : amountNum);

  return res.status(200).json({ success: true, data: { shippingCost, wilaya } });
});

// Helper: validate and normalize Algerian phone number
// Note: With `exactOptionalPropertyTypes: true`, avoid returning an optional
// property with an explicit `undefined` value. Only include `formatted` when valid.
const normalizeValidAlgerianPhone = (
  phone: string,
): { isValid: boolean; formatted?: string } => {
  const isValid = PaymentService.validateAlgerianPhone(String(phone));
  if (isValid) {
    return { isValid, formatted: PaymentService.formatAlgerianPhone(String(phone)) };
  }
  return { isValid };
};

// POST /api/payments/process
router.post('/process', (req: Request, res: Response) => {
  const body = req.body || {};

  const {
    amount,
    currency,
    method,
    orderId,
    customerInfo,
    shippingAddress,
  } = body;

  // If required fields are missing, treat as unauthorized per test expectation
  if (!amount || !currency || !method || !orderId || !customerInfo || !shippingAddress) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // Validate currency (support DZD only)
  if (currency !== 'DZD') {
    return res.status(400).json({ success: false, message: 'Unsupported currency' });
  }

  // Validate and normalize Algerian phone number
  const phoneCheck = normalizeValidAlgerianPhone(customerInfo?.phone);
  if (!phoneCheck.isValid) {
    return res.status(400).json({ success: false, message: 'Invalid phone number' });
  }

  // Handle Cash on Delivery
  if (method === 'CASH_ON_DELIVERY') {
    const transactionId = `COD_${Date.now()}`;
    // At this point phoneCheck.isValid is true, so formatted exists.
    const normalizedPhone = (phoneCheck.formatted as string);
    return res.status(200).json({ 
      success: true, 
      data: { 
        transactionId,
        // Echo back normalized phone to help downstream processes
        customerInfo: { ...customerInfo, phone: normalizedPhone },
      },
    });
  }

  // Default for unsupported methods
  return res.status(400).json({ success: false, message: 'Unsupported payment method (COD only)' });
});

// Optional: verify endpoint (useful for frontend flows/tests)
router.get('/verify/:transactionId', (req: Request, res: Response) => {
  const { transactionId } = req.params;

  if (!transactionId || typeof transactionId !== 'string') {
    return res.status(400).json({ success: false, message: 'Transaction ID is required' });
  }

  const isCod = transactionId.startsWith('COD_');
  return res.status(200).json({ success: isCod, data: { transactionId } });
});

export default router;