import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'gold' | 'green' | 'red' | 'muted'
  className?: string
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide',
        {
          'bg-brand-black text-white': variant === 'default',
          'bg-brand-gold text-white': variant === 'gold',
          'bg-green-100 text-green-800': variant === 'green',
          'bg-red-100 text-red-700': variant === 'red',
          'bg-gray-100 text-brand-muted': variant === 'muted',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
