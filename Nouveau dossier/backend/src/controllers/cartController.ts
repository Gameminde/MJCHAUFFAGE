import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { CartService } from '@/services/cartService';

export class CartController {
  /**
   * Validate cart items against current stock
   */
  static async validateCart(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const { items } = req.body;
      const validation = await CartService.validateCartItems(items);

      res.json({
        success: true,
        data: validation,
      });
    } catch (error) {
      console.error('Validate cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get user's cart
   */
  static async getCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const cart = await CartService.getUserCart(userId);

      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      console.error('Get cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Sync cart with server
   */
  static async syncCart(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const userId = (req as any).user?.id;
      const { items } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const cart = await CartService.syncUserCart(userId, items);

      res.json({
        success: true,
        message: 'Cart synced successfully',
        data: cart,
      });
    } catch (error) {
      console.error('Sync cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Clear user's cart
   */
  static async clearCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      await CartService.clearUserCart(userId);

      res.json({
        success: true,
        message: 'Cart cleared successfully',
      });
    } catch (error) {
      console.error('Clear cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Add item to cart
   */
  static async addItem(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const userId = (req as any).user?.id;
      const { productId, quantity } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const cartItem = await CartService.addItemToCart(userId, productId, quantity);

      res.status(201).json({
        success: true,
        message: 'Item added to cart',
        data: { cartItem },
      });
    } catch (error) {
      console.error('Add cart item error:', error);
      if (error instanceof Error && error.message.includes('insufficient stock')) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update cart item quantity
   */
  static async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const userId = (req as any).user?.id;
      const { itemId } = req.params;
      const { quantity } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      if (quantity === 0) {
        await CartService.removeItemFromCart(userId, itemId);
        res.json({
          success: true,
          message: 'Item removed from cart',
        });
        return;
      }

      const cartItem = await CartService.updateCartItemQuantity(userId, itemId, quantity);

      if (!cartItem) {
        res.status(404).json({
          success: false,
          message: 'Cart item not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Cart item updated',
        data: { cartItem },
      });
    } catch (error) {
      console.error('Update cart item error:', error);
      if (error instanceof Error && error.message.includes('insufficient stock')) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Remove item from cart
   */
  static async removeItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { itemId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const removed = await CartService.removeItemFromCart(userId, itemId);

      if (!removed) {
        res.status(404).json({
          success: false,
          message: 'Cart item not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Item removed from cart',
      });
    } catch (error) {
      console.error('Remove cart item error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}