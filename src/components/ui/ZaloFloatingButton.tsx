'use client'

import { openZaloDefault } from '@/lib/zalo'
import { VI } from '@/constants/vietnamese'

export default function ZaloFloatingButton() {
  return (
    <button
      onClick={openZaloDefault}
      aria-label={VI.zalo.floatingLabel}
      className="fixed bottom-20 right-4 z-50 flex items-center gap-2 bg-brand-zalo text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 animate-pulse-zalo md:bottom-6"
    >
      {/* Zalo icon */}
      <div className="w-14 h-14 flex items-center justify-center rounded-full bg-brand-zalo">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm-3 7h6a1 1 0 110 2H9a1 1 0 110-2zm0 4h4a1 1 0 110 2H9a1 1 0 110-2z"/>
        </svg>
      </div>
      <span className="hidden sm:block pr-4 text-sm font-semibold whitespace-nowrap">
        {VI.zalo.floatingLabel}
      </span>
    </button>
  )
}
