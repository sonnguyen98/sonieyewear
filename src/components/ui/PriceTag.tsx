import { cn } from '@/lib/utils'
import { formatVND } from '@/lib/utils'

interface PriceTagProps {
  price: number
  originalPrice?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function PriceTag({ price, size = 'md', className }: PriceTagProps) {
  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <span
        className={cn('font-bold text-brand-black', {
          'text-sm': size === 'sm',
          'text-lg': size === 'md',
          'text-2xl': size === 'lg',
        })}
      >
        {formatVND(price)}
      </span>
    </div>
  )
}
