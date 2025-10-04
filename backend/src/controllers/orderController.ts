import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { OrderService, OrderCreateData } from '@/services/orderService';



export class OrderController {
  /**
   * Create a guest order (no authentication required)
   */
  static async createGuestOrder(req: Request, res: Response): Promise<void> {
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

      const guestOrderData = {
        items: req.body.items,
        shippingAddress: req.body.shippingAddress,
        customerInfo: req.body.customerInfo,
        paymentMethod: req.body.paymentMethod || 'CASH_ON_DELIVERY',
        subtotal: req.body.subtotal,
        shippingAmount: req.body.shippingAmount || 0,
        totalAmount: req.body.totalAmount,
        currency: req.body.currency || 'DZD'
      };

      const order = await OrderService.createGuestOrder(guestOrderData);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            totalAmount: order.totalAmount,
            estimatedDelivery: OrderService.calculateEstimatedDelivery(
              req.body.shippingAddress?.region
            ),
          },
        },
      });
    } catch (error) {
      console.error('Create guest order error:', error);
      if (error instanceof Error) {
        if (error.message.includes('not found') || error.message.includes('Insufficient stock')) {
          res.status(400).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Create a new order
   */
  static async createOrder(req: Request, res: Response): Promise<void> {
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
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Get customer ID from user ID
      const customer = await OrderService.getCustomerByUserId(userId);
      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer profile not found',
        });
        return;
      }

      const orderData: OrderCreateData = {
        customerId: customer.id,
        items: req.body.items,
        shippingAddress: req.body.shippingAddress,
        subtotal: req.body.subtotal,
        taxAmount: req.body.taxAmount,
        shippingAmount: req.body.shippingAmount,
        discountAmount: req.body.discountAmount,
        totalAmount: req.body.totalAmount,
        notes: req.body.notes,
        paymentMethod: req.body.paymentMethod,
      };

      const order = await OrderService.createOrder(orderData);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            totalAmount: order.totalAmount,
            estimatedDelivery: OrderService.calculateEstimatedDelivery(
              req.body.shippingAddress?.region
            ),
          },
        },
      });
    } catch (error) {
      console.error('Create order error:', error);
      if (error instanceof Error) {
        if (error.message.includes('not found') || error.message.includes('Insufficient stock')) {
          res.status(400).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get orders for current user
   */
  static async getUserOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Get customer ID from user ID
      const customer = await OrderService.getCustomerByUserId(userId);
      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer profile not found',
        });
        return;
      }

      const {
        page = 1,
        limit = 10,
        status,
        sortBy = 'orderDate',
        sortOrder = 'desc',
      } = req.query;

      const filters = {
        customerId: customer.id,
        status: status as any,
      };

      const pagination = {
        page: parseInt(page as string),
        limit: Math.min(parseInt(limit as string), 50),
      };

      const sort = {
        field: sortBy as string,
        order: sortOrder as 'asc' | 'desc',
      };

      const result = await OrderService.getOrders(filters, pagination, sort);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get specific order details
   */
  static async getOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Get customer ID from user ID
      const customer = await OrderService.getCustomerByUserId(userId);
      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer profile not found',
        });
        return;
      }

      const order = await OrderService.getOrderById(id, customer.id);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      res.json({
        success: true,
        data: { order },
      });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Cancel order (only if pending or confirmed)
   */
  static async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const { reason } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Get customer ID from user ID
      const customer = await OrderService.getCustomerByUserId(userId);
      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer profile not found',
        });
        return;
      }

      await OrderService.cancelOrder(id, reason, customer.id);

      res.json({
        success: true,
        message: 'Order cancelled successfully',
      });
    } catch (error) {
      console.error('Cancel order error:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
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
   * Get order statistics for current user
   */
  static async getUserOrderStatistics(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Get customer ID from user ID
      const customer = await OrderService.getCustomerByUserId(userId);
      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer profile not found',
        });
        return;
      }

      const statistics = await OrderService.getOrderStatistics(customer.id);

      res.json({
        success: true,
        data: { statistics },
      });
    } catch (error) {
      console.error('Get user order statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

