const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface CartSyncData {
  items: Array<{
    productId: string
    quantity: number
  }>
}

export interface CartValidationResult {
  valid: boolean
  errors: Array<{
    productId: string
    message: string
    availableStock: number
  }>
}

class CartService {
  /**
   * Validate cart items against current stock
   */
  static async validateCart(items: CartSyncData['items']): Promise<CartValidationResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      })

      if (response.ok) {
        const result = await response.json()
        return result.data
      }

      // Fallback validation - check each product individually
      const errors: CartValidationResult['errors'] = []
      
      for (const item of items) {
        try {
          const productResponse = await fetch(`${API_BASE_URL}/api/products/${item.productId}`)
          if (productResponse.ok) {
            const productResult = await productResponse.json()
            if (productResult.success && productResult.data.product) {
              const availableStock = productResult.data.product.stockQuantity
              if (item.quantity > availableStock) {
                errors.push({
                  productId: item.productId,
                  message: `Stock insuffisant. Disponible: ${availableStock}`,
                  availableStock
                })
              }
            }
          }
        } catch (error) {
          console.error(`Error validating product ${item.productId}:`, error)
        }
      }

      return {
        valid: errors.length === 0,
        errors
      }
    } catch (error) {
      console.error('Error validating cart:', error)
      return {
        valid: true, // Assume valid if validation fails
        errors: []
      }
    }
  }

  /**
   * Sync cart with user session (for logged-in users)
   */
  static async syncCart(items: CartSyncData['items'], userId?: string): Promise<boolean> {
    if (!userId) return true // Skip sync for guest users

    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      
      const response = await fetch(`${API_BASE_URL}/api/cart/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ items }),
      })

      return response.ok
    } catch (error) {
      console.error('Error syncing cart:', error)
      return false
    }
  }

  /**
   * Get cart from server (for logged-in users)
   */
  static async getServerCart(userId: string): Promise<CartSyncData['items'] | null> {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      
      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      })

      if (response.ok) {
        const result = await response.json()
        return result.data.items
      }

      return null
    } catch (error) {
      console.error('Error getting server cart:', error)
      return null
    }
  }

  /**
   * Clear cart on server (for logged-in users)
   */
  static async clearServerCart(userId: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      
      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      })

      return response.ok
    } catch (error) {
      console.error('Error clearing server cart:', error)
      return false
    }
  }

  /**
   * Get product details for cart items
   */
  static async getCartProductDetails(productIds: string[]): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds }),
      })

      if (response.ok) {
        const result = await response.json()
        return result.data.products || []
      }

      return []
    } catch (error) {
      console.error('Error getting cart product details:', error)
      return []
    }
  }
}

export default CartService