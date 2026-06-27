'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { formatVND, cn } from '@/lib/utils'
import { useCart } from '@/lib/cartStore'
import CheckoutOverlay from '@/components/landing/CheckoutOverlay'
import ReviewSection from '@/components/review/ReviewSection'

interface QuickViewProduct {
  id: string
  name: string
  basePrice: number
  description: string
  features: string[]
  specs: { bridgeWidth: number; lensWidth: number; templeLength: number; frameWidth: string; weight: number }
  rating: number
  reviewCount: number
  colorVariants: {
    id: string
    name: string
    hex: string
    imageUrl: string
    inStock: boolean
  }[]
  images: string[]
}

interface ProductQuickViewProps {
  product: QuickViewProduct
  onClose: () => void
}

export default function ProductQuickView({ product, onClose }: ProductQuickViewProps) {
  const [selectedColorIdx, setSelectedColorIdx] = useState(() => {
    const idx = product.colorVariants.findIndex(c => c.inStock)
    return idx >= 0 ? idx : 0
  })
  const [qty, setQty] = useState(1)
  const [addedMsg, setAddedMsg] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)
  const { addItem } = useCart()

  const color = product.colorVariants[selectedColorIdx]
  const discounted = Math.round(product.basePrice * 0.8)
  const mainImage = color?.imageUrl || product.images?.[0] || ''

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function handleAddToCart() {
    if (!color?.inStock) return
    for (let i = 0; i < qty; i++) {
      addItem({
        productId: product.id,
        productName: product.name,
        colorId: color.id,
        colorName: color.name,
        colorHex: color.hex,
        image: color.imageUrl || product.images?.[0] || '',
        price: discounted,
        originalPrice: product.basePrice,
      })
    }
    setAddedMsg('Đã thêm vào giỏ!')
    setTimeout(() => setAddedMsg(''), 2000)
  }

  function handleBuyNow() {
    handleAddToCart()
    setTimeout(() => setShowCheckout(true), 200)
  }

  if (showCheckout) {
    return <CheckoutOverlay onClose={onClose} />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-lg max-h-[92vh] rounded-t-2xl overflow-hidden flex flex-col shadow-2xl animate-slide-in-up">
        {/* Close */}
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/30 backdrop-blur rounded-full flex items-center justify-center text-white">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero image + price overlay */}
          <div className="relative">
            <div className="aspect-square bg-gray-50 relative">
              {mainImage && (
                <Image src={mainImage} alt={product.name} fill className="object-contain p-4" sizes="(max-width: 512px) 100vw, 512px" />
              )}
            </div>
            {/* Price badge */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-8 pb-3 px-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">-20%</span>
                <span className="text-2xl font-extrabold text-red-500">{formatVND(discounted)}</span>
              </div>
              <p className="text-sm text-gray-400 line-through">{formatVND(product.basePrice)}</p>
            </div>
          </div>

          {/* Product name */}
          <div className="px-4 pb-4">
            <h3 className="text-base font-bold text-brand-black leading-tight">{product.name}</h3>
          </div>

          {/* Color variants */}
          {product.colorVariants.length > 1 && (
            <div className="px-4 pb-4">
              <p className="text-xs font-bold text-gray-600 mb-2">Màu sắc</p>
              <div className="grid grid-cols-3 gap-2">
                {product.colorVariants.map((c, i) => (
                  <button key={c.id} onClick={() => { setSelectedColorIdx(i) }}
                    className={cn(
                      'rounded-xl border-2 p-1.5 transition-all relative',
                      selectedColorIdx === i ? 'border-red-500' : 'border-gray-100 hover:border-gray-300',
                      !c.inStock && 'opacity-40'
                    )}>
                    <div className="aspect-square bg-gray-50 rounded-lg relative overflow-hidden mb-1.5">
                      {c.imageUrl && (
                        <Image src={c.imageUrl} alt={c.name} fill className="object-contain p-1" sizes="120px" />
                      )}
                    </div>
                    <p className="text-[11px] font-semibold text-center text-brand-black truncate">{c.name}</p>
                    {!c.inStock && (
                      <span className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-xl text-[10px] font-bold text-gray-500">Hết hàng</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="px-4 pb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600">Số lượng</span>
            <div className="flex items-center">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center rounded-l-lg border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold">−</button>
              <span className="w-12 h-9 flex items-center justify-center border-y border-gray-200 text-sm font-bold">{qty}</span>
              <button onClick={() => setQty(q => q + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-r-lg border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold">+</button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-2 bg-gray-100" />

          {/* Description */}
          <div className="px-4 py-4">
            <h4 className="text-sm font-bold text-brand-black mb-2">Đặc điểm sản phẩm</h4>
            {product.features.length > 0 && (
              <ul className="space-y-1.5">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-brand-black">
                    <span className="text-orange-500 flex-shrink-0 mt-0.5">✓</span>{f}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Specs */}
          {product.specs && (
            <div className="px-4 py-3 border-t border-gray-100">
              <h4 className="text-sm font-bold text-brand-black mb-2">Kích Thước Gọng</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Ngang gọng', value: product.specs.frameWidth },
                  { label: 'Mắt kính', value: `${product.specs.lensWidth}mm` },
                  { label: 'Cầu mũi', value: `${product.specs.bridgeWidth}mm` },
                  { label: 'Càng kính', value: `${product.specs.templeLength}mm` },
                  { label: 'Trọng lượng', value: `${product.specs.weight}g` },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-lg px-2.5 py-2 text-center">
                    <p className="text-[10px] text-brand-muted">{s.label}</p>
                    <p className="text-xs font-bold text-brand-black">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="h-2 bg-gray-100" />

          {/* Reviews */}
          <div className="px-4 py-4 pb-6">
            <ReviewSection productId={product.id} />
          </div>
        </div>

        {/* Fixed bottom bar */}
        <div className="border-t border-gray-100 px-4 py-3 bg-white flex gap-2.5 pb-safe">
          {addedMsg ? (
            <div className="flex-1 bg-green-50 text-green-700 font-bold py-3 rounded-xl text-center text-sm">
              ✅ {addedMsg}
            </div>
          ) : (
            <>
              <button onClick={handleAddToCart} disabled={!color?.inStock}
                className="flex-1 border-2 border-brand-black text-brand-black font-bold py-3 rounded-xl text-sm transition-all active:scale-95 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                Thêm vào giỏ hàng
              </button>
              <button onClick={handleBuyNow} disabled={!color?.inStock}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                <span className="block">Mua ngay</span>
                <span className="block text-[10px] font-normal opacity-90">{formatVND(discounted * qty)} | Freeship</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
