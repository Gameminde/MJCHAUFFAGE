import { Server as SocketServer } from 'socket.io';
import { logger } from '@/utils/logger';

export interface RealtimeEvent {
  type: string;
  data: any;
  timestamp: Date;
  userId?: string;
  adminOnly?: boolean;
}

export interface ProductUpdateEvent extends RealtimeEvent {
  type: 'product_updated' | 'product_created' | 'product_deleted' | 'inventory_updated';
  data: {
    productId: string;
    product?: any;
    changes?: any;
    oldQuantity?: number;
    newQuantity?: number;
  };
}

export interface OrderUpdateEvent extends RealtimeEvent {
  type: 'order_created' | 'order_updated' | 'order_cancelled' | 'order_status_changed';
  data: {
    orderId: string;
    order?: any;
    status?: string;
    customerId?: string;
  };
}

export interface CustomerUpdateEvent extends RealtimeEvent {
  type: 'customer_created' | 'customer_updated' | 'customer_activated' | 'customer_deactivated';
  data: {
    customerId: string;
    customer?: any;
    changes?: any;
  };
}

export interface ServiceRequestUpdateEvent extends RealtimeEvent {
  type: 'service_request_created' | 'service_request_updated' | 'service_request_assigned';
  data: {
    serviceRequestId: string;
    serviceRequest?: any;
    technicianId?: string;
    status?: string;
  };
}

export interface SystemUpdateEvent extends RealtimeEvent {
  type: 'cache_invalidated' | 'system_notification' | 'maintenance_mode';
  data: {
    message: string;
    cacheKeys?: string[];
    maintenanceStart?: Date;
    maintenanceEnd?: Date;
  };
}

export type AllRealtimeEvents = 
  | ProductUpdateEvent 
  | OrderUpdateEvent 
  | CustomerUpdateEvent 
  | ServiceRequestUpdateEvent 
  | SystemUpdateEvent;

export class RealtimeService {
  private static io: SocketServer | null = null;

  /**
   * Initialize the realtime service with Socket.io instance
   */
  static initialize(io: SocketServer) {
    this.io = io;
    this.setupEventHandlers();
    logger.info('Realtime service initialized');
  }

  /**
   * Setup Socket.io event handlers
   */
  private static setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Authentication check
      socket.on('authenticate', (_token) => {
        // TODO: Verify JWT token and set user context
        // For now, we'll assume authentication is handled by middleware
        socket.data.authenticated = true;
      });

      // Join admin room
      socket.on('join_admin', () => {
        if (socket.data.authenticated) {
          socket.join('admin_dashboard');
          logger.info(`Admin joined: ${socket.id}`);
        }
      });

      // Join customer room
      socket.on('join_customer', (customerId) => {
        if (socket.data.authenticated) {
          socket.join(`customer_${customerId}`);
          logger.info(`Customer ${customerId} joined: ${socket.id}`);
        }
      });

      // Join order room for updates
      socket.on('join_order', (orderId) => {
        if (socket.data.authenticated) {
          socket.join(`order_${orderId}`);
          logger.info(`Joined order room ${orderId}: ${socket.id}`);
        }
      });

      // Join service request room
      socket.on('join_service_request', (serviceRequestId) => {
        if (socket.data.authenticated) {
          socket.join(`service_request_${serviceRequestId}`);
          logger.info(`Joined service request room ${serviceRequestId}: ${socket.id}`);
        }
      });

      // Leave rooms on disconnect
      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Emit event to all connected clients
   */
  static emitToAll(event: AllRealtimeEvents) {
    if (!this.io) return;

    this.io.emit('realtime_event', {
      ...event,
      timestamp: new Date(),
    });

    logger.debug('Emitted event to all clients:', event.type);
  }

  /**
   * Emit event to admin dashboard
   */
  static emitToAdmin(event: AllRealtimeEvents) {
    if (!this.io) return;

    this.io.to('admin_dashboard').emit('admin_event', {
      ...event,
      timestamp: new Date(),
    });

    logger.debug('Emitted event to admin:', event.type);
  }

