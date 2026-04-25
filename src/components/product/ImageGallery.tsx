'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { Product, ColorVariant } from '@/types/product'

interface ImageGalleryProps {
  product: Product
  selectedColor: ColorVariant
}

export default function ImageGallery({ product, selectedColor }: ImageGalleryProps) {
  // Lấy ảnh theo thứ tự ưu tiên:
  // 1. images[] của màu đang chọn
  // 2. imageUrl của màu đang chọn
  // 3. product.images[] chung
  const getColorImages = (color: ColorVariant): string[] => {
    if (color.images && color.images.length > 0) return color.images
    if (color.imageUrl) return [color.imageUrl, ...product.modelImages]
    return product.images?.length ? product.images : []
  }

  const [images, setImages] = useState<string[]>(() => getColorImages(selectedColor))
  const [activeIdx, setActiveIdx] = useState(0)

  // Khi đổi màu → reset về ảnh đầu tiên của màu mới
  useEffect(() => {
    setImages(getColorImages(selectedColor))
    setActiveIdx(0)
  }, [selectedColor.id])

  const unique = Array.from(new Set(images)).filter(Boolean)

  return (
    <div className="flex gap-3">
      {/* Thumbnail strip */}
      <div className="flex flex-col gap-2 w-16 flex-shrink-0">
        {unique.slice(0, 6).map((src, i) => (
          <button
            key={src + i}
            onClick={() => setActiveIdx(i)}
            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
              i === activeIdx ? 'border-brand-black' : 'border-brand-border hover:border-gray-400'
            }`}
          >
            <Image src={src} alt={`${selectedColor.name} ${i + 1}`} fill
              className="object-contain" sizes="64px" unoptimized />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="flex-1 relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-brand-light group">
        <Image
          src={unique[activeIdx] ?? unique[0] ?? '/images/logo.png'}
          alt={`${product.name} - ${selectedColor.name}`}
          fill
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized
          priority
        />

        {/* Navigation arrows nếu có nhiều ảnh */}
        {unique.length > 1 && (
          <>
            <button
              onClick={() => setActiveIdx(i => (i - 1 + unique.length) % unique.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button
              onClick={() => setActiveIdx(i => (i + 1) % unique.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
            {/* Dot indicator */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {unique.map((_, i) => (
                <button key={i} onClick={() => setActiveIdx(i)}
                  className={`rounded-full transition-all ${i === activeIdx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/60'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
