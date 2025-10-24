export const PAYMENT_CONFIG = {
  METHODS_ENABLED: ['CASH_ON_DELIVERY'], // Only Cash on Delivery
  PROCESSING_ENABLED: false,
  CARD_PAYMENTS_ENABLED: false,
  STRIPE_ENABLED: false,
  DAHABIA_ENABLED: false,
} as const;

export function isPaymentMethodEnabled(method: string | undefined): boolean {
  if (!method) return false;
  return PAYMENT_CONFIG.METHODS_ENABLED.some((m) => m === method);
}
