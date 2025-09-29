
import { prisma } from '@/config/database';

export class ServiceService {
  /**
   * Get all active service types
   */
  static async getActiveServices() {
    try {
      const services = await prisma.serviceType.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
      return services;
    } catch (error) {
      console.error('Error fetching active services:', error);
      throw new Error('Could not retrieve services');
    }
  }

  /**
   * Get a single service type by its ID
   * @param id The ID of the service type
   */
  static async getServiceById(id: string) {
    try {
      const service = await prisma.serviceType.findUnique({
        where: {
          id,
          isActive: true,
        },
      });
      return service;
    } catch (error) {
      console.error(`Error fetching service with ID ${id}:`, error);
      throw new Error('Could not retrieve the service');
    }
  }
}
