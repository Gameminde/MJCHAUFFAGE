import { io, Socket } from 'socket.io-client'

class RealtimeService {
  private socket: Socket | null = null
  private listeners: Map<string, Function[]> = new Map()

  connect() {
    if (this.socket?.connected) {
      return this.socket
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    
    this.socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    })

    this.socket.on('connect', () => {
      console.log('Connected to real-time server')
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from real-time server')
    })

    this.socket.on('error', (error) => {
      console.error('Real-time connection error:', error)
    })

    // Set up event listeners
    this.setupEventListeners()

    return this.socket
  }

  private setupEventListeners() {
    if (!this.socket) return

    // Product updates
    this.socket.on('product:created', (data) => {
      this.emit('product:created', data)
    })

    this.socket.on('product:updated', (data) => {
      this.emit('product:updated', data)
    })

    this.socket.on('product:deleted', (data) => {
      this.emit('product:deleted', data)
    })

    // Order updates
    this.socket.on('order:created', (data) => {
      this.emit('order:created', data)
    })

    this.socket.on('order:updated', (data) => {
      this.emit('order:updated', data)
    })

    // Customer updates
    this.socket.on('customer:created', (data) => {
      this.emit('customer:created', data)
    })

    this.socket.on('customer:updated', (data) => {
      this.emit('customer:updated', data)
    })

    // Analytics updates
    this.socket.on('analytics:updated', (data) => {
      this.emit('analytics:updated', data)
    })

    // Cache invalidation
    this.socket.on('cache:invalidate', (data) => {
      this.emit('cache:invalidate', data)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.listeners.clear()
  }

  // Subscribe to events
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  // Unsubscribe from events
  off(event: string, callback?: Function) {
    if (!this.listeners.has(event)) return

    if (callback) {
      const callbacks = this.listeners.get(event)!
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    } else {
      this.listeners.delete(event)
    }
  }

  // Emit events to listeners
  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error)
        }
      })
    }
  }

  // Send events to server
  send(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    } else {
      console.warn('Socket not connected, cannot send event:', event)
    }
  }

  // Admin-specific methods
  notifyProductChange(action: 'created' | 'updated' | 'deleted', productId: string, data?: any) {
    this.send('admin:product:change', { action, productId, data })
  }

  notifyOrderChange(action: 'created' | 'updated' | 'deleted', orderId: string, data?: any) {
    this.send('admin:order:change', { action, orderId, data })
  }

  notifyCustomerChange(action: 'created' | 'updated' | 'deleted', customerId: string, data?: any) {
    this.send('admin:customer:change', { action, customerId, data })
  }

  // Request cache invalidation
  invalidateCache(keys: string[]) {
    this.send('cache:invalidate', { keys })
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

// Create singleton instance
const realtimeService = new RealtimeService()

export default realtimeService