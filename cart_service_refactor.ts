// frontend/src/services/cartService.ts
// 🛒 Service panier refactorisé avec client API centralisé

import { api } from '@/lib/api';

/**
 * Types pour le service panier
 */
export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  userId?: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  userId?: string;
}

export interface UpdateCartItemRequest {
  itemId: string;
  quantity: number;
}

/**
 * Service de gestion du panier
 * Utilise le client API centralisé (@/lib/api)
 */
export const cartService = {
  /**
   * Récupère le panier actuel
   */
  async getCart(userId?: string): Promise<Cart> {
    const params = userId ? { userId } : undefined;
    const response = await api.get<Cart>('/cart', { params });
    return response.data;
  },

  /**
   * Ajoute un produit au panier
   */
  async addToCart(data: AddToCartRequest): Promise<Cart> {
    const response = await api.post<Cart>('/cart/items', data);
    return response.data;
  },

  /**
   * Met à jour la quantité d'un article
   */
  async updateCartItem(data: UpdateCartItemRequest): Promise<Cart> {
    const { itemId, ...payload } = data;
    const response = await api.patch<Cart>(`/cart/items/${itemId}`, payload);
    return response.data;
  },

  /**
   * Supprime un article du panier
   */
  async removeCartItem(itemId: string): Promise<Cart> {
    const response = await api.delete<Cart>(`/cart/items/${itemId}`);
    return response.data;
  },

  /**
   * Vide le panier
   */
  async clearCart(userId?: string): Promise<void> {
    const params = userId ? { userId } : undefined;
    await api.delete('/cart', { params });
  },

  /**
   * Synchronise le panier local avec le serveur
   * Utile après connexion ou pour réconcilier panier invité
   */
  async syncCart(localItems: CartItem[], userId: string): Promise<Cart> {
    const response = await api.post<Cart>('/cart/sync', {
      items: localItems,
      userId,
    });
    return response.data;
  },

  /**
   * Calcule le total du panier
   * (peut être fait côté client ou serveur selon votre logique)
   */
  calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
};

/**
 * Hook React pour gérer le panier (optionnel)
 * Exemple d'utilisation avec le client API
 */
export function useCart() {
  // À implémenter selon votre state management (Redux, Zustand, React Query, etc.)
  // Exemple avec React Query:
  /*
  const { data: cart, isLoading, error, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
  });

  const addToCart = useMutation({
    mutationFn: cartService.addToCart,
    onSuccess: () => refetch(),
  });

  return { cart, isLoading, error, addToCart };
  */
}

export default cartService;
