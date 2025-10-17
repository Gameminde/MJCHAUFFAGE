// frontend/src/services/paymentService.ts
// 💳 Service de paiement refactorisé avec client API centralisé

import { api, ApiError } from '@/lib/api';

/**
 * Types pour le service de paiement
 */
export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'stripe' | 'bank_transfer';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  clientSecret?: string;
  paymentMethodId?: string;
}

export interface CreatePaymentRequest {
  amount: number;
  currency?: string;
  orderId: string;
  paymentMethodId?: string;
  metadata?: Record<string, any>;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  paymentMethodId?: string;
}

export interface RefundRequest {
  paymentIntentId: string;
  amount?: number; // Montant partiel ou total
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
 * Service de gestion des paiements
 * Gère Stripe, PayPal ou tout autre provider
 */
export const paymentService = {
  /**
   * Crée une intention de paiement
   * @throws {ApiError} Si échec de création
   */
  async createPaymentIntent(data: CreatePaymentRequest): Promise<PaymentIntent> {
    try {
      const response = await api.post<PaymentIntent>('/payments/intent', data);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Échec de création du paiement: ${error.message}`);
      }
      throw error;
    }
  },

  /**
   * Confirme et traite le paiement
   */
  async confirmPayment(data: ConfirmPaymentRequest): Promise<PaymentIntent> {
    const response = await api.post<PaymentIntent>(
      `/payments/${data.paymentIntentId}/confirm`,
      { paymentMethodId: data.paymentMethodId }
    );
    return response.data;
  },

  /**
   * Récupère le statut d'un paiement
   */
  async getPaymentStatus(paymentIntentId: string): Promise<PaymentIntent> {
    const response = await api.get<PaymentIntent>(`/payments/${paymentIntentId}`);
    return response.data;
  },

  /**
   * Annule un paiement en attente
   */
  async cancelPayment(paymentIntentId: string): Promise<PaymentIntent> {
    const response = await api.post<PaymentIntent>(
      `/payments/${paymentIntentId}/cancel`
    );
    return response.data;
  },

  /**
   * Crée un remboursement
   */
  async refundPayment(data: RefundRequest): Promise<{ success: boolean; refundId: string }> {
    const response = await api.post<{ success: boolean; refundId: string }>(
      `/payments/${data.paymentIntentId}/refund`,
      {
        amount: data.amount,
        reason: data.reason,
      }
    );
    return response.data;
  },

  /**
   * Liste les moyens de paiement enregistrés
   */
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    const response = await api.get<PaymentMethod[]>('/payments/methods', {
      params: { userId },
    });
    return response.data;
  },

  /**
   * Ajoute un nouveau moyen de paiement
   */
  async addPaymentMethod(data: {
    userId: string;
    paymentMethodId: string;
    setAsDefault?: boolean;
  }): Promise<PaymentMethod> {
    const response = await api.post<PaymentMethod>('/payments/methods', data);
    return response.data;
  },

  /**
   * Supprime un moyen de paiement
   */
  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    await api.delete(`/payments/methods/${paymentMethodId}`);
  },

  /**
   * Définit un moyen de paiement par défaut
   */
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    const response = await api.patch<PaymentMethod>(
      `/payments/methods/${paymentMethodId}/default`
    );
    return response.data;
  },

  /**
   * Récupère l'historique des paiements
   */
  async getPaymentHistory(userId: string, limit = 10): Promise<PaymentHistory[]> {
    const response = await api.get<PaymentHistory[]>('/payments/history', {
      params: { userId, limit },
    });
    return response.data;
  },

  /**
   * Vérifie si un code promo est valide et calcule la réduction
   */
  async validatePromoCode(code: string, amount: number): Promise<{
    valid: boolean;
    discount: number;
    finalAmount: number;
  }> {
    const response = await api.post<{
      valid: boolean;
      discount: number;
      finalAmount: number;
    }>('/payments/promo/validate', { code, amount });
    return response.data;
  },

  /**
   * Webhook handler (côté client pour mise à jour UI)
   * À utiliser avec WebSockets ou polling pour les updates en temps réel
   */
  async subscribeToPaymentUpdates(
    paymentIntentId: string,
    callback: (status: PaymentIntent['status']) => void
  ): Promise<() => void> {
    // Polling simple (peut être remplacé par WebSocket)
    const interval = setInterval(async () => {
      try {
        const payment = await this.getPaymentStatus(paymentIntentId);
        callback(payment.status);
        
        // Arrête le polling si paiement terminé
        if (['succeeded', 'failed', 'cancelled'].includes(payment.status)) {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Erreur polling paiement:', error);
      }
    }, 3000); // Poll toutes les 3 secondes

    // Retourne une fonction de nettoyage
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
  }).format(amount / 100); // Montants en centimes
}

/**
 * Helper pour masquer les numéros de carte
 */
export function maskCardNumber(cardNumber: string): string {
  return `**** **** **** ${cardNumber.slice(-4)}`;
}

export default paymentService;
