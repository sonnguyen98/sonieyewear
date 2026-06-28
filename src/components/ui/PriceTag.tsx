import { cn } from '@/lib/utils'
import { formatVND } from '@/lib/utils'

interface PriceTagProps {
  price: number
  originalPrice?: number
  discountPercent?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function PriceTag({ price, originalPrice, discountPercent, size = 'md', className }: PriceTagProps) {
  const pct = discountPercent ?? 0
  const discounted = pct > 0 ? Math.round(price * (1 - pct / 100)) : price
  const showOriginal = pct > 0 || (originalPrice && originalPrice > price)
  const strikePrice = originalPrice ?? (pct > 0 ? price : undefined)

  return (
    <div className={cn('flex items-center gap-1.5 flex-wrap', className)}>
      <span className={cn('font-bold text-brand-black', {
        'text-sm': size === 'sm',
        'text-lg': size === 'md',
        'text-2xl': size === 'lg',
      })}>
        {formatVND(discounted)}
      </span>
      {showOriginal && strikePrice && (
        <span className={cn('text-gray-400 line-through', {
          'text-[10px]': size === 'sm',
          'text-xs': size === 'md',
          'text-sm': size === 'lg',
        })}>
          {formatVND(strikePrice)}
        </span>
      )}
      {pct > 0 && (
        <span className={cn('bg-red-500 text-white font-bold rounded-full', {
          'text-[9px] px-1.5 py-0.5': size === 'sm',
          'text-[10px] px-2 py-0.5': size === 'md',
          'text-xs px-2 py-0.5': size === 'lg',
        })}>
          -{pct}%
        </span>
      )}
    </div>
  )
}
