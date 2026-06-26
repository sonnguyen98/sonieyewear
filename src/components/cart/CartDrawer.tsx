'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cartStore'
import { formatVND } from '@/lib/utils'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart()

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-extrabold text-brand-black">
            Giỏ Hàng ({totalItems})
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl">
                🛒
              </div>
              <p className="text-brand-muted text-sm">Giỏ hàng trống</p>
              <button onClick={onClose} className="text-sm text-brand-zalo font-semibold hover:underline">
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={`${item.productId}-${item.colorId}`} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="relative w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={item.image} alt={item.productName} fill className="object-contain p-1" sizes="80px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-brand-black line-clamp-2 leading-tight">{item.productName}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: item.colorHex }} />
                      <span className="text-xs text-brand-muted">{item.colorName}</span>
                    </div>
                    {item.lens && (
                      <p className="text-[11px] text-blue-600 mt-0.5">+ {item.lens.name}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <span className="text-sm font-bold text-brand-black">{formatVND(item.price + (item.lens?.price ?? 0))}</span>
                        {item.originalPrice && (
                          <span className="text-[10px] text-gray-400 line-through ml-1">{formatVND(item.originalPrice)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-0">
                        <button
                          onClick={() => updateQuantity(item.productId, item.colorId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-l-lg bg-gray-200 hover:bg-gray-300 text-sm font-bold transition-colors"
                        >−</button>
                        <span className="w-8 h-7 flex items-center justify-center bg-white text-sm font-bold border-y border-gray-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.colorId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-r-lg bg-gray-200 hover:bg-gray-300 text-sm font-bold transition-colors"
                        >+</button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.colorId)}
                    className="self-start p-1 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-sm text-brand-muted">Tạm tính ({totalItems} sản phẩm)</span>
              <span className="text-lg font-extrabold text-brand-black">{formatVND(totalPrice)}</span>
            </div>
            <p className="text-[11px] text-brand-muted">Bạn có thể chọn tròng cắt kính cho từng gọng ở trang giỏ hàng.</p>
            <Link
              href="/gio-hang"
              onClick={onClose}
              className="w-full bg-brand-zalo hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-center text-base transition-all active:scale-95 block shadow-lg"
            >
              Tiến Hành Đặt Hàng →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
