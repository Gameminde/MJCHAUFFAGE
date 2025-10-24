'use client'

import { useRealtime } from '@/hooks/useRealtime'
import { Wifi, WifiOff } from 'lucide-react'

export function RealtimeStatus() {
  const { isConnected, error } = useRealtime()

  return (
    <div className="flex items-center space-x-2">
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-600">Live</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-600">Offline</span>
        </>
      )}
      {error && (
        <span className="text-xs text-red-500" title={error}>
          Error
        </span>
      )}
    </div>
  )
}