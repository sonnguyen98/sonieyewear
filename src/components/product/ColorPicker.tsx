'use client'

import { cn } from '@/lib/utils'
import type { ColorVariant } from '@/types/product'
import { VI } from '@/constants/vietnamese'

interface ColorPickerProps {
  variants: ColorVariant[]
  selectedId: string
  onChange: (id: string) => void
}

export default function ColorPicker({ variants, selectedId, onChange }: ColorPickerProps) {
  const selected = variants.find(v => v.id === selectedId) ?? variants[0]

  return (
    <div>
      <p className="text-sm font-semibold text-brand-black mb-2">
        {VI.product.colorTitle}: <span className="font-normal text-brand-muted">{selected.name}</span>
      </p>
      <div className="flex gap-2 flex-wrap">
        {variants.map(v => (
          <button
            key={v.id}
            onClick={() => onChange(v.id)}
            disabled={!v.inStock}
            title={`${v.name}${!v.inStock ? ' — Hết hàng' : ''}`}
            className={cn(
              'w-8 h-8 rounded-full border-3 transition-all relative',
              v.id === selectedId
                ? 'border-brand-black ring-2 ring-brand-black ring-offset-2'
                : 'border-brand-border hover:border-gray-400',
              !v.inStock && 'opacity-40 cursor-not-allowed'
            )}
            style={{ backgroundColor: v.hex }}
          >
            {!v.inStock && (
              <span className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-0.5 bg-gray-400 rotate-45" />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
