'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'zalo'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-brand-black text-brand-white hover:bg-gray-800 focus-visible:ring-brand-black': variant === 'primary',
            'bg-brand-light text-brand-black hover:bg-gray-200 focus-visible:ring-gray-400': variant === 'secondary',
            'border-2 border-brand-black text-brand-black hover:bg-brand-black hover:text-brand-white focus-visible:ring-brand-black': variant === 'outline',
            'text-brand-black hover:bg-brand-light focus-visible:ring-gray-400': variant === 'ghost',
            'bg-brand-zalo text-white hover:bg-blue-700 focus-visible:ring-brand-zalo animate-pulse-zalo': variant === 'zalo',
          },
          {
            'px-3 py-1.5 text-xs': size === 'sm',
            'px-5 py-2.5 text-sm': size === 'md',
            'px-7 py-3 text-base': size === 'lg',
            'px-8 py-4 text-lg': size === 'xl',
          },
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
