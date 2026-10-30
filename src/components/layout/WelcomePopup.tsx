'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEY = 'soni_welcome_seen'
const AUTO_ADVANCE_MS = 15000
const TICK_MS = 100

type Stage = 'none' | 'intro' | 'survey'

const TIERS = [
  { tier: 350000, index: '1.61', price: '350k', perk: 'Tặng gọng đến 350k', freeShip: false },
  { tier: 650000, index: '1.67', price: '650k', perk: 'Tặng gọng đến 650k', freeShip: true, popular: true },
  { tier: 900000, index: '1.71', price: '900k', perk: 'Tặng mọi gọng', freeShip: true },
]

function CloseButton({ onClick, dark }: { onClick: () => void; dark?: boolean }) {
  return (
    <button onClick={onClick} aria-label="Đóng"
      className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
        dark ? 'bg-white/10 hover:bg-white/20 text-white/80' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
      }`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  )
}

function GlassesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 28" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
      <circle cx="15" cy="16" r="10" />
      <circle cx="49" cy="16" r="10" />
      <path d="M25 14c2.5-2.5 11.5-2.5 14 0" />
      <path d="M5 13L2 6M59 13l3-7" />
    </svg>
  )
}

export default function WelcomePopup() {
  const [stage, setStage] = useState<Stage>('none')
  const router = useRouter()

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return
    } catch {}
    const t = setTimeout(() => setStage('intro'), 800)
    return () => clearTimeout(t)
  }, [])

  // Đếm ngược tự chuyển bước — tạm dừng khi khách đang rê chuột/chạm vào popup để đọc.
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (stage !== 'intro' || paused) return
    const id = setInterval(() => setElapsed(e => e + TICK_MS), TICK_MS)
    return () => clearInterval(id)
  }, [stage, paused])

  useEffect(() => {
    if (stage === 'intro' && elapsed >= AUTO_ADVANCE_MS) setStage('survey')
  }, [stage, elapsed])

  const closeAll = useCallback(() => {
    try { sessionStorage.setItem(STORAGE_KEY, '1') } catch {}
    setStage('none')
  }, [])

  useEffect(() => {
    if (stage === 'none') return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (stage === 'intro') setStage('survey')
      else closeAll()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [stage, closeAll])

  function pickTier(tier: number | null) {
    closeAll()
    router.push(tier ? `/gong-kinh?tier=${tier}` : '/gong-kinh')
  }

  return (
    <AnimatePresence>
      {stage !== 'none' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex justify-center items-start bg-black/60 backdrop-blur-[2px] px-4 pt-16 sm:pt-24 overflow-y-auto"
          onClick={() => (stage === 'survey' ? closeAll() : undefined)}
        >
          <AnimatePresence mode="wait">
            {stage === 'intro' ? (
              <motion.div
                key="intro"
                role="dialog"
                aria-modal="true"
                aria-label="Giới thiệu SONi"
                onClick={e => e.stopPropagation()}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onTouchStart={() => setPaused(true)}
                initial={{ opacity: 0, y: -60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30, transition: { duration: 0.18 } }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                className="relative w-full max-w-[400px] rounded-[28px] overflow-hidden bg-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.45)]"
              >
                {/* Phần đầu tối */}
                <div className="relative bg-brand-black px-6 pt-7 pb-6 text-center overflow-hidden">
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-48 rounded-full bg-brand-gold/25 blur-3xl" aria-hidden />
                  <CloseButton onClick={() => setStage('survey')} dark />

                  <div className="relative">
                    <p className="inline-flex items-baseline gap-1.5 select-none">
                      <span className="text-2xl font-black tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                        <span className="text-gray-300">S</span>
                        <span className="text-brand-gold">O</span>
                        <span className="text-gray-300">N</span>
                        <span className="text-sky-400">i</span>
                      </span>
                      <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">chuyên nhận</span>
                    </p>

                    <GlassesIcon className="w-16 h-7 mx-auto my-3 text-brand-gold" />

                    <h2 className="text-white font-black text-[21px] sm:text-[22px] leading-tight">
                      Cắt kính <span className="text-brand-gold whitespace-nowrap">Cận – Viễn – Loạn</span>
                      <br />Online
                    </h2>
                    <p className="text-gray-300 text-sm mt-2">Chỉ cần cung cấp thông tin số độ</p>
                  </div>
                </div>

                {/* Phần thân */}
                <div className="px-6 pt-5 pb-6">
                  <div className="flex items-center gap-3 rounded-2xl border border-brand-gold/40 bg-amber-50/70 px-4 py-3">
                    <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-gold/15 flex items-center justify-center text-xl">🎁</span>
                    <p className="text-sm text-brand-black leading-snug text-left">
                      <span className="font-black">Tặng gọng kính miễn phí</span>
                      <br />
                      <span className="text-brand-muted">với gói tròng kính tương ứng</span>
                    </p>
                  </div>

                  <button onClick={() => setStage('survey')}
                    className="w-full mt-4 bg-brand-gold hover:brightness-95 active:scale-[0.98] text-brand-black font-black py-3.5 rounded-2xl transition-all shadow-[0_8px_20px_-6px_rgba(212,168,83,0.7)]">
                    Chọn gói tròng ngay →
                  </button>
                </div>

                {/* Thanh đếm ngược tự chuyển bước */}
                <div
                  className="absolute bottom-0 left-0 h-1 bg-brand-gold transition-[width] duration-100 ease-linear"
                  style={{ width: `${Math.max(0, 100 - (elapsed / AUTO_ADVANCE_MS) * 100)}%` }}
                  aria-hidden
                />
              </motion.div>
            ) : (
              <motion.div
                key="survey"
                role="dialog"
                aria-modal="true"
                aria-label="Chọn gói tròng"
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, y: -60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30, transition: { duration: 0.18 } }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                className="relative w-full max-w-[420px] rounded-[28px] bg-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.45)] px-5 pt-6 pb-5 sm:px-6"
              >
                <CloseButton onClick={closeAll} />

                <div className="text-center">
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                    🎁 Gọng tặng theo gói tròng
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-brand-black mt-3 leading-tight">Bạn muốn cắt tròng mức nào?</h2>
                  <p className="text-xs text-brand-muted mt-1.5">Chọn gói — SONi hiện ngay các gọng được tặng kèm</p>
                </div>

                <div className="mt-5 space-y-2.5">
                  {TIERS.map((t, i) => (
                    <motion.button
                      key={t.tier}
                      onClick={() => pickTier(t.tier)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 + i * 0.06 }}
                      className={`group relative w-full flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${
                        t.popular
                          ? 'border-brand-gold bg-gradient-to-r from-amber-50 to-white shadow-[0_6px_18px_-8px_rgba(212,168,83,0.8)]'
                          : 'border-brand-border hover:border-gray-400 bg-white'
                      }`}
                    >
                      {t.popular && (
                        <span className="absolute -top-2.5 right-3 text-[10px] font-black bg-brand-black text-brand-gold px-2 py-0.5 rounded-full">
                          ⭐ PHỔ BIẾN NHẤT
                        </span>
                      )}
                      <span className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center leading-none ${
                        t.popular ? 'bg-brand-black text-brand-gold' : 'bg-gray-100 text-brand-black'
                      }`}>
                        <span className="text-[9px] font-semibold opacity-70">TRÒNG</span>
                        <span className="text-sm font-black mt-0.5">{t.index}</span>
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-bold text-[13px] sm:text-sm text-brand-black">{t.perk}</span>
                        <span className="block text-[11px] text-brand-muted mt-0.5">
                          Chiết suất {t.index}{t.freeShip && <span className="text-green-700 font-semibold"> · Free ship</span>}
                        </span>
                      </span>
                      <span className="flex-shrink-0 flex items-center gap-1">
                        <span className="text-base font-black text-brand-black">{t.price}</span>
                        <svg className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-dashed border-brand-border flex items-center justify-between gap-3">
                  <button onClick={() => pickTier(null)}
                    className="text-sm font-semibold text-brand-black hover:underline underline-offset-2">
                    Chỉ xem gọng →
                  </button>
                  <button onClick={closeAll} className="text-xs text-brand-muted hover:text-brand-black">
                    Để sau
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
