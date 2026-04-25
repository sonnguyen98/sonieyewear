'use client'

import Link from 'next/link'
import type { Product } from '@/types/product'
import type { FaceLandmarkPoint } from '@/types/ar'
import ProductCard from './ProductCard'
import ARProductCard from './ARProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { VI } from '@/constants/vietnamese'

interface ProductGridProps {
  products: Product[]
  mode: 'static' | 'ar'
  loading?: boolean
  total?: number
  facePhoto?: string | null
  faceLandmarks?: FaceLandmarkPoint[] | null
}

export default function ProductGrid({
  products, mode, loading, total, facePhoto, faceLandmarks
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i}/>)}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">👓</div>
        <h3 className="text-lg font-semibold text-brand-black mb-2">{VI.catalog.noResults}</h3>
        <p className="text-brand-muted text-sm">{VI.catalog.noResultsSub}</p>
      </div>
    )
  }

  // AR mode nhưng chưa có ảnh → nhắc chụp
  if (mode === 'ar' && (!facePhoto || !faceLandmarks)) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="text-6xl">📸</div>
        <p className="text-lg font-bold text-brand-black">Chưa có ảnh khuôn mặt</p>
        <p className="text-sm text-brand-muted">Chụp ảnh để thử gọng kính lên khuôn mặt của bạn</p>
        <Link href="/thu-kinh"
          className="inline-flex items-center gap-2 bg-brand-zalo text-white font-bold px-6 py-3 rounded-full hover:bg-blue-700 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          Chụp Ảnh Ngay
        </Link>
      </div>
    )
  }

  return (
    <div>
      {mode === 'static' && total !== undefined && (
        <p className="text-xs text-brand-muted mb-3">
          {VI.catalog.showingResults(products.length, total)}
        </p>
      )}
      {mode === 'ar' && facePhoto && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-brand-muted">
            Đang hiển thị {products.length} mẫu gọng trên khuôn mặt của bạn
          </p>
          <Link href="/thu-kinh"
            className="text-xs text-brand-zalo font-semibold hover:underline flex items-center gap-1">
            📸 Chụp lại
          </Link>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        {products.map(product =>
          mode === 'ar' && facePhoto && faceLandmarks ? (
            <ARProductCard
              key={product.id}
              product={product}
              facePhoto={facePhoto}
              faceLandmarks={faceLandmarks}
            />
          ) : (
            <ProductCard key={product.id} product={product}/>
          )
        )}
      </div>
    </div>
  )
}
