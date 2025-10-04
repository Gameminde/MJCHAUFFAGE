
import { prisma } from '@/lib/database';

// Define enums locally since they might not be exported
type ServiceStatus = 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type ServicePriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface ServiceRequestFilters {
  customerId?: string;
  technicianId?: string;
  serviceTypeId?: string;
  status?: ServiceStatus;
  priority?: ServicePriority;
  dateFrom?: Date;
  dateTo?: Date;
}

interface Pagination {
  page: number;
  limit: number;
}

interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

export interface ServiceRequestCreateData {
  customerId: string;
  serviceTypeId: string;
  description: string;
  requestedDate: Date;
  priority?: ServicePriority;
  equipmentDetails?: any;
  estimatedCost?: number;
}

export class ServiceService {
  /**
   * Get all active service types
   */
  static async getActiveServices() {
    return prisma.serviceType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get a single service type by its ID
   */
  static async getServiceById(id: string) {
    return prisma.serviceType.findUnique({
      where: { id, isActive: true },
    });
  }

  /**
   * Create a new service request
   */
  static async createServiceRequest(data: ServiceRequestCreateData) {
    // Validate service type exists
    const serviceType = await prisma.serviceType.findUnique({
      where: { id: data.serviceTypeId, isActive: true },
    });

    if (!serviceType) {
      throw new Error('Service type not found or inactive');
    }

    // Validate customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
      include: { user: { select: { isActive: true } } },
    });

    if (!customer || !customer.user?.isActive) {
      throw new Error('Customer not found or inactive');
    }

    return prisma.serviceRequest.create({
      data: {
        customerId: data.customerId,
        serviceTypeId: data.serviceTypeId,
        description: data.description,
        requestedDate: data.requestedDate,
        priority: data.priority || 'NORMAL',
        status: 'PENDING',
        equipmentDetails: data.equipmentDetails,
        estimatedCost: data.estimatedCost || null,
      },
      include: {
        customer: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true, phone: true }
            }
          }
        },
        serviceType: true,
      },
    });
  }

  /**
   * Get service requests with filtering and pagination
   */
  static async getServiceRequests(filters: ServiceRequestFilters, pagination: Pagination, sort: Sort) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.technicianId) where.technicianId = filters.technicianId;
    if (filters.serviceTypeId) where.serviceTypeId = filters.serviceTypeId;
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;

    if (filters.dateFrom || filters.dateTo) {
      where.requestedDate = {};
      if (filters.dateFrom) where.requestedDate.gte = filters.dateFrom;
      if (filters.dateTo) where.requestedDate.lte = filters.dateTo;
    }

    // Build orderBy
    const orderBy: any = {};
    orderBy[sort.field] = sort.order;

    const [serviceRequests, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        include: {
          customer: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true, phone: true }
              }
            }
          },
          serviceType: true,
          technician: {
            include: {
              user: {
                select: { firstName: true, lastName: true }
              }
            }
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.serviceRequest.count({ where }),
    ]);

    return {
      serviceRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get service request by ID
   */
  static async getServiceRequestById(id: string, customerId?: string) {
    const where: any = { id };
    
    // If customerId provided, ensure customer can only access their own requests
    if (customerId) {
      where.customerId = customerId;
    }

    return prisma.serviceRequest.findFirst({
      where,
      include: {
        customer: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true, phone: true }
            }
          }
        },
        serviceType: true,
        technician: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true, phone: true }
            }
          }
        },
      },
    });
  }

  /**
   * Update service request status
   */
  static async updateServiceRequestStatus(
    id: string,
    status: ServiceStatus,
    technicianId?: string,
    scheduledDate?: Date,
    completionNotes?: string,
    actualCost?: number
  ) {
    const updateData: any = { status };

    if (technicianId) updateData.technicianId = technicianId;
    if (scheduledDate) updateData.scheduledDate = scheduledDate;
    if (completionNotes) updateData.completionNotes = completionNotes;
    if (actualCost) updateData.actualCost = actualCost;

    // Set completion timestamp
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    return prisma.serviceRequest.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        serviceType: true,
        technician: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        },
      },
    });
  }

  /**
   * Add customer feedback to service request
   */
  static async addServiceFeedback(
    id: string,
    customerId: string,
    rating: number,
    feedback?: string
  ) {
    // Verify the service request belongs to the customer and is completed
    const serviceRequest = await prisma.serviceRequest.findFirst({
      where: {
        id,
        customerId,
        status: 'COMPLETED',
      },
    });

    if (!serviceRequest) {
      throw new Error('Service request not found or not completed');
    }

    return prisma.serviceRequest.update({
      where: { id },
      data: {
        customerRating: rating,
        customerFeedback: feedback || null,
      },
      include: {
        serviceType: true,
        technician: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        },
      },
    });
  }

  /**
   * Get available technicians for a service type
   */
  static async getAvailableTechnicians(serviceTypeId?: string) {
    const where: any = {
      isActive: true,
      user: { isActive: true },
    };

    // If service type specified, filter by specialties
    if (serviceTypeId) {
      const serviceType = await prisma.serviceType.findUnique({
        where: { id: serviceTypeId },
        select: { name: true },
      });

      if (serviceType) {
        where.specialties = {
          has: serviceType.name,
        };
      }
    }

    return prisma.technician.findMany({
      where,
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true, phone: true }
        },
        _count: {
          select: {
            serviceRequests: {
              where: {
                status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
              }
            }
          }
        }
      },
      orderBy: {
        user: { firstName: 'asc' }
      },
    });
  }

  /**
   * Get service request statistics
   */
  static async getServiceStatistics(customerId?: string, technicianId?: string) {
    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (technicianId) where.technicianId = technicianId;

    const [
      totalRequests,
      pendingRequests,
      scheduledRequests,
      completedRequests,
      cancelledRequests,
    ] = await Promise.all([
      prisma.serviceRequest.count({ where }),
      prisma.serviceRequest.count({ where: { ...where, status: 'PENDING' } }),
      prisma.serviceRequest.count({ where: { ...where, status: 'SCHEDULED' } }),
      prisma.serviceRequest.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.serviceRequest.count({ where: { ...where, status: 'CANCELLED' } }),
    ]);

    return {
      totalRequests,
      pendingRequests,
      scheduledRequests,
      completedRequests,
      cancelledRequests,
    };
  }

  /**
   * Helper method to get customer by user ID
   */
  static async getCustomerByUserId(userId: string) {
    return prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    });
  }

  /**
   * Helper method to get technician by user ID
   */
  static async getTechnicianByUserId(userId: string) {
    return prisma.technician.findUnique({
      where: { userId },
      select: { id: true },
    });
  }
}