'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { Product, ColorVariant } from '@/types/product'

interface ImageGalleryProps {
  product: Product
  selectedColor: ColorVariant
}

export default function ImageGallery({ product, selectedColor }: ImageGalleryProps) {
  const getColorImages = (color: ColorVariant): string[] => {
    if (color.images && color.images.length > 0) return color.images
    if (color.imageUrl) return [color.imageUrl, ...product.modelImages]
    return product.images?.length ? product.images : []
  }

  const [images, setImages] = useState<string[]>(() => getColorImages(selectedColor))
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    setImages(getColorImages(selectedColor))
    setActiveIdx(0)
  }, [selectedColor.id])

  const unique = Array.from(new Set(images)).filter(Boolean)

  return (
    <div className="flex flex-col gap-3">
      {/* Ảnh chính — full width, tỉ lệ vuông */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-brand-light group border border-brand-border">
        <Image
          src={unique[activeIdx] ?? unique[0] ?? '/images/logo.png'}
          alt={`${product.name} - ${selectedColor.name}`}
          fill
          className="object-contain transition-transform duration-300 group-hover:scale-105 p-4"
          sizes="(max-width: 768px) 100vw, 55vw"
          unoptimized
          priority
        />

        {/* Arrows */}
        {unique.length > 1 && (
          <>
            <button
              onClick={() => setActiveIdx(i => (i - 1 + unique.length) % unique.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button
              onClick={() => setActiveIdx(i => (i + 1) % unique.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip — ngang bên dưới */}
      {unique.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {unique.slice(0, 8).map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActiveIdx(i)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                i === activeIdx
                  ? 'border-brand-black shadow-sm'
                  : 'border-brand-border hover:border-gray-400'
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
