import { useEffect, useRef, useState } from 'react'
import realtimeService from '@/services/realtimeService'

interface UseRealtimeOptions {
  autoConnect?: boolean
  events?: string[]
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const { autoConnect = true, events = [] } = options
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listenersRef = useRef<Map<string, Function>>(new Map())

  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect])

  const connect = () => {
    try {
      const socket = realtimeService.connect()
      
      socket.on('connect', () => {
        setIsConnected(true)
        setError(null)
      })

      socket.on('disconnect', () => {
        setIsConnected(false)
      })

      socket.on('error', (err: any) => {
        setError(err.message || 'Connection error')
        setIsConnected(false)
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
    }
  }

  const disconnect = () => {
    // Remove all listeners
    listenersRef.current.forEach((callback, event) => {
      realtimeService.off(event, callback)
    })
    listenersRef.current.clear()

    realtimeService.disconnect()
    setIsConnected(false)
  }

  const subscribe = (event: string, callback: Function) => {
    // Remove existing listener if any
    const existingCallback = listenersRef.current.get(event)
    if (existingCallback) {
      realtimeService.off(event, existingCallback)
    }

    // Add new listener
    realtimeService.on(event, callback)
    listenersRef.current.set(event, callback)
  }

  const unsubscribe = (event: string) => {
    const callback = listenersRef.current.get(event)
    if (callback) {
      realtimeService.off(event, callback)
      listenersRef.current.delete(event)
    }
  }

  const send = (event: string, data: any) => {
    realtimeService.send(event, data)
  }

  return {
    isConnected,
    error,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send
  }
}

// Specialized hooks for different admin functions
export function useProductRealtime() {
  const { subscribe, unsubscribe, send, isConnected } = useRealtime()

  const onProductCreated = (callback: (product: any) => void) => {
    subscribe('product:created', callback)
  }

  const onProductUpdated = (callback: (product: any) => void) => {
    subscribe('product:updated', callback)
  }

  const onProductDeleted = (callback: (productId: string) => void) => {
    subscribe('product:deleted', callback)
  }

  const notifyProductChange = (action: 'created' | 'updated' | 'deleted', productId: string, data?: any) => {
    realtimeService.notifyProductChange(action, productId, data)
  }

  return {
    isConnected,
    onProductCreated,
    onProductUpdated,
    onProductDeleted,
    notifyProductChange,
    cleanup: () => {
      unsubscribe('product:created')
      unsubscribe('product:updated')
      unsubscribe('product:deleted')
    }
  }
}

export function useOrderRealtime() {
  const { subscribe, unsubscribe, send, isConnected } = useRealtime()

  const onOrderCreated = (callback: (order: any) => void) => {
    subscribe('order:created', callback)
  }

  const onOrderUpdated = (callback: (order: any) => void) => {
    subscribe('order:updated', callback)
  }

  const notifyOrderChange = (action: 'created' | 'updated' | 'deleted', orderId: string, data?: any) => {
    realtimeService.notifyOrderChange(action, orderId, data)
  }

  return {
    isConnected,
    onOrderCreated,
    onOrderUpdated,
    notifyOrderChange,
    cleanup: () => {
      unsubscribe('order:created')
      unsubscribe('order:updated')
    }
  }
}

export function useCustomerRealtime() {
  const { subscribe, unsubscribe, send, isConnected } = useRealtime()

  const onCustomerCreated = (callback: (customer: any) => void) => {
    subscribe('customer:created', callback)
  }

  const onCustomerUpdated = (callback: (customer: any) => void) => {
    subscribe('customer:updated', callback)
  }

  const notifyCustomerChange = (action: 'created' | 'updated' | 'deleted', customerId: string, data?: any) => {
    realtimeService.notifyCustomerChange(action, customerId, data)
  }

  return {
    isConnected,
    onCustomerCreated,
    onCustomerUpdated,
    notifyCustomerChange,
    cleanup: () => {
      unsubscribe('customer:created')
      unsubscribe('customer:updated')
    }
  }
}

export function useAnalyticsRealtime() {
  const { subscribe, unsubscribe, isConnected } = useRealtime()

  const onAnalyticsUpdated = (callback: (data: any) => void) => {
    subscribe('analytics:updated', callback)
  }

  return {
    isConnected,
    onAnalyticsUpdated,
    cleanup: () => {
      unsubscribe('analytics:updated')
    }
  }
}