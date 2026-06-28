'use client'

import { useState, useEffect } from 'react'
import { formatVND } from '@/lib/utils'
import type { CartLens } from '@/lib/cartStore'

interface LensProduct {
  id: string
  name: string
  desc: string
  price: number
  badge?: string
  features: string[]
  categoryGroup?: string
  free?: boolean
}

interface LensPickerProps {
  currentLens?: CartLens
  onSelect: (lens: CartLens | undefined) => void
  onClose: () => void
}

export default function LensPicker({ currentLens, onSelect, onClose }: LensPickerProps) {
  const [lenses, setLenses] = useState<LensProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/lens-products')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setLenses(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSelect = (lens: LensProduct) => {
    onSelect({ id: lens.id, name: lens.name, price: lens.free ? 0 : lens.price })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg max-h-[85vh] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-extrabold">Chọn Tròng Cắt Kính</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          {loading ? (
            <div className="text-center py-8 text-brand-muted text-sm">Đang tải...</div>
          ) : (
            <>
              {/* Chỉ gọng — không cắt tròng */}
              <button
                onClick={() => { onSelect(undefined); onClose() }}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                  !currentLens ? 'border-brand-zalo bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">Chỉ mua gọng</p>
                    <p className="text-xs text-brand-muted">Không cắt tròng</p>
                  </div>
                  <span className="text-sm font-bold text-green-600">+0đ</span>
                </div>
              </button>

              {lenses.map(lens => (
                <button
                  key={lens.id}
                  onClick={() => handleSelect(lens)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    currentLens?.id === lens.id ? 'border-brand-zalo bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">{lens.name}</p>
                      {lens.free && (
                        <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold">🎁 Tặng FREE</span>
                      )}
                      {lens.badge && !lens.free && (
                        <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-semibold">{lens.badge}</span>
                      )}
                    </div>
                    <div className="text-right">
                      {lens.free ? (
                        <>
                          <span className="text-sm font-bold text-green-600">Tặng FREE</span>
                          <p className="text-[10px] text-gray-400 line-through">{formatVND(lens.price)}</p>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-brand-black">+{formatVND(lens.price)}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-brand-muted line-clamp-1">{lens.desc}</p>
                  {lens.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {lens.features.slice(0, 3).map(f => (
                        <span key={f} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
