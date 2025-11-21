export const PAYMENT_CONFIG = {
  METHODS_ENABLED: ['CASH_ON_DELIVERY'], // Only cash on delivery for Algeria
  PROCESSING_ENABLED: process.env.NODE_ENV === 'test' || process.env.PAYMENT_PROCESSING_ENABLED === 'true',
  CARD_PAYMENTS_ENABLED: false, // No card payments
  STRIPE_ENABLED: false, // Not applicable
  DAHABIA_ENABLED: false, // No bank account integration
  CASH_ON_DELIVERY_ONLY: true, // Algeria-specific payment method
  TEST_MODE: process.env.NODE_ENV === 'test' || process.env.PAYMENT_TEST_MODE === 'true',
} as const;

export function isPaymentMethodEnabled(method: string | undefined): boolean {
  if (!method) return false;
  return PAYMENT_CONFIG.METHODS_ENABLED.some((m) => m === method);
}
