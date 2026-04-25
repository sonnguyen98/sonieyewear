import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  reviewCount?: number
  size?: 'sm' | 'md'
  className?: string
}

export default function StarRating({ rating, reviewCount, size = 'sm', className }: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => {
          const fill = Math.min(1, Math.max(0, rating - (star - 1)))
          return (
            <svg
              key={star}
              className={cn(size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4')}
              viewBox="0 0 20 20"
            >
              <defs>
                <linearGradient id={`star-${star}-${rating}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset={`${fill * 100}%`} stopColor="#D4A853" />
                  <stop offset={`${fill * 100}%`} stopColor="#E5E7EB" />
                </linearGradient>
              </defs>
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                fill={`url(#star-${star}-${rating})`}
              />
            </svg>
          )
        })}
      </div>
      <span className={cn('font-semibold text-brand-black', size === 'sm' ? 'text-xs' : 'text-sm')}>
        {rating.toFixed(1)}
      </span>
      {reviewCount !== undefined && (
        <span className={cn('text-brand-muted', size === 'sm' ? 'text-xs' : 'text-sm')}>
          ({reviewCount.toLocaleString('vi-VN')})
        </span>
      )}
    </div>
  )
}
