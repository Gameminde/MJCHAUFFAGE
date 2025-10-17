// frontend/src/services/paymentService.ts
// 💳 Service de paiement refactorisé pour paiement à la livraison (Cash on Delivery)

import { api, ApiError } from '@/lib/api';

/**
 * Types pour le service de paiement (COD)
 */
export interface PaymentMethod {
  id: string;
  type: 'cash_on_delivery';
  isDefault: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'failed' | 'cancelled' | 'succeeded';
  paymentMethodId?: string;
}

export interface CreatePaymentRequest {
  amount: number;
  currency?: string;
  orderId: string;
  metadata?: Record<string, any>;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
}

export interface RefundRequest {
  paymentIntentId: string;
  amount?: number;
  reason?: string;
}

export interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  orderId: string;
  paymentMethod?: string;
}

/**
 * Service de gestion des paiements (Cash on Delivery)
 * Implémente une API simple compatible avec l’interface existante.
 */
export const paymentService = {
  /**
   * Crée une intention de paiement COD
   * @throws {ApiError} Si échec de création
   */
  async createPaymentIntent(data: CreatePaymentRequest): Promise<PaymentIntent> {
    try {
      const result = await api.post<{ success: boolean; data: PaymentIntent }>(
        '/payments/intent',
        { ...data, type: 'cash_on_delivery' }
      );
      return result.data as PaymentIntent;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Échec de création du paiement COD: ${error.message}`);
      }
      throw error;
    }
  },

  /**
   * Confirme le paiement COD (validation de commande)
   */
  async confirmPayment(data: ConfirmPaymentRequest): Promise<PaymentIntent> {
    const result = await api.post<{ success: boolean; data: PaymentIntent }>(
      `/payments/${data.paymentIntentId}/confirm`,
      { type: 'cash_on_delivery' }
    );
    return result.data as PaymentIntent;
  },

  /**
   * Récupère le statut d’un paiement COD
   */
  async getPaymentStatus(paymentIntentId: string): Promise<PaymentIntent> {
    const result = await api.get<{ success: boolean; data: PaymentIntent }>(
      `/payments/${paymentIntentId}`
    );
    return result.data as PaymentIntent;
  },

  /**
   * Annule un paiement en attente
   */
  async cancelPayment(paymentIntentId: string): Promise<PaymentIntent> {
    const result = await api.post<{ success: boolean; data: PaymentIntent }>(
      `/payments/${paymentIntentId}/cancel`
    );
    return result.data as PaymentIntent;
  },

  /**
   * Crée un remboursement (si votre logique le permet)
   */
  async refundPayment(data: RefundRequest): Promise<{ success: boolean; refundId: string }> {
    const result = await api.post<{
      success: boolean;
      data: { success: boolean; refundId: string };
    }>(
      `/payments/${data.paymentIntentId}/refund`,
      {
        amount: data.amount,
        reason: data.reason,
        type: 'cash_on_delivery',
      }
    );
    return result.data as { success: boolean; refundId: string };
  },

  /**
   * Liste les moyens de paiement (uniquement COD)
   */
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    // Retourne un seul moyen de paiement COD
    return [
      {
        id: `cod-${userId}`,
        type: 'cash_on_delivery',
        isDefault: true,
      },
    ];
  },

  /**
   * Ajoute un moyen de paiement (COD fixe)
   */
  async addPaymentMethod(data: { userId: string; setAsDefault?: boolean }): Promise<PaymentMethod> {
    return {
      id: `cod-${data.userId}`,
      type: 'cash_on_delivery',
      isDefault: data.setAsDefault ?? true,
    };
  },

  /**
   * Supprime un moyen de paiement (no-op pour COD)
   */
  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    // Pas d’action nécessaire pour COD
    return;
  },

  /**
   * Définit le moyen de paiement par défaut (toujours COD)
   */
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    return {
      id: paymentMethodId,
      type: 'cash_on_delivery',
      isDefault: true,
    };
  },

  /**
   * Coût d'expédition selon la région et le montant
   */
  async getShippingCost(region: string, amount: number): Promise<number> {
    try {
      const result = await api.get<{ success: boolean; data: number }>(
        `/shipping/cost?region=${encodeURIComponent(region)}&amount=${amount}`
      );
      return typeof result.data === 'number' ? result.data : 0;
    } catch {
      return 0;
    }
  },

  /**
   * Historique des paiements (si supporté côté backend)
   */
  async getPaymentHistory(userId: string, limit = 10): Promise<PaymentHistory[]> {
    const result = await api.get<{ success: boolean; data: PaymentHistory[] }>(
      `/payments/history?userId=${encodeURIComponent(userId)}&limit=${limit}`
    );
    return result.data ?? [];
  },

  /**
   * Vérifie un code promo
   */
  async validatePromoCode(code: string, amount: number): Promise<{
    valid: boolean;
    discount: number;
    finalAmount: number;
  }> {
    const result = await api.post<{
      success: boolean;
      data: { valid: boolean; discount: number; finalAmount: number };
    }>(
      '/payments/promo/validate',
      { code, amount }
    );
    return result.data as { valid: boolean; discount: number; finalAmount: number };
  },

  /**
   * Abonnement aux mises à jour de paiement (polling simple)
   */
  async subscribeToPaymentUpdates(
    paymentIntentId: string,
    callback: (status: PaymentIntent['status']) => void
  ): Promise<() => void> {
    const interval = setInterval(async () => {
      try {
        const payment = await this.getPaymentStatus(paymentIntentId);
        callback(payment.status);

        if (['succeeded', 'failed', 'cancelled', 'delivered'].includes(payment.status)) {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Erreur polling paiement COD:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  },
};

/**
 * Helper pour formatter les montants
 */
export function formatAmount(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount / 100);
}

/**
 * Helper pour masquer les numéros de carte (non pertinent pour COD, conservé pour compat)
 */
export function maskCardNumber(cardNumber: string): string {
  return `**** **** **** ${cardNumber.slice(-4)}`;
}

export default paymentService;
