import { Request, Response } from 'express';
import { RealtimeService } from '@/services/realtimeService';
import { CacheService } from '@/services/cacheService';

export class RealtimeController {
  /**
   * Get realtime connection statistics
   */
  static async getConnectionStats(_req: Request, res: Response): Promise<void> {
    try {
      const totalClients = RealtimeService.getConnectedClientsCount();
      const adminClients = await RealtimeService.getAdminClientsCount();

      res.json({
        success: true,
        data: {
          totalConnectedClients: totalClients,
          adminConnectedClients: adminClients,
          customerConnectedClients: totalClients - adminClients,
        },
      });
    } catch (error) {
      console.error('Get connection stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get room information
   */
  static async getRoomInfo(req: Request, res: Response): Promise<void> {
    try {
      const { roomName } = req.params;

      const roomInfo = await RealtimeService.getRoomInfo(roomName);

      if (!roomInfo) {
        res.status(404).json({
          success: false,
          message: 'Room not found',
        });
        return;
      }

      res.json({
        success: true,
        data: roomInfo,
      });
    } catch (error) {
      console.error('Get room info error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Send system notification
   */
  static async sendSystemNotification(req: Request, res: Response): Promise<void> {
    try {
      const { message, adminOnly = false } = req.body;

      if (!message) {
        res.status(400).json({
          success: false,
          message: 'Message is required',
        });
        return;
      }

      RealtimeService.sendSystemNotification(message, adminOnly);

      res.json({
        success: true,
        message: 'System notification sent successfully',
      });
    } catch (error) {
      console.error('Send system notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Invalidate cache manually
   */
  static async invalidateCache(req: Request, res: Response): Promise<void> {
    try {
      const { pattern, message } = req.body;

      if (!pattern) {
        res.status(400).json({
          success: false,
          message: 'Cache pattern is required',
        });
        return;
      }

      await CacheService.deleteByPattern(pattern);

      if (message) {
        RealtimeService.sendSystemNotification(message, true);
      }

      res.json({
        success: true,
        message: 'Cache invalidated successfully',
      });
    } catch (error) {
      console.error('Invalidate cache error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Clear all cache
   */
  static async clearAllCache(_req: Request, res: Response): Promise<void> {
    try {
      await CacheService.clear();

      RealtimeService.sendSystemNotification('All cache has been cleared', true);

      res.json({
        success: true,
        message: 'All cache cleared successfully',
      });
    } catch (error) {
      console.error('Clear all cache error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await CacheService.getStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Get cache stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Clean expired cache entries
   */
  static async cleanExpiredCache(_req: Request, res: Response): Promise<void> {
    try {
      await CacheService.cleanExpired();

      res.json({
        success: true,
        message: 'Expired cache entries cleaned successfully',
      });
    } catch (error) {
      console.error('Clean expired cache error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Test realtime connection
   */
  static async testRealtimeConnection(req: Request, res: Response): Promise<void> {
    try {
      const { message = 'Test message from admin' } = req.body;

      // Send test event to admin dashboard
      RealtimeService.emitToAdmin({
        type: 'system_notification',
        data: { message },
        timestamp: new Date(),
      });

      res.json({
        success: true,
        message: 'Test event sent to admin dashboard',
      });
    } catch (error) {
      console.error('Test realtime connection error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Broadcast message to all clients
   */
  static async broadcastMessage(req: Request, res: Response): Promise<void> {
    try {
      const { message } = req.body;

      if (!message) {
        res.status(400).json({
          success: false,
          message: 'Message is required',
        });
        return;
      }

      RealtimeService.emitToAll({
        type: 'system_notification',
        data: { message },
        timestamp: new Date(),
      });

      res.json({
        success: true,
        message: 'Message broadcasted to all clients',
      });
    } catch (error) {
      console.error('Broadcast message error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Force refresh for all clients
   */
  static async forceRefresh(req: Request, res: Response): Promise<void> {
    try {
      const { reason = 'System update' } = req.body;

      RealtimeService.emitToAll({
        type: 'system_notification',
        data: { 
          message: `Please refresh your browser: ${reason}`
        },
        timestamp: new Date(),
      });

      res.json({
        success: true,
        message: 'Force refresh signal sent to all clients',
      });
    } catch (error) {
      console.error('Force refresh error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}