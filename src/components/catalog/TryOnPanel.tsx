'use client'

import { useState } from 'react'
import type { Product } from '@/types/product'
import type { GlassesOverlayConfig } from '@/types/ar'
import CaptureView from '@/components/ar/CaptureView'
import TryOnView from '@/components/ar/TryOnView'
import { formatVND } from '@/lib/utils'
import { openZalo } from '@/lib/zalo'

interface TryOnPanelProps {
  product: Product | null
  onClose: () => void
}

export default function TryOnPanel({ product, onClose }: TryOnPanelProps) {
  const [photo, setPhoto] = useState<string | null>(null)
  const [colorIdx, setColorIdx] = useState(0)

  const selectedColor = product?.colorVariants[colorIdx] ?? product?.colorVariants[0]

  // Ưu tiên PNG trong suốt, fallback sang ảnh đầu tiên đã upload
  const allImages = product?.images ?? []
  const productOverlay = allImages.find(img => img.endsWith('.png') || img.endsWith('.webp'))
    ?? (allImages.length > 0 ? allImages[0] : undefined)

  const config: GlassesOverlayConfig | null = product ? {
    productId: product.id,
    overlayType: productOverlay ? 'png' : 'svg',
    overlayImageUrl: selectedColor?.overlayImageUrl ?? '',
    productImageUrl: productOverlay,
    frameColor: selectedColor?.hex ?? '#222',
    frameShape: product.shape,
    verticalOffset: 0.1,
    scaleMultiplier: 1.0,
  } : null

  function handleOrder() {
    if (!product) return
    openZalo(`Xin chào SONi Kính! Tôi muốn đặt hàng:\n- Gọng: ${product.name}\n- Màu: ${selectedColor?.name}\n- Mã SP: ${product.id}\nVui lòng tư vấn thêm ạ.`)
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-full sm:w-[420px] bg-black flex flex-col h-full shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 flex-shrink-0">
          <div className="min-w-0">
            <p className="text-white font-bold text-sm line-clamp-1">{product?.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {photo ? 'Thử gọng trên khuôn mặt bạn' : 'Chụp ảnh để thử gọng'}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 flex-shrink-0 ml-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Camera / TryOn */}
        <div className="flex-1 relative min-h-0">
          {!photo
            ? <CaptureView onCapture={setPhoto} />
            : <TryOnView photoDataUrl={photo} config={config} tryOnMode={true} onRetake={() => setPhoto(null)} />
          }
        </div>

        {/* Bottom */}
        {photo && product && (
          <div className="bg-gray-900 px-4 py-3 flex-shrink-0 space-y-3">
            {/* Colors */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs">Màu:</span>
              {product.colorVariants.map((v, i) => (
                <button key={v.id} onClick={() => setColorIdx(i)}
                  title={v.name}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${colorIdx === i ? 'border-white scale-110' : 'border-gray-600'}`}
                  style={{ backgroundColor: v.hex }}
                />
              ))}
              <span className="text-gray-400 text-xs">{selectedColor?.name}</span>
            </div>

            {/* Price + Order */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-yellow-400 font-black">{formatVND(Math.round(product.basePrice * 0.8))}</span>
                {product.originalPrice && (
                  <span className="text-gray-500 text-xs line-through ml-2">{formatVND(product.basePrice)}</span>
                )}
                <span className="text-green-400 text-xs ml-1">-20%</span>
              </div>
              <button onClick={handleOrder}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2 rounded-full transition-colors">
                Đặt Hàng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
