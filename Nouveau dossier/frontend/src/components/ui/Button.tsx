'use client';

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Button Component - Modern 2025 Design
 * 
 * @example
 * <Button variant="primary" size="md">Click me</Button>
 * <Button variant="secondary" size="lg" icon={<Icon />}>With Icon</Button>
 */

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:-translate-y-0.5 focus:ring-primary-500 active:translate-y-0 shadow-card hover:shadow-card-hover',
        secondary:
          'bg-white text-primary-600 border-2 border-primary-500 hover:bg-primary-500 hover:text-white hover:-translate-y-0.5 focus:ring-primary-500 active:translate-y-0 shadow-card hover:shadow-card-hover',
        accent:
          'bg-gradient-to-r from-accent-500 to-accent-600 text-white hover:from-accent-600 hover:to-accent-700 hover:-translate-y-0.5 focus:ring-accent-500 active:translate-y-0 shadow-card hover:shadow-card-hover',
        ghost:
          'bg-transparent text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500',
        outline:
          'bg-transparent text-neutral-700 border-2 border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 focus:ring-neutral-500',
        danger:
          'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:-translate-y-0.5 focus:ring-red-500 active:translate-y-0 shadow-card hover:shadow-card-hover',
        success:
          'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:-translate-y-0.5 focus:ring-green-500 active:translate-y-0 shadow-card hover:shadow-card-hover',
      },
      size: {
        sm: 'px-4 py-2 text-xs min-h-[44px]',
        md: 'px-6 py-3 text-sm min-h-[44px]',
        lg: 'px-8 py-4 text-base min-h-[48px]',
        xl: 'px-10 py-5 text-lg min-h-[52px]',
        icon: 'p-3 min-h-[44px] min-w-[44px]',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
      loading: {
        true: 'cursor-wait',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      loading: false,
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Icon to display before the label */
  icon?: React.ReactNode;
  /** Icon to display after the label */
  iconRight?: React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Children (button content) */
  children?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading,
      disabled,
      icon,
      iconRight,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, loading, className }))}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-label="Loading"
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
        )}
        {!loading && icon && <span className="inline-flex shrink-0">{icon}</span>}
        {children && <span>{children}</span>}
        {!loading && iconRight && <span className="inline-flex shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };

