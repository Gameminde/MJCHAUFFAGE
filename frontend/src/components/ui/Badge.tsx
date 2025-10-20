'use client';

import React, { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Badge Component - Modern 2025 Design for Status Display
 * 
 * @example
 * <Badge variant="success">En stock</Badge>
 * <Badge variant="warning" size="lg">Stock faible</Badge>
 */

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-medium rounded-full transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200',
        primary: 'bg-primary-100 text-primary-800 hover:bg-primary-200',
        secondary: 'bg-neutral-100 text-neutral-700 border border-neutral-300 hover:bg-neutral-200',
        success: 'bg-green-100 text-green-800 hover:bg-green-200',
        warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        error: 'bg-red-100 text-red-800 hover:bg-red-200',
        info: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
        accent: 'bg-accent-100 text-accent-800 hover:bg-accent-200',
        // Gradient variants
        'gradient-primary': 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm',
        'gradient-accent': 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-sm',
        'gradient-success': 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm',
      },
      animation: {
        none: '',
        pulse: 'animate-pulse',
        bounce: 'animate-bounce',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      animation: 'none',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Badge content */
  children?: React.ReactNode;
  /** Icon to display before text */
  icon?: React.ReactNode;
  /** Show dot indicator */
  dot?: boolean;
  /** Dot color (for status indicators) */
  dotColor?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  /** Close button callback */
  onClose?: () => void;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      animation,
      children,
      icon,
      dot,
      dotColor,
      onClose,
      ...props
    },
    ref
  ) => {
    const dotColors = {
      primary: 'bg-primary-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
    };

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, animation, className }))}
        {...props}
      >
        {/* Dot Indicator */}
        {dot && (
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              dotColor ? dotColors[dotColor] : 'bg-current'
            )}
            aria-hidden="true"
          />
        )}

        {/* Icon */}
        {icon && <span className="inline-flex shrink-0">{icon}</span>}

        {/* Content */}
        {children && <span>{children}</span>}

        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex shrink-0 hover:opacity-70 transition-opacity"
            aria-label="Remove badge"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Stock Status Badge Component (specific for MJ CHAUFFAGE)
export interface StockBadgeProps extends Omit<BadgeProps, 'variant' | 'dot' | 'dotColor'> {
  /** Stock quantity */
  stock: number;
  /** Low stock threshold */
  lowStockThreshold?: number;
}

const StockBadge = forwardRef<HTMLSpanElement, StockBadgeProps>(
  ({ stock, lowStockThreshold = 5, ...props }, ref) => {
    const getVariant = () => {
      if (stock === 0) return 'error';
      if (stock <= lowStockThreshold) return 'warning';
      return 'success';
    };

    const getLabel = () => {
      if (stock === 0) return 'Rupture de stock';
      if (stock <= lowStockThreshold) return 'Stock faible';
      return 'En stock';
    };

    return (
      <Badge
        ref={ref}
        variant={getVariant()}
        dot
        dotColor={getVariant() as any}
        {...props}
      >
        {getLabel()}
      </Badge>
    );
  }
);

StockBadge.displayName = 'StockBadge';

// Order Status Badge Component (specific for MJ CHAUFFAGE)
export interface OrderStatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  /** Order status */
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

const OrderStatusBadge = forwardRef<HTMLSpanElement, OrderStatusBadgeProps>(
  ({ status, ...props }, ref) => {
    const statusConfig = {
      pending: { variant: 'warning' as const, label: 'En attente' },
      confirmed: { variant: 'info' as const, label: 'Confirmée' },
      processing: { variant: 'primary' as const, label: 'En traitement' },
      shipped: { variant: 'accent' as const, label: 'Expédiée' },
      delivered: { variant: 'success' as const, label: 'Livrée' },
      cancelled: { variant: 'error' as const, label: 'Annulée' },
    };

    const config = statusConfig[status];

    return (
      <Badge ref={ref} variant={config.variant} {...props}>
        {config.label}
      </Badge>
    );
  }
);

OrderStatusBadge.displayName = 'OrderStatusBadge';

export { Badge, StockBadge, OrderStatusBadge, badgeVariants };

