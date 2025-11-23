import { supabase } from '@/lib/supabaseClient';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
  sku?: string;
  maxStock?: number;
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

export const cartService = {
  async getCart(userId?: string): Promise<Cart | null> {
    if (!userId) return null;

    try {
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!customer) return null;

      const { data: items, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          product:products (
            id,
            name,
            price,
            sku,
            stock_quantity,
            product_images (url)
          )
        `)
        .eq('customer_id', customer.id);

      if (error) throw error;

      const cartItems: CartItem[] = items.map((item: any) => ({
        id: item.id,
        productId: item.product.id,
        quantity: item.quantity,
        price: Number(item.product.price),
        name: item.product.name,
        image: item.product.product_images?.[0]?.url,
        sku: item.product.sku,
        maxStock: item.product.stock_quantity
      }));

      return {
        id: customer.id,
        items: cartItems,
        total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        userId
      };
    } catch (error) {
      console.error('Error fetching cart:', error);
      return null;
    }
  },

  async addToCart(data: AddToCartRequest): Promise<Cart | null> {
    if (!data.userId) return null;

    try {
      // 1. Try to find existing customer
      let { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', data.userId)
        .maybeSingle();

      // 2. If not found, try to create one
      if (!customer) {
        // Fetch user details from Auth to get email
        const { data: { user } } = await supabase.auth.getUser();

        if (user && user.id === data.userId) {
          const { data: newCustomer, error: createError } = await supabase
            .from('customers')
            .insert({
              user_id: data.userId,
              email: user.email,
              // We don't have name/phone here, but they might be optional or updated later
            })
            .select('id')
            .maybeSingle();

          if (createError) {
            console.error('Failed to create customer record:', createError);
            throw new Error('Customer not found and could not be created');
          }
          customer = newCustomer;
        } else {
          throw new Error('Customer not found and user details unavailable');
        }
      }

      if (!customer) throw new Error('Customer not found');

      // Check if item exists
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('customer_id', customer.id)
        .eq('product_id', data.productId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + data.quantity })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            customer_id: customer.id,
            product_id: data.productId,
            quantity: data.quantity
          });
        if (error) throw error;
      }

      return this.getCart(data.userId);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  async updateCartItem(data: UpdateCartItemRequest, userId?: string): Promise<Cart | null> {
    // Note: We need userId to return the full cart, but strictly speaking we update by itemId (cart_item id)
    // However, for security, we should verify ownership if possible, or rely on RLS.
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: data.quantity })
        .eq('id', data.itemId);

      if (error) throw error;

      return userId ? this.getCart(userId) : null;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  async removeCartItem(itemId: string, userId?: string): Promise<Cart | null> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      return userId ? this.getCart(userId) : null;
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  },

  async clearCart(userId?: string): Promise<void> {
    if (!userId) return;
    try {
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!customer) return;

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('customer_id', customer.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  async syncCart(localItems: CartItem[], userId: string): Promise<Cart | null> {
    if (!userId) return null;
    // Strategy: Merge local items into server cart.
    // For simplicity: Add local items to server if they don't exist or update quantity.
    // Then clear local items (handled by store).

    try {
      for (const item of localItems) {
        await this.addToCart({
          userId,
          productId: item.productId,
          quantity: item.quantity
        });
      }
      return this.getCart(userId);
    } catch (error) {
      console.error('Error syncing cart:', error);
      return null;
    }
  },

  async validateCart(items: Array<{ productId: string; quantity: number }>): Promise<{
    success: boolean;
    unavailableItems?: string[];
  }> {
    const unavailableItems: string[] = [];
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.productId)
        .single();

      if (!product || (product.stock_quantity || 0) < item.quantity) {
        unavailableItems.push(item.productId);
      }
    }
    return {
      success: unavailableItems.length === 0,
      unavailableItems
    };
  },

  calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
};

export default cartService;
