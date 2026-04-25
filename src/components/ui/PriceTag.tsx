import { cn } from '@/lib/utils'
import { formatVND } from '@/lib/utils'

interface PriceTagProps {
  price: number
  originalPrice?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function PriceTag({ price, originalPrice, size = 'md', className }: PriceTagProps) {
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0

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
      {originalPrice && originalPrice > price && (
        <>
          <span
            className={cn('text-brand-muted line-through', {
              'text-xs': size === 'sm',
              'text-sm': size === 'md',
              'text-base': size === 'lg',
            })}
          >
            {formatVND(originalPrice)}
          </span>
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
            -{discount}%
          </span>
        </>
      )}
    </div>
  )
}
