'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Product } from '@/types/product'
import type { FaceLandmarkPoint } from '@/types/ar'
import { computeFaceGeometry, drawGlassesOverlay, generateColoredGlassesSVG } from '@/lib/landmark-math'
import { formatVND } from '@/lib/utils'

interface ARProductCardProps {
  product: Product
  facePhoto: string
  faceLandmarks: FaceLandmarkPoint[]
}

export default function ARProductCard({ product, facePhoto, faceLandmarks }: ARProductCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rendered, setRendered] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Chỉ render khi card hiển thị trên màn hình
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !rendered) {
          renderCanvas()
        }
      },
      { threshold: 0.1 }
    )
    observerRef.current.observe(canvas)
    return () => observerRef.current?.disconnect()
  }, [product.id, rendered])

  async function renderCanvas() {
    const canvas = canvasRef.current
    if (!canvas || rendered) return

    if (typeof window === 'undefined') return
    const photo = new window.Image()
    photo.src = facePhoto
    await new Promise(r => { photo.onload = r })

    canvas.width = photo.naturalWidth
    canvas.height = photo.naturalHeight

    const ctx = canvas.getContext('2d')!
    ctx.drawImage(photo, 0, 0)

    // Tạo SVG kính theo màu và hình dáng sản phẩm
    const color = product.colorVariants[0]
    // Tìm ảnh PNG trong suốt — tất cả ảnh sản phẩm đã upload
    const allImages = product.images ?? []
    const pngUrl = allImages.find(img => img.endsWith('.png') || img.endsWith('.webp'))
      ?? (allImages.length > 0 ? allImages[0] : null)

    const overlayUrl = pngUrl ?? generateColoredGlassesSVG(product.shape, color?.hex ?? '#222')

    const overlayImg = new window.Image()
    overlayImg.crossOrigin = 'anonymous'
    overlayImg.src = overlayUrl
    await new Promise((res, rej) => {
      overlayImg.onload = res
      overlayImg.onerror = () => {
        // fallback SVG nếu ảnh lỗi
        const svgImg = new window.Image()
        svgImg.src = generateColoredGlassesSVG(product.shape, color?.hex ?? '#222')
        svgImg.onload = res
      }
    })

    const geo = computeFaceGeometry(faceLandmarks, canvas.width, canvas.height)

    drawGlassesOverlay(ctx, overlayImg, geo, {
      productId: product.id,
      overlayType: pngUrl ? 'png' : 'svg',
      overlayImageUrl: overlayUrl,
      productImageUrl: pngUrl ?? undefined,
      frameColor: color?.hex ?? '#222',
      frameShape: product.shape,
      verticalOffset: 0.1,
      scaleMultiplier: 1.0,
    })

    setRendered(true)
  }

  const discountedPrice = Math.round(product.basePrice * (1 - (product.discountPercent ?? 20) / 100))

  return (
    <Link href={`/gong-kinh/${product.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-brand-border hover:shadow-lg transition-all block">
      {/* Canvas với ảnh mặt + kính */}
      <div className="relative aspect-[4/3] bg-gray-900 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
        />
        {!rendered && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"/>
          </div>
        )}
        {product.isBestSeller && (
          <span className="absolute top-2 left-2 text-[10px] bg-yellow-400 text-yellow-900 font-bold px-1.5 py-0.5 rounded-full">
            Bán Chạy
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs font-semibold text-brand-black line-clamp-1">{product.name}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-xs font-bold text-brand-black">{formatVND(discountedPrice)}</span>
          <span className="text-[9px] text-gray-400 line-through">{formatVND(product.basePrice)}</span>
          {(product.discountPercent ?? 20) > 0 && <span className="text-[8px] bg-red-500 text-white font-bold px-1 py-0.5 rounded-full">-{product.discountPercent ?? 20}%</span>}
        </div>
        {/* Color swatches */}
        <div className="flex gap-1 mt-1.5">
          {product.colorVariants.slice(0, 4).map(v => (
            <div key={v.id} className="w-3 h-3 rounded-full border border-gray-200"
              style={{ backgroundColor: v.hex }}/>
          ))}
        </div>
      </div>
    </Link>
  )
}
