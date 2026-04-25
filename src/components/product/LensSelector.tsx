'use client'

import { cn } from '@/lib/utils'
import type { LensPackage } from '@/types/product'
import { VI } from '@/constants/vietnamese'
import { formatVND } from '@/lib/utils'

interface LensSelectorProps {
  packages: LensPackage[]
  selectedId: string
  onChange: (id: string) => void
}

export default function LensSelector({ packages, selectedId, onChange }: LensSelectorProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-brand-black mb-1">{VI.product.lensSelectTitle}</p>
      <p className="text-xs text-brand-muted mb-3">{VI.product.lensSelectSub}</p>

      <div className="flex flex-col gap-2">
        {packages.map(pkg => (
          <button
            key={pkg.id}
            onClick={() => onChange(pkg.id)}
            className={cn(
              'flex items-start gap-3 p-3 rounded-xl border text-left transition-all',
              selectedId === pkg.id
                ? 'border-brand-black bg-gray-50'
                : 'border-brand-border hover:border-gray-400 bg-white'
            )}
          >
            {/* Radio indicator */}
            <div className={cn(
              'w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 transition-colors',
              selectedId === pkg.id ? 'border-brand-black bg-brand-black' : 'border-gray-300'
            )}>
              {selectedId === pkg.id && (
                <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-px" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-brand-black">{pkg.name}</span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {pkg.recommended && (
                    <span className="text-xs bg-brand-gold text-white px-1.5 py-0.5 rounded-full font-semibold">
                      {VI.product.recommended}
                    </span>
                  )}
                  <span className="text-sm font-bold text-brand-black">
                    {pkg.additionalPrice === 0 ? VI.common.free : `+${formatVND(pkg.additionalPrice)}`}
                  </span>
                </div>
              </div>
              <p className="text-xs text-brand-muted mt-0.5 leading-relaxed">{pkg.description}</p>
              {pkg.features.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {pkg.features.map(f => (
                    <span key={f} className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
