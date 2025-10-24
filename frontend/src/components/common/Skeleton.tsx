'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
  ...props
}: SkeletonProps) {
  const baseClasses = 'bg-neutral-200 dark:bg-neutral-700'
  
  const variantClasses = {
    text: 'rounded-sm',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  }
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-ping',
    none: '',
  }
  
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }
  
  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
      {...props}
    />
  )
}

// Predefined skeleton components for common use cases
export function ProductCardSkeleton() {
  return (
    <div className="card p-0 overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="h-64 w-full" variant="rectangular" />
      
      <div className="p-6 space-y-4">
        {/* Category */}
        <Skeleton className="h-4 w-20" variant="rounded" />
        
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" variant="rounded" />
          <Skeleton className="h-6 w-3/4" variant="rounded" />
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" variant="rounded" />
          <Skeleton className="h-4 w-5/6" variant="rounded" />
        </div>
        
        {/* Features */}
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" variant="rounded" />
          <Skeleton className="h-6 w-20" variant="rounded" />
          <Skeleton className="h-6 w-14" variant="rounded" />
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-4" variant="circular" />
            ))}
          </div>
          <Skeleton className="h-4 w-16" variant="rounded" />
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-24" variant="rounded" />
            <Skeleton className="h-4 w-20" variant="rounded" />
          </div>
          <Skeleton className="h-6 w-16" variant="rounded" />
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          <Skeleton className="h-12 flex-1" variant="rounded" />
          <Skeleton className="h-12 w-12" variant="rounded" />
        </div>
      </div>
    </div>
  )
}

export function HeaderSkeleton() {
  return (
    <div className="h-20 bg-white border-b border-neutral-200">
      <div className="container-modern h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10" variant="rounded" />
          <div className="space-y-1">
            <Skeleton className="h-6 w-32" variant="rounded" />
            <Skeleton className="h-3 w-24" variant="rounded" />
          </div>
        </div>
        
        {/* Navigation */}
        <div className="hidden lg:flex items-center space-x-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-16" variant="rounded" />
          ))}
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Skeleton className="w-11 h-11" variant="rounded" />
          <Skeleton className="w-11 h-11" variant="rounded" />
          <Skeleton className="h-10 w-20" variant="rounded" />
          <Skeleton className="h-10 w-24" variant="rounded" />
        </div>
      </div>
    </div>
  )
}

export function DashboardCardSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" variant="rounded" />
        <Skeleton className="w-8 h-8" variant="circular" />
      </div>
      
      <div className="space-y-3">
        <Skeleton className="h-10 w-20" variant="rounded" />
        <Skeleton className="h-4 w-full" variant="rounded" />
        
        <div className="flex items-center gap-2 mt-4">
          <Skeleton className="w-4 h-4" variant="circular" />
          <Skeleton className="h-4 w-24" variant="rounded" />
        </div>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" variant="rounded" />
          <Skeleton className="h-10 w-24" variant="rounded" />
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr>
              {[...Array(columns)].map((_, i) => (
                <th key={i} className="p-4">
                  <Skeleton className="h-4 w-20" variant="rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(rows)].map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-neutral-100">
                {[...Array(columns)].map((_, colIndex) => (
                  <td key={colIndex} className="p-4">
                    <Skeleton 
                      className="h-4" 
                      width={colIndex === 0 ? '80%' : colIndex === columns - 1 ? '60%' : '100%'}
                      variant="rounded" 
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="card p-6 space-y-6">
      <Skeleton className="h-8 w-48" variant="rounded" />
      
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" variant="rounded" />
            <Skeleton className="h-12 w-full" variant="rounded" />
          </div>
        ))}
      </div>
      
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-12 w-24" variant="rounded" />
        <Skeleton className="h-12 w-20" variant="rounded" />
      </div>
    </div>
  )
}

