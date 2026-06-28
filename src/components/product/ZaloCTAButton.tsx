'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import type { Product, ColorVariant, LensPackage } from '@/types/product'
import { buildZaloOrderMessage, openZalo } from '@/lib/zalo'
import { VI } from '@/constants/vietnamese'

interface ZaloCTAButtonProps {
  product: Product
  selectedColor: ColorVariant
  selectedLens: LensPackage
}

export default function ZaloCTAButton({ product, selectedColor, selectedLens }: ZaloCTAButtonProps) {
  const [toastVisible, setToastVisible] = useState(false)

  function handleClick() {
    const msg = buildZaloOrderMessage(product, selectedColor, selectedLens)
    openZalo(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 4000)
  }

  return (
    <div className="relative">
      <Button
        variant="zalo"
        size="xl"
        fullWidth
        onClick={handleClick}
        className="text-base"
      >
        <svg className="mr-2.5 w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Đặt Hàng Ngay
      </Button>

      <p className="text-xs text-brand-muted text-center mt-2">{VI.product.zaloCTAHint}</p>

      {/* Toast notification */}
      {toastVisible && (
        <div className="absolute bottom-full left-0 right-0 mb-3 bg-green-600 text-white text-xs font-medium py-2 px-4 rounded-xl text-center animate-fade-in shadow-lg">
          ✓ {VI.zalo.toastMessage}
        </div>
      )}
    </div>
  )
}
