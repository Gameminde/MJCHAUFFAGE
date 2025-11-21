'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/useMobile';

interface MobileLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  className?: string;
  color?: 'orange' | 'neutral' | 'white';
}

export const MobileLoading: React.FC<MobileLoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  className,
  color = 'orange',
}) => {
  const { isMobile } = useMobile();

  const sizeClasses = {
    sm: isMobile ? 'w-4 h-4' : 'w-6 h-6',
    md: isMobile ? 'w-6 h-6' : 'w-8 h-8',
    lg: isMobile ? 'w-8 h-8' : 'w-12 h-12',
  };

  const colorClasses = {
    orange: 'text-orange-600',
    neutral: 'text-neutral-600',
    white: 'text-white',
  };

  if (variant === 'spinner') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <svg
          className={cn(
            'animate-spin',
            sizeClasses[size],
            colorClasses[color]
          )}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center space-x-1', className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'rounded-full animate-pulse',
              size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4',
              colorClasses[color]
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: isMobile ? '1s' : '1.5s',
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div
          className={cn(
            'rounded-full animate-pulse',
            sizeClasses[size],
            color === 'orange' ? 'bg-orange-200' :
            color === 'neutral' ? 'bg-neutral-200' : 'bg-white/20'
          )}
        />
      </div>
    );
  }

  return null;
};

export default MobileLoading;
