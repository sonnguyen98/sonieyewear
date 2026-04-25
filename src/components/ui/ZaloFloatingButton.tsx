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
      <div className="w-14 h-14 flex flex-col items-center justify-center rounded-full bg-brand-zalo gap-0.5">
        <span className="text-white font-black text-base leading-none">Z</span>
        <span className="text-white font-bold text-[9px] leading-none tracking-wide">Zalo</span>
      </div>
      <span className="hidden sm:block pr-4 text-sm font-semibold whitespace-nowrap">
        {VI.zalo.floatingLabel}
      </span>
    </button>
  )
}
