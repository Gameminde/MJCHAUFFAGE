
import { Request, Response } from 'express';
import { ServiceService } from '../services/serviceService';

export class ServiceController {
  /**
   * Get all active services
   */
  static async getServices(_req: Request, res: Response): Promise<void> {
    try {
      const services = await ServiceService.getActiveServices();
      res.json({
        success: true,
        data: services,
      });
    } catch (error) {
      console.error('Get services error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching services',
      });
    }
  }

  /**
   * Get a single service by ID
   */
  static async getServiceById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const service = await ServiceService.getServiceById(id);

      if (!service) {
        res.status(404).json({
          success: false,
          message: 'Service not found',
        });
        return;
      }

      res.json({
        success: true,
        data: service,
      });
    } catch (error) {
      console.error(`Get service by ID error for ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching the service',
      });
    }
  }
}