  /**
   * Emit event to specific customer
   */
  static emitToCustomer(customerId: string, event: AllRealtimeEvents) {
    if (!this.io) return;

    this.io.to(`customer_${customerId}`).emit('customer_event', {
      ...event,
      timestamp: new Date(),
    });

    logger.debug(`Emitted event to customer ${customerId}:`, event.type);
  }

  /**
   * Emit event to specific order room
   */
  static emitToOrder(orderId: string, event: OrderUpdateEvent) {
    if (!this.io) return;

    this.io.to(`order_${orderId}`).emit('order_event', {
      ...event,
      timestamp: new Date(),
    });

    logger.debug(`Emitted event to order ${orderId}:`, event.type);
  }

  /**
   * Emit event to service request room
   */
  static emitToServiceRequest(serviceRequestId: string, event: ServiceRequestUpdateEvent) {
    if (!this.io) return;

    this.io.to(`service_request_${serviceRequestId}`).emit('service_request_event', {
      ...event,
      timestamp: new Date(),
    });

    logger.debug(`Emitted event to service request ${serviceRequestId}:`, event.type);
  }

  /**
   * Notify about product updates
   */
  static notifyProductUpdate(event: ProductUpdateEvent) {
    // Emit to admin dashboard
    this.emitToAdmin(event);

    // If it's a public product change, emit to all clients
    if (['product_created', 'product_updated', 'inventory_updated'].includes(event.type)) {
      this.emitToAll(event);
    }
  }

  /**
   * Notify about order updates
   */
  static notifyOrderUpdate(event: OrderUpdateEvent) {
    // Emit to admin dashboard
    this.emitToAdmin(event);

    // Emit to specific order room
    this.emitToOrder(event.data.orderId, event);

    // Emit to customer if specified
    if (event.data.customerId) {
      this.emitToCustomer(event.data.customerId, event);
    }
  }

  /**
   * Notify about customer updates
   */
  static notifyCustomerUpdate(event: CustomerUpdateEvent) {
    // Emit to admin dashboard
    this.emitToAdmin(event);

    // Emit to specific customer
    this.emitToCustomer(event.data.customerId, event);
  }

  /**
   * Notify about service request updates
   */
  static notifyServiceRequestUpdate(event: ServiceRequestUpdateEvent) {
    // Emit to admin dashboard
    this.emitToAdmin(event);

    // Emit to service request room
    this.emitToServiceRequest(event.data.serviceRequestId, event);
  }

  /**
   * Notify about system updates
   */
  static notifySystemUpdate(event: SystemUpdateEvent) {
    if (event.adminOnly) {
      this.emitToAdmin(event);
    } else {
      this.emitToAll(event);
    }
  }

  /**
   * Invalidate cache and notify clients
   */
  static invalidateCache(cacheKeys: string[], message?: string) {
    const event: SystemUpdateEvent = {
      type: 'cache_invalidated',
      data: {
        message: message || 'Cache has been updated',
        cacheKeys,
      },
      timestamp: new Date(),
      adminOnly: false,
    };

    this.notifySystemUpdate(event);
  }

  /**
   * Send system notification
   */
  static sendSystemNotification(message: string, adminOnly = false) {
    const event: SystemUpdateEvent = {
      type: 'system_notification',
      data: { message },
      timestamp: new Date(),
      adminOnly,
    };

    this.notifySystemUpdate(event);
  }

  /**
   * Get connected clients count
   */
  static getConnectedClientsCount(): number {
    if (!this.io) return 0;
    return this.io.engine.clientsCount;
  }

  /**
   * Get admin clients count
   */
  static async getAdminClientsCount(): Promise<number> {
    if (!this.io) return 0;
    
    try {
      const adminSockets = await this.io.in('admin_dashboard').fetchSockets();
      return adminSockets.length;
    } catch (error) {
      logger.error('Error getting admin clients count:', error);
      return 0;
    }
  }

  /**
   * Get room information
   */
  static async getRoomInfo(roomName: string) {
    if (!this.io) return null;

    try {
      const sockets = await this.io.in(roomName).fetchSockets();
      return {
        roomName,
        clientCount: sockets.length,
        clients: sockets.map(socket => ({
          id: socket.id,
          authenticated: socket.data.authenticated || false,
        })),
      };
    } catch (error) {
      logger.error(`Error getting room info for ${roomName}:`, error);
      return null;
    }
  }
}