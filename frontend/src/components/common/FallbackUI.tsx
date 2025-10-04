'use client'

import { AlertCircle, Wifi, RefreshCw } from 'lucide-react'
import { Skeleton } from './Skeleton'

interface FallbackUIProps {
  type: 'loading' | 'error' | 'offline' | 'empty'
  title?: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function FallbackUI({ 
  type, 
  title, 
  message, 
  action, 
  className = '' 
}: FallbackUIProps) {
  const getContent = () => {
    switch (type) {
      case 'loading':
        return {
          icon: null,
          title: title || 'Chargement...',
          message: message || 'Veuillez patienter pendant le chargement des données.',
          showSkeleton: true
        }
      
      case 'error':
        return {
          icon: <AlertCircle className="w-12 h-12 text-red-500" />,
          title: title || 'Erreur de chargement',
          message: message || 'Une erreur s\'est produite lors du chargement des données.',
          showSkeleton: false
        }
      
      case 'offline':
        return {
          icon: <Wifi className="w-12 h-12 text-gray-400" />,
          title: title || 'Connexion perdue',
          message: message || 'Vérifiez votre connexion internet et réessayez.',
          showSkeleton: false
        }
      
      case 'empty':
        return {
          icon: <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-2xl">📦</div>,
          title: title || 'Aucun résultat',
          message: message || 'Aucune donnée disponible pour le moment.',
          showSkeleton: false
        }
      
      default:
        return {
          icon: null,
          title: 'Chargement...',
          message: '',
          showSkeleton: true
        }
    }
  }

  const content = getContent()

  if (content.showSkeleton) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-[300px] text-center p-8 ${className}`}>
      {content.icon && (
        <div className="mb-4">
          {content.icon}
        </div>
      )}
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {content.title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {content.message}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {action.label}
        </button>
      )}
    </div>
  )
}

// Specific fallback components for common use cases
export function ProductGridFallback() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TableFallback({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-8" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-6" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function DashboardFallback() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  )
}