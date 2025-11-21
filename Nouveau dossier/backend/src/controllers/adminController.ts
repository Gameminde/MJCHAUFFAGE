import { Request, Response } from 'express';
import { AdminService } from '@/services/adminService';
import { validationResult } from 'express-validator';

export class AdminController {
  /**
   * Get admin dashboard overview statistics
   */
  static async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const timeframe = req.query.timeframe as string || '30d';
      const stats = await AdminService.getDashboardStats(timeframe);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get recent activities for admin dashboard
   */
  static async getRecentActivities(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 20 } = req.query;
      const activities = await AdminService.getRecentActivities(parseInt(limit as string));

      res.json({
        success: true,
        data: { activities },
      });
    } catch (error) {
      console.error('Get recent activities error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get all orders with admin filters
   */
  static async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        customerId,
        dateFrom,
        dateTo,
        sortBy = 'orderDate',
        sortOrder = 'desc'
      } = req.query;

      const filters: any = {
        status: status as string,
        customerId: customerId as string,
      };
      
      if (dateFrom) {
        filters.dateFrom = new Date(dateFrom as string);
      }
      if (dateTo) {
        filters.dateTo = new Date(dateTo as string);
      }

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };

      // Default to createdAt if orderDate is requested (more reliable)
      const sortField = (sortBy as string) === 'orderDate' ? 'createdAt' : (sortBy as string);
      const sort = {
        field: sortField,
        order: sortOrder as 'asc' | 'desc',
      };

      const result = await AdminService.getOrders(filters, pagination, sort);

      // Transform orders to DTO format for frontend
      const { transformOrderList } = require('@/utils/dtoTransformers');
      const transformedOrders = transformOrderList(result.orders);

      res.json({
        success: true,
        data: {
          orders: transformedOrders,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(req: Request, res: Response): Promise<void> {
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

      const { orderId } = req.params;
      const { status, trackingNumber, notes } = req.body;

      const order = await AdminService.updateOrderStatus(orderId, status, trackingNumber, notes);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: { order },
      });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get order details by ID
   */
  static async getOrderDetails(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const order = await AdminService.getOrderDetails(orderId);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error('Get order details error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Create a manual order (admin only)
   */
  static async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderData = req.body;
      const order = await AdminService.createOrder(orderData);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    } catch (error: any) {
      console.error('Create order error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create order',
      });
    }
  }

  /**
   * Update order details
   */
  static async updateOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const updateData = req.body;
      
      const order = await AdminService.updateOrder(orderId, updateData);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Order updated successfully',
        data: order,
      });
    } catch (error) {
      console.error('Update order error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Cancel an order
   */
  static async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;
      
      const order = await AdminService.cancelOrder(orderId, reason);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: order,
      });
    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Mark order as shipped
   */
  static async shipOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { trackingNumber, carrier } = req.body;
      
      const order = await AdminService.shipOrder(orderId, trackingNumber, carrier);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Order marked as shipped',
        data: order,
      });
    } catch (error) {
      console.error('Ship order error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Mark order as delivered
   */
  static async deliverOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      
      const order = await AdminService.deliverOrder(orderId);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Order marked as delivered',
        data: order,
      });
    } catch (error) {
      console.error('Deliver order error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get order statistics
   */
  static async getOrderStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await AdminService.getOrderStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Get order stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get all customers with admin filters
   */
  static async getCustomers(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        customerType,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filters = {
        search: search as string,
        customerType: customerType as string,
      };

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };

      const sort = {
        field: sortBy as string,
        order: sortOrder as 'asc' | 'desc',
      };

      const result = await AdminService.getCustomers(filters, pagination, sort);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get customers error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get customer details
   */
  static async getCustomerDetails(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const customer = await AdminService.getCustomerDetails(customerId);

      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
        return;
      }

      res.json({
        success: true,
        data: { customer },
      });
    } catch (error) {
      console.error('Get customer details error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Create a new customer (admin only)
   */
  static async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const customerData = req.body;
      const customer = await AdminService.createCustomer(customerData);

      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: customer,
      });
    } catch (error: any) {
      console.error('Create customer error:', error);
      if (error.message?.includes('already exists')) {
        res.status(409).json({
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
   * Update customer information
   */
  static async updateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const updateData = req.body;
      
      const customer = await AdminService.updateCustomer(customerId, updateData);

      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Customer updated successfully',
        data: customer,
      });
    } catch (error) {
      console.error('Update customer error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Delete a customer
   */
  static async deleteCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const result = await AdminService.deleteCustomer(customerId);

      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Customer deleted successfully',
        data: { deleted: true },
      });
    } catch (error) {
      console.error('Delete customer error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Toggle customer status (active/inactive)
   */
  static async toggleCustomerStatus(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const { status } = req.body;
      
      const customer = await AdminService.toggleCustomerStatus(customerId, status);

      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Customer status updated successfully',
        data: customer,
      });
    } catch (error) {
      console.error('Toggle customer status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get customer statistics
   */
  static async getCustomerStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await AdminService.getCustomerStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Get customer stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get customer orders
   */
  static async getCustomerOrders(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const { limit = 10 } = req.query;
      
      const orders = await AdminService.getCustomerOrders(customerId, parseInt(limit as string));

      res.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      console.error('Get customer orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get all service requests with admin filters
   */
  static async getServiceRequests(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        priority,
        technicianId,
        dateFrom,
        dateTo,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const serviceFilters: any = {
        status: status as string,
        priority: priority as string,
        technicianId: technicianId as string,
      };
      
      if (dateFrom) {
        serviceFilters.dateFrom = new Date(dateFrom as string);
      }
      if (dateTo) {
        serviceFilters.dateTo = new Date(dateTo as string);
      }

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };

      const sort = {
        field: sortBy as string,
        order: sortOrder as 'asc' | 'desc',
      };

      const result = await AdminService.getServiceRequests(serviceFilters, pagination, sort);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get service requests error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Assign technician to service request
   */
  static async assignTechnician(req: Request, res: Response): Promise<void> {
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

      const { serviceId } = req.params;
      const { technicianId, scheduledDate } = req.body;

      const serviceRequest = await AdminService.assignTechnician(
        serviceId,
        technicianId,
        new Date(scheduledDate)
      );

      if (!serviceRequest) {
        res.status(404).json({
          success: false,
          message: 'Service request not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Technician assigned successfully',
        data: { serviceRequest },
      });
    } catch (error) {
      console.error('Assign technician error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get all technicians
   */
  static async getTechnicians(_req: Request, res: Response): Promise<void> {
    try {
      const technicians = await AdminService.getTechnicians();

      res.json({
        success: true,
        data: { technicians },
      });
    } catch (error) {
      console.error('Get technicians error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Create new technician
   */
  static async createTechnician(req: Request, res: Response): Promise<void> {
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

      const technicianData = req.body;
      const technician = await AdminService.createTechnician(technicianData);

      res.status(201).json({
        success: true,
        message: 'Technician created successfully',
        data: { technician },
      });
    } catch (error) {
      console.error('Create technician error:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({
          success: false,
          message: 'User with this email already exists',
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
   * Update technician
   */
  static async updateTechnician(req: Request, res: Response): Promise<void> {
    try {
      const { technicianId } = req.params;
      const updateData = req.body;

      const technician = await AdminService.updateTechnician(technicianId, updateData);

      if (!technician) {
        res.status(404).json({
          success: false,
          message: 'Technician not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Technician updated successfully',
        data: { technician },
      });
    } catch (error) {
      console.error('Update technician error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get sales analytics
   */
  static async getSalesAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe = '30d', groupBy = 'day' } = req.query;
      const analytics = await AdminService.getSalesAnalytics(
        timeframe as string,
        groupBy as string
      );

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error('Get sales analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get inventory alerts
   */
  static async getInventoryAlerts(_req: Request, res: Response): Promise<void> {
    try {
      const alerts = await AdminService.getInventoryAlerts();

      res.json({
        success: true,
        data: { alerts },
      });
    } catch (error) {
      console.error('Get inventory alerts error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Export data (orders, customers, etc.)
   */
  static async exportData(req: Request, res: Response): Promise<void> {
    try {
      const { type, format = 'csv', dateFrom, dateTo } = req.query;

      const filters = {
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
      };

      const data = await AdminService.exportData(
        type as string,
        format as string,
        filters
      );

      if (!data) {
        res.status(400).json({
          success: false,
          message: 'Invalid export type or no data found',
        });
        return;
      }

      // Set appropriate headers for file download
      const filename = `${type}_export_${new Date().toISOString().split('T')[0]}.${format}`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');

      res.send(data);
    } catch (error) {
      console.error('Export data error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get system settings
   */
  static async getSystemSettings(_req: Request, res: Response): Promise<void> {
    try {
      const settings = await AdminService.getSystemSettings();

      res.json({
        success: true,
        data: { settings },
      });
    } catch (error) {
      console.error('Get system settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update system settings
   */
  static async updateSystemSettings(req: Request, res: Response): Promise<void> {
    try {
      const settings = req.body;
      const updatedSettings = await AdminService.updateSystemSettings(settings);

      res.json({
        success: true,
        message: 'System settings updated successfully',
        data: { settings: updatedSettings },
      });
    } catch (error) {
      console.error('Update system settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}
