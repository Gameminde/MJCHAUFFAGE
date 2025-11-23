import { supabase } from '@/lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

class RealtimeService {
  private channel: RealtimeChannel | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect() {
    if (this.channel) {
      return this.channel;
    }

    // Subscribe to changes in the 'public' schema
    this.channel = supabase
      .channel('public-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
        },
        (payload) => {
          this.handleDatabaseChange(payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Connected to Supabase Realtime');
        }
      });

    return this.channel;
  }

  private handleDatabaseChange(payload: any) {
    const { table, eventType, new: newRecord, old: oldRecord } = payload;
    const eventName = `${table.toLowerCase()}:${eventType.toLowerCase()}`; // e.g., 'products:insert', 'orders:update'

    // Map Supabase events to our internal event names
    // INSERT -> created
    // UPDATE -> updated
    // DELETE -> deleted

    let action = '';
    if (eventType === 'INSERT') action = 'created';
    else if (eventType === 'UPDATE') action = 'updated';
    else if (eventType === 'DELETE') action = 'deleted';

    const internalEvent = `${table.toLowerCase().slice(0, -1)}:${action}`; // e.g. products -> product:created

    this.emit(internalEvent, { ...newRecord, ...oldRecord });
  }

  disconnect() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.listeners.clear();
  }

  // Subscribe to events
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  // Unsubscribe from events
  off(event: string, callback?: Function) {
    if (!this.listeners.has(event)) return;

    if (callback) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.listeners.delete(event);
    }
  }

  // Emit events to listeners
  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Admin-specific methods - No longer needed to send events manually as Supabase handles it via DB changes
  // But kept for compatibility if needed, though they won't do anything on the server side anymore.
  notifyProductChange(action: 'created' | 'updated' | 'deleted', productId: string, data?: any) {
    // No-op: Supabase Realtime listens to DB changes automatically
  }

  notifyOrderChange(action: 'created' | 'updated' | 'deleted', orderId: string, data?: any) {
    // No-op
  }

  notifyCustomerChange(action: 'created' | 'updated' | 'deleted', customerId: string, data?: any) {
    // No-op
  }

  // Request cache invalidation
  invalidateCache(keys: string[]) {
    // No-op or implement via broadcast channel if needed
  }

  // Get connection status
  isConnected(): boolean {
    return this.channel?.state === 'joined';
  }
}

// Create singleton instance
const realtimeService = new RealtimeService();

if (process.env.NODE_ENV === 'development') {
  console.debug('🔄 Realtime service initialized (Supabase)');
}

export default realtimeService;