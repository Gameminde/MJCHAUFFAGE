import { prisma } from '@/lib/database';
// RealtimeService removed - cart updates don't need real-time notifications

interface CartItem {
  productId: string;
  quantity: number;
}

interface CartValidationResult {
  valid: boolean;
  errors: Array<{
    productId: string;
    message: string;
    availableStock: number;
  }>;
}

export class CartService {
  /**
   * Validate cart items against current stock
   */
  static async validateCartItems(items: CartItem[]): Promise<CartValidationResult> {
    const errors: CartValidationResult['errors'] = [];

    for (const item of items) {
      try {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { stockQuantity: true, name: true, isActive: true }
        });

        if (!product) {
          errors.push({
            productId: item.productId,
            message: 'Product not found',
            availableStock: 0
          });
          continue;
        }

        if (!product.isActive) {
          errors.push({
            productId: item.productId,
            message: 'Product is no longer available',
            availableStock: 0
          });
          continue;
        }

        if (item.quantity > product.stockQuantity) {
          errors.push({
            productId: item.productId,
            message: `Insufficient stock. Available: ${product.stockQuantity}`,
            availableStock: product.stockQuantity
          });
        }
      } catch (error) {
        console.error(`Error validating product ${item.productId}:`, error);
        errors.push({
          productId: item.productId,
          message: 'Error validating product',
          availableStock: 0
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get user's cart from database
   */
  static async getUserCart(userId: string) {
    const customer = await prisma.customer.findUnique({
      where: { userId },
      include: {
        cartItems: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { sortOrder: 'asc' },
                  take: 1
                },
                category: {
                  select: { name: true }
                }
              }
            }
          }
        }
      }
    });

    if (!customer) {
      return { items: [], total: 0, itemCount: 0 };
    }

    const items = customer.cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      price: item.product.salePrice || item.product.price,
      quantity: item.quantity,
      image: item.product.images[0]?.url || null,
      sku: item.product.sku,
      maxStock: item.product.stockQuantity,
      category: item.product.category?.name
    }));

    const total = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return { items, total, itemCount };
  }

  /**
   * Sync user's cart with provided items
   */
  static async syncUserCart(userId: string, items: CartItem[]) {
    return prisma.$transaction(async (tx) => {
      // Get or create customer
      let customer = await tx.customer.findUnique({
        where: { userId }
      });

      if (!customer) {
        const user = await tx.user.findUnique({
          where: { id: userId }
        });

        if (!user) {
          throw new Error('User not found');
        }

        customer = await tx.customer.create({
          data: {
            userId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          }
        });
      }

      // Clear existing cart items
      await tx.cartItem.deleteMany({
        where: { customerId: customer.id }
      });

      // Validate and add new items
      const validation = await this.validateCartItems(items);
      if (!validation.valid) {
        throw new Error(`Cart validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      // Add new cart items
      for (const item of items) {
        await tx.cartItem.create({
          data: {
            customerId: customer.id,
            productId: item.productId,
            quantity: item.quantity
          }
        });
      }

      // Return updated cart
      return this.getUserCart(userId);
    });
  }

  /**
   * Clear user's cart
   */
  static async clearUserCart(userId: string) {
    const customer = await prisma.customer.findUnique({
      where: { userId }
    });

    if (customer) {
      await prisma.cartItem.deleteMany({
        where: { customerId: customer.id }
      });

      // Cart cleared successfully
    }
  }

  /**
   * Add item to user's cart
   */
  static async addItemToCart(userId: string, productId: string, quantity: number) {
    return prisma.$transaction(async (tx) => {
      // Get or create customer
      let customer = await tx.customer.findUnique({
        where: { userId }
      });

      if (!customer) {
        const user = await tx.user.findUnique({
          where: { id: userId }
        });

        if (!user) {
          throw new Error('User not found');
        }

        customer = await tx.customer.create({
          data: {
            userId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          }
        });
      }

      // Validate product and stock
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { stockQuantity: true, isActive: true, name: true }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      if (!product.isActive) {
        throw new Error('Product is not available');
      }

      // Check existing cart item
      const existingItem = await tx.cartItem.findUnique({
        where: {
          customerId_productId: {
            customerId: customer.id,
            productId
          }
        }
      });

      const totalQuantity = (existingItem?.quantity || 0) + quantity;

      if (totalQuantity > product.stockQuantity) {
        throw new Error(`Insufficient stock. Available: ${product.stockQuantity}, requested: ${totalQuantity}`);
      }

      // Create or update cart item
      const cartItem = await tx.cartItem.upsert({
        where: {
          customerId_productId: {
            customerId: customer.id,
            productId
          }
        },
        update: {
          quantity: totalQuantity
        },
        create: {
          customerId: customer.id,
          productId,
          quantity
        },
        include: {
          product: {
            include: {
              images: {
                orderBy: { sortOrder: 'asc' },
                take: 1
              }
            }
          }
        }
      });

      // Item added to cart successfully

      return cartItem;
    });
  }

  /**
   * Update cart item quantity
   */
  static async updateCartItemQuantity(userId: string, itemId: string, quantity: number) {
    return prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { userId }
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      const cartItem = await tx.cartItem.findFirst({
        where: {
          id: itemId,
          customerId: customer.id
        },
        include: {
          product: {
            select: { stockQuantity: true, isActive: true }
          }
        }
      });

      if (!cartItem) {
        return null;
      }

      if (!cartItem.product.isActive) {
        throw new Error('Product is no longer available');
      }

      if (quantity > cartItem.product.stockQuantity) {
        throw new Error(`Insufficient stock. Available: ${cartItem.product.stockQuantity}`);
      }

      const updatedItem = await tx.cartItem.update({
        where: { id: itemId },
        data: { quantity },
        include: {
          product: {
            include: {
              images: {
                orderBy: { sortOrder: 'asc' },
                take: 1
              }
            }
          }
        }
      });

      // Item updated successfully

      return updatedItem;
    });
  }

  /**
   * Remove item from cart
   */
  static async removeItemFromCart(userId: string, itemId: string) {
    const customer = await prisma.customer.findUnique({
      where: { userId }
    });

    if (!customer) {
      return false;
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        customerId: customer.id
      }
    });

    if (!cartItem) {
      return false;
    }

    await prisma.cartItem.delete({
      where: { id: itemId }
    });

    // Item removed successfully

    return true;
  }
}