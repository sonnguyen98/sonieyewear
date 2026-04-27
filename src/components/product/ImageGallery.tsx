'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Product, ColorVariant } from '@/types/product'

interface ImageGalleryProps {
  product: Product
  selectedColor: ColorVariant
}

const ZOOM_FACTOR = 2.5

export default function ImageGallery({ product, selectedColor }: ImageGalleryProps) {
  const getColorImages = (color: ColorVariant): string[] => {
    if (color.images && color.images.length > 0) return color.images
    if (color.imageUrl) return [color.imageUrl, ...product.modelImages]
    return product.images?.length ? product.images : []
  }

  const [images, setImages] = useState<string[]>(() => getColorImages(selectedColor))
  const [activeIdx, setActiveIdx] = useState(0)
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setImages(getColorImages(selectedColor))
    setActiveIdx(0)
  }, [selectedColor.id])

  const unique = Array.from(new Set(images)).filter(Boolean)
  const currentSrc = unique[activeIdx] ?? unique[0] ?? '/images/logo.png'

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    setMouse({ x, y })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Ảnh chính */}
      <div
        ref={containerRef}
        className="relative aspect-square w-full rounded-2xl overflow-hidden bg-brand-light border border-brand-border cursor-zoom-in select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMouse(null)}
      >
        <Image
          src={currentSrc}
          alt={`${product.name} - ${selectedColor.name}`}
          fill
          className="object-contain p-4 transition-transform duration-100"
          style={mouse ? {
            transform: `scale(${ZOOM_FACTOR})`,
            transformOrigin: `${mouse.x * 100}% ${mouse.y * 100}%`,
          } : {
            transform: 'scale(1)',
            transformOrigin: 'center center',
          }}
          sizes="(max-width: 768px) 100vw, 55vw"
          unoptimized
          priority
        />

        {/* Arrows — ẩn khi đang zoom */}
        {unique.length > 1 && !mouse && (
          <>
            <button
              onClick={() => setActiveIdx(i => (i - 1 + unique.length) % unique.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button
              onClick={() => setActiveIdx(i => (i + 1) % unique.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails ngang */}
      {unique.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {unique.slice(0, 8).map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActiveIdx(i)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                i === activeIdx ? 'border-brand-black shadow-sm' : 'border-brand-border hover:border-gray-400'
              }`}
            >
              <Image src={src} alt={`${selectedColor.name} ${i + 1}`} fill
                className="object-contain p-1" sizes="64px" unoptimized />
            </button>
          ))}
        </div>
      )}

    </div>
  )
}
