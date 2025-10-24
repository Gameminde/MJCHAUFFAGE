import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { CustomerService, CustomerFilters } from '@/services/customerService';

export class CustomerController {
  /**
   * Get all customers (Admin only)
   */
  static async getCustomers(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        customerType,
        isActive,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const filters: CustomerFilters = {};
      
      if (search) filters.search = search as string;
      if (customerType) filters.customerType = customerType as any;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const pagination = {
        page: parseInt(page as string),
        limit: Math.min(parseInt(limit as string), 50),
      };

      const sort = {
        field: sortBy as string,
        order: sortOrder as 'asc' | 'desc',
      };

      const result = await CustomerService.getCustomers(filters, pagination, sort);

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
   * Get customer by ID (Admin only)
   */
  static async getCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const customer = await CustomerService.getCustomerById(id);

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
      console.error('Get customer error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Create new customer (Admin only)
   */
  static async createCustomer(req: Request, res: Response): Promise<void> {
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

      const customerData = req.body;
      const customer = await CustomerService.createCustomer(customerData);

      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: { customer },
      });
    } catch (error) {
      console.error('Create customer error:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
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
   * Update customer (Admin only)
   */
  static async updateCustomer(req: Request, res: Response): Promise<void> {
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

      const { id } = req.params;
      const updateData = req.body;

      const customer = await CustomerService.updateCustomer(id, updateData);

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
        data: { customer },
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
   * Deactivate customer (Admin only)
   */
  static async deactivateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await CustomerService.deactivateCustomer(id);

      res.json({
        success: true,
        message: 'Customer deactivated successfully',
      });
    } catch (error) {
      console.error('Deactivate customer error:', error);
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
   * Activate customer (Admin only)
   */
  static async activateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await CustomerService.activateCustomer(id);

      res.json({
        success: true,
        message: 'Customer activated successfully',
      });
    } catch (error) {
      console.error('Activate customer error:', error);
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
   * Get current user's profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const customer = await CustomerService.getCustomerByUserId(userId);

      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer profile not found',
        });
        return;
      }

      res.json({
        success: true,
        data: { customer },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update current user's profile
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
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

      const customer = await CustomerService.getCustomerByUserId(userId);
      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer profile not found',
        });
        return;
      }

      const updateData = req.body;
      const updatedCustomer = await CustomerService.updateCustomer(customer.id, updateData);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { customer: updatedCustomer },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Add customer address
   */
  static async addAddress(req: Request, res: Response): Promise<void> {
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

      const customer = await CustomerService.getCustomerByUserId(userId);
      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer profile not found',
        });
        return;
      }

      const addressData = {
        ...req.body,
        customerId: customer.id,
      };

      const address = await CustomerService.addCustomerAddress(addressData);

      res.status(201).json({
        success: true,
        message: 'Address added successfully',
        data: { address },
      });
    } catch (error) {
      console.error('Add address error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update customer address
   */
  static async updateAddress(req: Request, res: Response): Promise<void> {
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

      const { addressId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const customer = await CustomerService.getCustomerByUserId(userId);
      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer profile not found',
        });
        return;
      }

      const updateData = req.body;
      const address = await CustomerService.updateCustomerAddress(
        addressId,
        customer.id,
        updateData
      );

      res.json({
        success: true,
        message: 'Address updated successfully',
        data: { address },
      });
    } catch (error) {
      console.error('Update address error:', error);
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
   * Delete customer address
   */
  static async deleteAddress(req: Request, res: Response): Promise<void> {
    try {
      const { addressId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const customer = await CustomerService.getCustomerByUserId(userId);
      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer profile not found',
        });
        return;
      }

      await CustomerService.deleteCustomerAddress(addressId, customer.id);

      res.json({
        success: true,
        message: 'Address deleted successfully',
      });
    } catch (error) {
      console.error('Delete address error:', error);
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
   * Get customer order history
   */
  static async getOrderHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { page = 1, limit = 10 } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const customer = await CustomerService.getCustomerByUserId(userId);
      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer profile not found',
        });
        return;
      }

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };

      const result = await CustomerService.getCustomerOrderHistory(customer.id, pagination);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get order history error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get customer statistics (Admin only)
   */
  static async getCustomerStatistics(_req: Request, res: Response): Promise<void> {
    try {
      const statistics = await CustomerService.getCustomerStatistics();

      res.json({
        success: true,
        data: { statistics },
      });
    } catch (error) {
      console.error('Get customer statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}