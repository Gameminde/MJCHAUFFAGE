'use client'

import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'ring'
  color?: 'primary' | 'accent' | 'neutral' | 'white'
  className?: string
  text?: string
}

export function Loading({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  className,
  text,
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  const colorClasses = {
    primary: 'text-primary-500 border-primary-500',
    accent: 'text-accent-500 border-accent-500',
    neutral: 'text-neutral-500 border-neutral-500',
    white: 'text-white border-white',
  }

  const renderSpinner = () => (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-transparent border-t-current',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  )

  const renderDots = () => (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full bg-current animate-pulse',
            size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4',
            colorClasses[color]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s',
          }}
        />
      ))}
    </div>
  )

  const renderPulse = () => (
    <div
      className={cn(
        'rounded-full bg-current animate-pulse',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  )

  const renderBars = () => (
    <div className={cn('flex items-end space-x-1', className)}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-current animate-pulse',
            size === 'sm' ? 'w-1' : size === 'md' ? 'w-1.5' : size === 'lg' ? 'w-2' : 'w-3',
            colorClasses[color]
          )}
          style={{
            height: `${20 + (i % 2) * 10}px`,
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  )

  const renderRing = () => (
    <div className={cn('relative', sizeClasses[size], className)}>
      <div
        className={cn(
          'absolute inset-0 rounded-full border-2 border-current opacity-20',
          colorClasses[color]
        )}
      />
      <div
        className={cn(
          'absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin',
          colorClasses[color]
        )}
      />
    </div>
  )

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots()
      case 'pulse':
        return renderPulse()
      case 'bars':
        return renderBars()
      case 'ring':
        return renderRing()
      default:
        return renderSpinner()
    }
  }

  if (text) {
    return (
      <div className="flex items-center space-x-3">
        {renderLoader()}
        <span className={cn('text-sm font-medium', colorClasses[color])}>
          {text}
        </span>
      </div>
    )
  }

  return renderLoader()
}

// Predefined loading components for common use cases
export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center space-y-4">
        <Loading size="xl" variant="ring" />
        <div className="space-y-2">
          <h3 className="text-heading-md font-semibold text-neutral-900">Loading</h3>
          <p className="text-body-sm text-neutral-600">Please wait while we load the content...</p>
        </div>
      </div>
    </div>
  )
}

export function CardLoading() {
  return (
    <div className="card p-6 flex items-center justify-center">
      <Loading size="lg" variant="spinner" text="Loading..." />
    </div>
  )
}

export function ButtonLoading({ children, loading, ...props }: any) {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <Loading size="sm" color="white" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}

export function InlineLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center space-x-2 text-neutral-600">
      <Loading size="sm" variant="dots" />
      <span className="text-body-sm">{text}</span>
    </div>
  )
}

export function FullScreenLoading() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center space-y-6">
        <div className="relative">
          <Loading size="xl" variant="ring" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-gradient-primary rounded-full animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-heading-lg font-display font-bold text-neutral-900">
            MJ CHAUFFAGE
          </h3>
          <p className="text-body-md text-neutral-600">Loading your experience...</p>
        </div>
      </div>
    </div>
  )
}

