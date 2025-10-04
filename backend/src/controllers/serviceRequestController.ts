import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ServiceService, ServiceRequestCreateData, ServiceRequestFilters } from '@/services/serviceService';

export class ServiceRequestController {
  /**
   * Get all service types
   */
  static async getServiceTypes(_req: Request, res: Response): Promise<void> {
    try {
      const serviceTypes = await ServiceService.getActiveServices();

      res.json({
        success: true,
        data: { serviceTypes },
      });
    } catch (error) {
      console.error('Get service types error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get service type by ID
   */
  static async getServiceType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const serviceType = await ServiceService.getServiceById(id);

      if (!serviceType) {
        res.status(404).json({
          success: false,
          message: 'Service type not found',
        });
        return;
      }

      res.json({
        success: true,
        data: { serviceType },
      });
    } catch (error) {
      console.error('Get service type error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Create service request
   */
  static async createServiceRequest(req: Request, res: Response): Promise<void> {
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
      const customer = await ServiceService.getCustomerByUserId(userId);
      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer profile not found',
        });
        return;
      }

      const requestData: ServiceRequestCreateData = {
        customerId: customer.id,
        serviceTypeId: req.body.serviceTypeId,
        description: req.body.description,
        requestedDate: new Date(req.body.requestedDate),
        priority: req.body.priority,
        equipmentDetails: req.body.equipmentDetails,
        estimatedCost: req.body.estimatedCost,
      };

      const serviceRequest = await ServiceService.createServiceRequest(requestData);

      res.status(201).json({
        success: true,
        message: 'Service request created successfully',
        data: { serviceRequest },
      });
    } catch (error) {
      console.error('Create service request error:', error);
      if (error instanceof Error && error.message.includes('not found')) {
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
   * Get service requests (Admin or filtered by customer)
   */
  static async getServiceRequests(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const {
        page = 1,
        limit = 20,
        status,
        priority,
        serviceTypeId,
        technicianId,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const filters: ServiceRequestFilters = {};

      // If not admin, only show customer's own requests
      if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        const customer = await ServiceService.getCustomerByUserId(userId);
        if (!customer) {
          res.status(404).json({
            success: false,
            message: 'Customer profile not found',
          });
          return;
        }
        filters.customerId = customer.id;
      }

      if (status) filters.status = status as any;
      if (priority) filters.priority = priority as any;
      if (serviceTypeId) filters.serviceTypeId = serviceTypeId as string;
      if (technicianId) filters.technicianId = technicianId as string;

      const pagination = {
        page: parseInt(page as string),
        limit: Math.min(parseInt(limit as string), 50),
      };

      const sort = {
        field: sortBy as string,
        order: sortOrder as 'asc' | 'desc',
      };

      const result = await ServiceService.getServiceRequests(filters, pagination, sort);

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
   * Get service request by ID
   */
  static async getServiceRequest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      let customerId: string | undefined;

      // If not admin, ensure customer can only access their own requests
      if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        const customer = await ServiceService.getCustomerByUserId(userId);
        if (!customer) {
          res.status(404).json({
            success: false,
            message: 'Customer profile not found',
          });
          return;
        }
        customerId = customer.id;
      }

      const serviceRequest = await ServiceService.getServiceRequestById(id, customerId);

      if (!serviceRequest) {
        res.status(404).json({
          success: false,
          message: 'Service request not found',
        });
        return;
      }

      res.json({
        success: true,
        data: { serviceRequest },
      });
    } catch (error) {
      console.error('Get service request error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update service request status (Admin/Technician only)
   */
  static async updateServiceRequestStatus(req: Request, res: Response): Promise<void> {
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
      const { status, technicianId, scheduledDate, completionNotes, actualCost } = req.body;

      const serviceRequest = await ServiceService.updateServiceRequestStatus(
        id,
        status,
        technicianId,
        scheduledDate ? new Date(scheduledDate) : undefined,
        completionNotes,
        actualCost
      );

      res.json({
        success: true,
        message: 'Service request updated successfully',
        data: { serviceRequest },
      });
    } catch (error) {
      console.error('Update service request status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Add customer feedback to service request
   */
  static async addServiceFeedback(req: Request, res: Response): Promise<void> {
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
      const userId = (req as any).user?.id;
      const { rating, feedback } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Get customer ID from user ID
      const customer = await ServiceService.getCustomerByUserId(userId);
      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer profile not found',
        });
        return;
      }

      const serviceRequest = await ServiceService.addServiceFeedback(
        id,
        customer.id,
        rating,
        feedback
      );

      res.json({
        success: true,
        message: 'Feedback added successfully',
        data: { serviceRequest },
      });
    } catch (error) {
      console.error('Add service feedback error:', error);
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
   * Get available technicians (Admin only)
   */
  static async getAvailableTechnicians(req: Request, res: Response): Promise<void> {
    try {
      const { serviceTypeId } = req.query;

      const technicians = await ServiceService.getAvailableTechnicians(
        serviceTypeId as string
      );

      res.json({
        success: true,
        data: { technicians },
      });
    } catch (error) {
      console.error('Get available technicians error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get service request statistics
   */
  static async getServiceStatistics(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      let customerId: string | undefined;
      let technicianId: string | undefined;

      // If customer, get their statistics
      if (userRole === 'CUSTOMER') {
        const customer = await ServiceService.getCustomerByUserId(userId);
        if (customer) {
          customerId = customer.id;
        }
      }

      // If technician, get their statistics
      if (userRole === 'TECHNICIAN') {
        const technician = await ServiceService.getTechnicianByUserId(userId);
        if (technician) {
          technicianId = technician.id;
        }
      }

      const statistics = await ServiceService.getServiceStatistics(customerId, technicianId);

      res.json({
        success: true,
        data: { statistics },
      });
    } catch (error) {
      console.error('Get service statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

