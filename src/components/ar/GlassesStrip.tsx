'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'
import { VI } from '@/constants/vietnamese'
import { buildZaloOrderMessage, openZalo } from '@/lib/zalo'

interface GlassesStripProps {
  products: Product[]
  selectedProductId: string | null
  onSelect: (id: string) => void
}

export default function GlassesStrip({ products, selectedProductId, onSelect }: GlassesStripProps) {
  function handleOrder(product: Product) {
    const color = product.colorVariants[0]
    const lens = product.lensPackages[0]
    openZalo(buildZaloOrderMessage(product, color, lens))
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm">
      <div className="px-3 pt-2 pb-1">
        <p className="text-xs text-gray-300 font-medium mb-2 text-center">{VI.ar.selectGlasses}</p>
      </div>

      {/* Scrollable strip */}
      <div className="flex gap-2 overflow-x-auto px-3 pb-safe scrollbar-none pb-3">
        {products.map(product => {
          const isSelected = product.id === selectedProductId
          const color = product.colorVariants[0]

          return (
            <button
              key={product.id}
              onClick={() => onSelect(product.id)}
              className={cn(
                'flex-shrink-0 flex flex-col items-center gap-1 p-1.5 rounded-xl border-2 transition-all',
                isSelected
                  ? 'border-brand-zalo bg-brand-zalo/20'
                  : 'border-white/20 hover:border-white/40 bg-white/10'
              )}
            >
              <div className="w-16 h-12 relative rounded-lg overflow-hidden bg-white/10">
                <Image
                  src={color.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <span className="text-white text-xs font-medium leading-none max-w-[4rem] line-clamp-1 text-center">
                {product.name.split(' ').slice(-1)[0]}
              </span>
            </button>
          )
        })}
      </div>

      {/* CTA for selected product */}
      {selectedProductId && (() => {
        const selected = products.find(p => p.id === selectedProductId)
        if (!selected) return null
        return (
          <div className="px-3 pb-3">
            <button
              onClick={() => handleOrder(selected)}
              className="w-full bg-brand-zalo text-white font-semibold text-sm py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
            >
              {VI.ar.orderThisFrame}: {selected.name}
            </button>
          </div>
        )
      })()}
    </div>
  )
}
