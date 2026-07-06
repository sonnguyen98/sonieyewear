'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import type { LandingPageContent, LandingPagePreset, LpTargetId } from '@/types/landingPage'
import type { Product } from '@/types/product'
import OrderModal from '@/components/product/OrderModal'
import ProductQuickView from '@/components/landing/ProductQuickView'
import { formatVND, cn } from '@/lib/utils'

// Map accent → full Tailwind classes (JIT cần thấy đầy đủ chuỗi)
const ACCENT = {
  orange: {
    bg: 'bg-orange-500',
    bgHover: 'hover:bg-orange-600',
    bgSoft: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-500',
    ring: 'ring-orange-300',
    gradient: 'from-orange-500 to-amber-500',
  },
  red: {
    bg: 'bg-red-500', bgHover: 'hover:bg-red-600', bgSoft: 'bg-red-50',
    text: 'text-red-600', border: 'border-red-500', ring: 'ring-red-300',
    gradient: 'from-red-500 to-rose-500',
  },
  blue: {
    bg: 'bg-blue-600', bgHover: 'hover:bg-blue-700', bgSoft: 'bg-blue-50',
    text: 'text-blue-600', border: 'border-blue-600', ring: 'ring-blue-300',
    gradient: 'from-blue-600 to-cyan-500',
  },
  green: {
    bg: 'bg-emerald-500', bgHover: 'hover:bg-emerald-600', bgSoft: 'bg-emerald-50',
    text: 'text-emerald-600', border: 'border-emerald-500', ring: 'ring-emerald-300',
    gradient: 'from-emerald-500 to-teal-500',
  },
  gold: {
    bg: 'bg-amber-600', bgHover: 'hover:bg-amber-700', bgSoft: 'bg-amber-50',
    text: 'text-amber-700', border: 'border-amber-600', ring: 'ring-amber-300',
    gradient: 'from-amber-600 to-yellow-500',
  },
}

const PERSONA_COLORS = [
  'bg-orange-100 text-orange-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-cyan-100 text-cyan-700',
  'bg-pink-100 text-pink-700',
]

type AccentMap = typeof ACCENT[keyof typeof ACCENT]

function ColorGallery({ title, colors, accent, selected, onSelect }: {
  title?: string
  colors: { id: string; name: string; hex: string; image: string; inStock: boolean }[]
  accent: AccentMap
  selected: number
  onSelect: (i: number) => void
}) {
  const item = colors[selected]
  if (!item) return null

  return (
    <section className="py-8 md:py-14 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        {title && (
          <h2 className="text-lg sm:text-2xl font-extrabold text-center mb-4 sm:mb-6">{title}</h2>
        )}
        <div className="relative aspect-square sm:aspect-[4/3] bg-gray-50 rounded-2xl overflow-hidden mb-4">
          <Image key={item.image} src={item.image} alt={item.name} fill
            className="object-contain p-4 transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, 720px" />
          {!item.inStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="bg-gray-800 text-white text-sm font-bold px-4 py-2 rounded-full">Hết hàng</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-3">
          {colors.map((c, i) => (
            <button key={c.id} onClick={() => onSelect(i)}
              className={cn(
                'flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all',
                selected === i ? 'bg-gray-100 ring-2 ' + accent.ring : 'hover:bg-gray-50',
                !c.inStock && 'opacity-40'
              )}>
              <span className={cn('w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all',
                selected === i ? accent.border : 'border-gray-200'
              )} style={{ backgroundColor: c.hex }} />
              <span className={cn('text-[11px] sm:text-xs font-semibold', selected === i ? 'text-brand-black' : 'text-brand-muted')}>
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Announcement bar (shared, hardcoded) ────────────────────────────────────
const ANNOUNCE_ITEMS = [
  { icon: '🚚', text: 'Freeship toàn quốc' },
  { icon: '🛡️', text: 'Sai độ làm lại miễn phí' },
  { icon: '👁️', text: 'Khúc xạ viên 10 năm kinh nghiệm' },
]

function FadeUp({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function parseHighlight(text: string, accentClass: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className={accentClass}>{part}</strong> : part
  )
}

function ShopCarousel({ accent }: { accent: AccentMap }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allProducts, setAllProducts] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [quickView, setQuickView] = useState<any | null>(null)
  const [search, setSearch] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAllProducts(data) })
      .catch(() => {})
  }, [])

  const q = search.toLowerCase().trim()
  const products = q
    ? allProducts.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || (p.slug && p.slug.toLowerCase().includes(q)))
    : allProducts

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.offsetWidth * 0.7
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  if (allProducts.length === 0) return null

  return (
    <section id="shop" className={cn('py-10 sm:py-16', accent.bgSoft)}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <span className={cn('inline-block text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full mb-2', accent.bg, 'text-white')}>
              🔥 Đang Giảm Giá
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold">Shop Gọng Kính</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={() => scroll('right')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc mã sản phẩm..."
            className="w-full pl-10 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-200 outline-none transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {products.length === 0 && q ? (
          <p className="text-center text-sm text-brand-muted py-8">Không tìm thấy sản phẩm &ldquo;{search}&rdquo;</p>
        ) : (
        <div ref={scrollRef} className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2">
          {products.map(p => {
            const thumb = p.images?.[0] ?? p.colorVariants?.[0]?.imageUrl ?? ''
            const pDiscount = p.discountPercent ?? 20
            const discounted = Math.round(p.basePrice * (1 - pDiscount / 100))
            return (
              <div key={p.id}
                className="flex-shrink-0 w-[60vw] sm:w-56 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
                <button onClick={() => setQuickView(p)} className="text-left">
                  <div className="aspect-square bg-gray-50 relative overflow-hidden">
                    {thumb && (
                      <Image src={thumb} alt={p.name} fill className="object-contain p-3 group-hover:scale-105 transition-transform" sizes="(max-width: 640px) 42vw, 192px" />
                    )}
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                      -{pDiscount}%
                    </span>
                  </div>
                  <div className="p-2.5 sm:p-3 pb-2">
                    <p className="text-xs sm:text-sm font-bold text-brand-black line-clamp-2 leading-tight mb-1.5">{p.name}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400 line-through">{formatVND(p.basePrice)}</p>
                    <p className={cn('text-sm sm:text-base font-extrabold', accent.text)}>{formatVND(discounted)}</p>
                  </div>
                </button>
                <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3 mt-auto">
                  <button onClick={() => setQuickView(p)}
                    className={cn('cta-pulse w-full py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition active:scale-95', accent.bg, accent.bgHover)}>
                    MUA NGAY
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        )}
      </div>

      {quickView && (
        <ProductQuickView product={quickView} onClose={() => setQuickView(null)} />
      )}
    </section>
  )
}

function ProofGallerySlider({ gallery, accent }: {
  gallery: { src: string; alt: string }[]
  accent: AccentMap
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / el.offsetWidth)
    activeRef.current = idx
    setActive(idx)
  }

  const goTo = (idx: number) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ left: idx * el.offsetWidth, behavior: 'smooth' })
  }

  useEffect(() => {
    if (gallery.length <= 1) return
    const id = setInterval(() => {
      const next = (activeRef.current + 1) % gallery.length
      goTo(next)
    }, 2000)
    return () => clearInterval(id)
  }, [gallery.length])

  return (
    <div>
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar rounded-xl sm:rounded-2xl"
        >
          {gallery.map((img, i) => (
            <div key={i} className="flex-shrink-0 w-full snap-center bg-gray-100 relative">
              <Image src={img.src} alt={img.alt} width={800} height={800}
                className="w-full h-auto"
                sizes="(max-width: 768px) 100vw, 600px" />
            </div>
          ))}
        </div>

        {gallery.length > 1 && (
          <>
            <button
              onClick={() => goTo(Math.max(0, active - 1))}
              disabled={active === 0}
              aria-label="Ảnh trước"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center shadow-sm hover:bg-white transition-colors disabled:opacity-0 disabled:pointer-events-none"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => goTo(Math.min(gallery.length - 1, active + 1))}
              disabled={active === gallery.length - 1}
              aria-label="Ảnh tiếp theo"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center shadow-sm hover:bg-white transition-colors disabled:opacity-0 disabled:pointer-events-none"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3 sm:mt-4">
          {gallery.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ảnh ${i + 1}`}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === active ? cn('w-6', accent.bg) : 'w-1.5 bg-gray-300'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function GiftLeadSection({ giftLead, accent, slug }: {
  giftLead: NonNullable<LandingPageContent['giftLead']>
  accent: AccentMap
  slug: string
}) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit() {
    if (!form.name.trim() || form.phone.trim().length < 9 || submitting) return
    setSubmitting(true)
    try {
      await fetch('/api/gift-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone, email: form.email, source: `LP: ${slug}` }),
      })
      setDone(true)
    } catch {}
    setSubmitting(false)
  }

  if (done) {
    return (
      <section className={cn('py-12 sm:py-20', accent.bgSoft)}>
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl sm:text-2xl font-extrabold mb-3">
            {giftLead.successMessage ?? 'Nhận Quà Thành Công!'}
          </h2>
          <p className="text-sm text-brand-muted mb-2">SONi sẽ gửi quà tặng qua Zalo cho bạn.</p>
          <p className="text-sm text-brand-muted">Sổ Y Bạ đã được tạo — bạn có thể tra cứu tại mục <strong>Sổ Y Bạ</strong> trên website.</p>
        </div>
      </section>
    )
  }

  return (
    <section className={cn('py-10 sm:py-16', accent.bgSoft)}>
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-extrabold mb-2 leading-tight">{giftLead.title}</h2>
          <p className="text-sm sm:text-base text-brand-muted leading-relaxed">{giftLead.subtitle}</p>
        </div>

        {/* Gift cards */}
        <div className="space-y-3 mb-6 sm:mb-8">
          {giftLead.gifts.map((g, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-brand-border flex items-start gap-4 transition-all duration-200 hover:border-orange-400 hover:bg-orange-50 hover:shadow-md">
              <div className={cn('w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0', accent.bgSoft)}>
                {g.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm sm:text-base text-brand-black mb-1">{g.name}</p>
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed whitespace-pre-line">{g.desc}</p>
              </div>
              <span className={cn('text-xs font-extrabold flex-shrink-0 mt-1', accent.text)}>FREE</span>
            </div>
          ))}
        </div>

        {/* CTA / Form */}
        {!showForm ? (
          <div className="text-center space-y-3">
            <button onClick={() => setShowForm(true)}
              className={cn('cta-pulse w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-white shadow-lg transition active:scale-95 text-sm sm:text-base', accent.bg, accent.bgHover)}>
              🎁 {giftLead.ctaText}
            </button>
            <p className="text-[10px] sm:text-xs text-brand-muted">Chỉ cần 10 giây — nhận quà ngay, không kèm điều kiện</p>
          </div>
        ) : (
          <div className={cn('rounded-2xl p-5 sm:p-6 shadow-lg border-2 space-y-4', accent.border, 'bg-white')}>
            <div className="text-center">
              <p className="font-extrabold text-base text-brand-black">🎁 Nhận quà ngay</p>
              <p className="text-xs text-brand-muted mt-0.5">Điền thông tin bên dưới — quà gửi tự động</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Họ tên</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Nguyễn Văn A"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-brand-zalo focus:ring-1 focus:ring-brand-zalo/30 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Số điện thoại</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="0912 345 678"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-brand-zalo focus:ring-1 focus:ring-brand-zalo/30 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="email@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-brand-zalo focus:ring-1 focus:ring-brand-zalo/30 outline-none" />
            </div>
            <button onClick={handleSubmit}
              disabled={!form.name.trim() || form.phone.trim().length < 9 || submitting}
              className={cn('cta-pulse w-full font-extrabold py-4 rounded-xl text-white transition active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:animate-none text-sm sm:text-base shadow-lg', accent.bg, accent.bgHover)}>
              {submitting ? 'Đang xử lý...' : `🎁 ${giftLead.ctaText}`}
            </button>
            <p className="text-center text-[10px] text-brand-muted">🔒 Thông tin được bảo mật — không spam</p>
          </div>
        )}
      </div>
    </section>
  )
}

interface Props {
  content: LandingPageContent
  product: Product
}

export default function LandingPageView({ content, product }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalPreset, setModalPreset] = useState<LandingPagePreset | undefined>(undefined)
  const [showStickyCta, setShowStickyCta] = useState(false)
  const [selectedColorIdx, setSelectedColorIdx] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [heroSlide, setHeroSlide] = useState(0)
  const accent = ACCENT[content.accent ?? 'orange']
  const heroImage = content.heroImage ?? product.images?.[0] ?? product.colorVariants?.[0]?.imageUrl ?? ''

  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const KEY = 'soni_offer_end'
    let end = parseInt(sessionStorage.getItem(KEY) ?? '0')
    if (!end || end < Date.now()) {
      end = Date.now() + 30 * 60 * 1000
      sessionStorage.setItem(KEY, String(end))
    }
    const calc = () => {
      const d = Math.max(0, end - Date.now())
      setTimeLeft({
        days: 0,
        hours: Math.floor(d / 3600000),
        minutes: Math.floor((d % 3600000) / 60000),
        seconds: Math.floor((d % 60000) / 1000),
      })
    }
    calc()
    const t = setInterval(calc, 1000)
    return () => clearInterval(t)
  }, [])

  const slideImages = content.heroNew?.heroImages?.length
    ? content.heroNew.heroImages
    : [heroImage].filter(Boolean)

  useEffect(() => {
    if (slideImages.length <= 1) return
    const t = setInterval(() => setHeroSlide(i => (i + 1) % slideImages.length), 3000)
    return () => clearInterval(t)
  }, [slideImages.length])

  const openOrder = (preset?: LandingPagePreset) => {
    setModalPreset(preset)
    setModalOpen(true)
  }
  const closeOrder = () => {
    setModalOpen(false)
    setModalPreset(undefined)
  }

  const scrollTo = (id: LpTargetId) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="bg-white text-brand-black">

      {/* ═══════════════ ANNOUNCEMENT BAR ═══════════════ */}
      <style>{`
        @keyframes shimmer-slide {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .btn-shimmer {
          background: linear-gradient(105deg, #facc15 0%, #fef9c3 45%, #facc15 55%, #f59e0b 100%);
          background-size: 250% auto;
          animation: shimmer-slide 2.2s linear infinite;
        }
        @keyframes nav-cta-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.5); }
          50% { box-shadow: 0 0 0 6px rgba(249,115,22,0); }
        }
        .nav-cta-pulse { animation: nav-cta-glow 2s ease-in-out infinite; }
      `}</style>
      {/* ═══════════ STICKY HEADER (announcement + nav) ═══════════ */}
      <div className="sticky top-0 z-30">
        {/* Announcement bar */}
        <div className="bg-gray-950 border-b border-gray-800/60">
          <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
            <div className="flex-1 hidden lg:block" />
            <div className="flex items-center gap-4 sm:gap-6 flex-1 justify-center">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl flex-none select-none">🔥</span>
                <p className="text-white font-extrabold uppercase tracking-wide leading-tight text-sm sm:text-base md:text-lg">
                  <span className="hidden sm:inline">TRỌN BỘ KÍNH CẮT THEO ĐỘ —&nbsp;</span>
                  <span className="sm:hidden">Cắt kính online —&nbsp;</span>
                  <span className="text-yellow-400">CHỈ TỪ 152.000Đ</span>
                </p>
              </div>
              <div className="flex flex-col items-center gap-0.5 flex-none">
                <span className="text-[10px] sm:text-xs text-gray-400 font-medium whitespace-nowrap">Ưu đãi kết thúc sau:</span>
                <div className="flex items-center gap-1">
                  {[
                    { v: timeLeft.hours, label: 'Giờ' },
                    { v: timeLeft.minutes, label: 'Phút' },
                    { v: timeLeft.seconds, label: 'Giây' },
                  ].map(({ v, label }, i, arr) => (
                    <span key={label} className="flex items-center">
                      <span className="flex flex-col items-center bg-red-600 rounded-md px-2 sm:px-3 py-1 min-w-[38px] sm:min-w-[48px]">
                        <span className="text-white text-base sm:text-xl font-extrabold tabular-nums leading-tight">{String(v).padStart(2, '0')}</span>
                        <span className="text-red-200 text-[8px] sm:text-[9px] leading-tight">{label}</span>
                      </span>
                      {i < arr.length - 1 && <span className="text-gray-500 font-bold text-lg px-0.5 -mt-2">:</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden sm:flex flex-1 justify-end">
              <button onClick={() => scrollTo('shop')}
                className="btn-shimmer flex-none text-gray-900 font-extrabold text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg shadow-md hover:scale-105 active:scale-95 transition-transform whitespace-nowrap">
                Đặt Hàng Ngay →
              </button>
            </div>
          </div>
        </div>
        {/* Nav */}
        <nav className="bg-gray-900 border-b border-gray-800">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 h-12 sm:h-13 flex items-center justify-between gap-2">
            <a href="/" className="font-extrabold text-base sm:text-xl tracking-tight flex-shrink-0 flex items-baseline">
              <span className="text-white">SONi</span>
              <span className={cn('ml-1', accent.text)}>Cắt Kính</span>
            </a>
            {content.navAnchors && content.navAnchors.length > 0 && (
              <div className="hidden sm:flex items-center gap-5 overflow-x-auto no-scrollbar text-sm font-medium text-gray-400">
                {content.navAnchors.map(a => (
                  <button key={a.targetId} onClick={() => scrollTo(a.targetId)}
                    className="hover:text-white transition-colors whitespace-nowrap">
                    {a.label}
                  </button>
                ))}
              </div>
            )}
            <a href="https://zalo.me/0869308231" target="_blank" rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-full font-semibold text-gray-400 border border-gray-700 text-xs sm:text-sm hover:border-orange-400 hover:text-orange-400 transition-colors hidden sm:inline-flex items-center gap-1.5 flex-shrink-0">
              💬 Zalo
            </a>
          </div>
        </nav>
      </div>

      {/* ═══════════════ HERO LỢI ÍCH (luôn hiển thị) ═══════════════ */}
      {content.heroNew && (
        <section className="relative overflow-hidden bg-gray-900">
          <div className="absolute w-[600px] h-[600px] rounded-full bg-orange-500 opacity-10 -top-40 -right-20 blur-3xl pointer-events-none" />
          <div className="absolute w-[400px] h-[400px] rounded-full bg-orange-400 opacity-5 bottom-0 -left-20 blur-3xl pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-4 py-10 sm:py-14 md:py-20">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
              {/* Text */}
              <div className="space-y-4 sm:space-y-5">
                {content.heroNew.eyebrow && (
                  <p className={cn('text-xs sm:text-sm font-bold tracking-widest uppercase', accent.text)}>
                    {content.heroNew.eyebrow}
                  </p>
                )}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white uppercase" style={{ lineHeight: '1.6' }}>
                  {content.heroNew.h1Before}
                  <em className={cn('not-italic', accent.text)}>{content.heroNew.h1Em}</em>
                  {content.heroNew.h1After}
                </h1>
                <p className="text-sm sm:text-lg text-gray-300 leading-relaxed max-w-lg">
                  {content.heroNew.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button onClick={() => scrollTo('shop')}
                    className={cn('cta-pulse px-6 py-4 rounded-2xl font-extrabold text-white shadow-lg transition active:scale-95 text-sm sm:text-base', accent.bg, accent.bgHover)}>
                    {content.heroNew.ctaText} →
                  </button>
                </div>
                {content.heroNew.badges && content.heroNew.badges.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 border-t border-gray-700 mt-1">
                    {content.heroNew.badges.map((b, i) => (
                      <span key={i} className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-300">
                        <span className={cn('font-extrabold', accent.text)}>✓</span>{b}
                      </span>
                    ))}
                  </div>
                )}
                {content.heroNew.friction && (
                  <p className="text-xs sm:text-sm text-gray-400 font-medium">
                    {content.heroNew.friction.split('·').map((part, i, arr) => (
                      <span key={i}>{part.trim()}{i < arr.length - 1 && <span className={cn('mx-2 font-bold', accent.text)}>·</span>}</span>
                    ))}
                  </p>
                )}
              </div>
              {/* Ảnh slideshow */}
              <div className="order-last">
                <div className="aspect-[4/5] max-h-[55vh] lg:max-h-none rounded-2xl sm:rounded-3xl overflow-hidden bg-brand-light shadow-xl mx-auto max-w-sm lg:max-w-none relative">
                  {slideImages.map((src, i) => (
                    <Image key={src} src={src} alt={product.name} width={800} height={1000}
                      className="w-full h-full object-cover absolute inset-0 transition-opacity duration-700"
                      style={{ opacity: i === heroSlide ? 1 : 0 }}
                      priority={i === 0} />
                  ))}
                  {/* Dot indicators */}
                  {slideImages.length > 1 && (
                    <div className="absolute bottom-14 left-0 right-0 flex justify-center gap-1.5 z-10">
                      {slideImages.map((_, i) => (
                        <button key={i} onClick={() => setHeroSlide(i)}
                          className={cn('w-1.5 h-1.5 rounded-full transition-all duration-300', i === heroSlide ? 'bg-white w-4' : 'bg-white/50')} />
                      ))}
                    </div>
                  )}
                  {content.heroNew?.rating && (
                    <div className="absolute left-3 right-3 bottom-3 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          {[1,2,3,4,5].map(s => (
                            <svg key={s} className="w-4 h-4 text-yellow-400 flex-none" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          ))}
                          <span className="text-sm font-extrabold text-gray-900 ml-1">4.9/5</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium truncate">từ 1.286 khách đã mua</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ GIFT LEAD ═══════════════ */}
      {content.giftLead && (
        <GiftLeadSection giftLead={content.giftLead} accent={accent} slug={content.slug} />
      )}

      {/* ═══════════════ 1. HERO CŨ (chỉ hiện khi không có heroNew lẫn giftLead) ═══════════════ */}
      {!content.heroNew && !content.giftLead && <section className="relative overflow-hidden">
        <div className={cn('absolute inset-0 opacity-50', accent.bgSoft)} />
        <div className="relative max-w-6xl mx-auto px-4 py-8 sm:py-10 md:py-16">
          {/* Mobile: ảnh trước, text sau */}
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
            {/* Ảnh */}
            <div className="order-1 lg:order-2">
              <div className="aspect-[4/5] sm:aspect-[4/5] max-h-[60vh] sm:max-h-none rounded-2xl sm:rounded-3xl overflow-hidden bg-brand-light shadow-xl sm:shadow-2xl mx-auto max-w-sm sm:max-w-none">
                {heroImage && (
                  <Image src={heroImage} alt={product.name} width={1200} height={1500}
                    className="w-full h-full object-cover" priority />
                )}
              </div>
            </div>

            {/* Text */}
            <div className="order-2 lg:order-1 space-y-3 sm:space-y-5">
              <div className="space-y-2 sm:space-y-3">
                <p className={cn('text-sm sm:text-lg font-bold tracking-wide uppercase', accent.text)}>{content.hero.title}</p>
                {content.hero.titleHighlight && (
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-snug text-brand-black">
                    {content.hero.titleHighlight}
                  </h1>
                )}
                {content.hero.subtitle && (
                  <p className="text-sm sm:text-lg text-brand-muted leading-relaxed pt-1 sm:pt-2">
                    {content.hero.subtitle}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-3 pt-1 sm:pt-2">
                <button onClick={() => scrollTo(content.hero.ctaPrimary.targetId)}
                  className={cn('cta-pulse px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl font-bold text-white shadow-lg transition active:scale-95 text-sm sm:text-base', accent.bg, accent.bgHover)}>
                  {content.hero.ctaPrimary.text} →
                </button>
              </div>
              {content.hero.trustStrip && content.hero.trustStrip.length > 0 && (
                <ul className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-1 text-xs sm:text-sm">
                  {content.hero.trustStrip.map((t, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-brand-black">
                      <span className={cn('flex-shrink-0 mt-0.5 font-bold', accent.text)}>✓</span>
                      <span className="leading-snug">{t}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>}

      {/* ═══════════════ COLOR GALLERY ═══════════════ */}
      {content.showColorGallery && product.colorVariants.length > 1 && (
        <ColorGallery
          title={content.colorGalleryTitle}
          colors={product.colorVariants.map(cv => ({
            id: cv.id, name: cv.name, hex: cv.hex,
            image: content.colorImageOverrides?.[cv.id] ?? cv.imageUrl,
            inStock: cv.inStock,
          }))}
          accent={accent} selected={selectedColorIdx} onSelect={setSelectedColorIdx}
        />
      )}

      {/* ═══════════════ 2. GIFTS ═══════════════ */}
      {!content.giftLead && <section id="gifts" className="py-10 sm:py-14 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-10">
            {content.gifts.eyebrow && (
              <p className={cn('uppercase tracking-widest text-xs sm:text-base font-extrabold mb-3 inline-block px-4 sm:px-5 py-1.5 rounded-full', accent.bgSoft, accent.text)}>
                🎁 {content.gifts.eyebrow}
              </p>
            )}
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-3 leading-tight">
              {content.gifts.title}
            </h2>
            {content.gifts.subtitle && (
              <p className="text-sm sm:text-base text-brand-muted max-w-2xl mx-auto leading-relaxed">
                {content.gifts.subtitle}
              </p>
            )}
          </div>
          {/* Mobile: stack dọc, Desktop: 3 cột */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {content.gifts.items.map((g, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-brand-border bg-white flex flex-col shadow-md sm:shadow-lg transition-colors duration-200 hover:border-orange-400">
                <div className={cn('h-12 sm:h-16 relative flex items-center justify-center', accent.bgSoft)}>
                  {g.image ? (
                    <Image src={g.image} alt={g.name} fill className="object-contain p-2" sizes="(max-width: 768px) 100vw, 33vw" />
                  ) : (
                    <span className="text-2xl sm:text-3xl select-none">{g.icon ?? '🎁'}</span>
                  )}
                </div>
                <div className={cn('py-2.5 sm:py-3 px-4 text-center text-white font-extrabold text-sm sm:text-lg uppercase tracking-wide bg-gradient-to-r', accent.gradient)}>
                  {g.name}
                </div>
                <div className="p-4 sm:p-6 flex flex-col flex-1">
                  {g.desc && <p className="text-xs sm:text-sm text-brand-black leading-relaxed text-center mb-3">{g.desc}</p>}
                  {g.bullets && g.bullets.length > 0 && (
                    <ul className="space-y-2 mb-3 text-left">
                      {g.bullets.map((b, bi) => (
                        <li key={bi} className="text-xs sm:text-sm text-brand-muted leading-relaxed pl-1">{b}</li>
                      ))}
                    </ul>
                  )}
                  {g.subdesc && <p className="text-xs text-brand-muted leading-relaxed text-center mb-3 italic">{g.subdesc}</p>}
                  <div className="flex-1" />
                  {g.value && (
                    <p className="text-center text-sm sm:text-lg font-bold mb-3 sm:mb-4">
                      <span className="text-brand-muted text-xs sm:text-sm">Giá trị: </span>
                      <span className={cn('line-through opacity-60', accent.text)}>{g.value}</span>
                      <span className={cn('ml-2 font-extrabold text-base sm:text-lg', accent.text)}>MIỄN PHÍ</span>
                    </p>
                  )}
                  <button onClick={() => scrollTo(g.ctaTargetId)}
                    className={cn('cta-pulse w-full py-3 sm:py-3.5 rounded-xl font-extrabold text-white shadow-lg active:scale-95 transition uppercase tracking-wide text-xs sm:text-base', accent.bg, accent.bgHover)}>
                    {g.ctaText} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {/* ═══════════════ 3. PAIN ↔ SOLUTION Q&A ═══════════════ */}
      <section id="pain-solution" className="py-10 sm:py-14 md:py-20 bg-brand-light">
        <div className="max-w-2xl mx-auto px-4">
          <FadeUp>
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-3 sm:mb-4 leading-tight">
                {content.painSolutionQA.title}
              </h2>
              {content.painSolutionQA.subtitle && (
                <p className={cn('inline-block text-sm sm:text-lg font-bold px-4 sm:px-5 py-2 rounded-full', accent.bgSoft, accent.text)}>
                  {content.painSolutionQA.subtitle}
                </p>
              )}
            </div>
          </FadeUp>

          <div className="space-y-6 sm:space-y-8">
            {content.painSolutionQA.items.map((qa, i) => (
              <FadeUp key={i} delay={i * 0.1}>
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg overflow-hidden">
                <div className={cn('px-4 sm:px-6 py-3 sm:py-4 text-center bg-gradient-to-r text-white', accent.gradient)}>
                  <h3 className="text-base sm:text-xl font-extrabold">{qa.pain.question}</h3>
                </div>
                <div className="p-4 sm:p-5">
                  {/* Before / After cạnh nhau */}
                  {(qa.pain.image || qa.solution.image) && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {qa.pain.image && (
                        <div>
                          <div className="rounded-xl overflow-hidden aspect-[3/4] bg-gray-100 relative">
                            <Image src={qa.pain.image} alt={qa.pain.text} fill className="object-cover" sizes="(max-width: 768px) 45vw, 280px" />
                            <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full">TRƯỚC</span>
                          </div>
                        </div>
                      )}
                      {qa.solution.image && (
                        <div>
                          <div className="rounded-xl overflow-hidden aspect-[3/4] bg-gray-100 relative">
                            <Image src={qa.solution.image} alt={qa.solution.text} fill className="object-cover" sizes="(max-width: 768px) 45vw, 280px" />
                            <span className={cn('absolute top-1.5 left-1.5 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full', accent.bg)}>SAU</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              </FadeUp>
            ))}

          </div>
        </div>
      </section>

      {/* ═══════════════ BẠN NGHĨ / THỰC TẾ ═══════════════ */}
      {content.objections && (
        <section className="py-10 sm:py-14 md:py-20 bg-gray-900 relative overflow-hidden">
          <div className="absolute w-[500px] h-[500px] rounded-full bg-orange-500 opacity-5 -bottom-40 -right-20 blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 relative">
            <FadeUp>
              <div className="text-center mb-8 sm:mb-10">
                {content.objections.eyebrow && (
                  <p className={cn('text-xs font-bold tracking-widest uppercase mb-2', accent.text)}>{content.objections.eyebrow}</p>
                )}
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-3 leading-tight text-white">
                  {content.objections.title}
                </h2>
                {content.objections.subtitle && (
                  <p className="text-sm sm:text-lg text-gray-400">{content.objections.subtitle}</p>
                )}
              </div>
            </FadeUp>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              {content.objections.items.map((item, i) => (
                <FadeUp key={i} delay={i * 0.08}>
                  <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 sm:p-6 space-y-3 transition-all duration-200 hover:border-orange-500 hover:bg-gray-750 hover:shadow-lg hover:shadow-orange-950/30">
                    <div className="flex gap-3 items-start text-sm sm:text-base text-gray-400 pb-3 border-b border-dashed border-gray-700">
                      <span className="flex-none text-[10px] font-extrabold tracking-widest uppercase bg-gray-700 border border-gray-600 rounded-full px-2 py-1 text-gray-400 mt-0.5">Bạn nghĩ</span>
                      <p className="leading-relaxed italic">"{item.you}"</p>
                    </div>
                    <div className="flex gap-3 items-start text-sm sm:text-base text-gray-200">
                      <span className={cn('flex-none text-[10px] font-extrabold tracking-widest uppercase rounded-full px-2 py-1 text-white mt-0.5', accent.bg)}>Thực tế</span>
                      <p className="leading-relaxed">{parseHighlight(item.reality, accent.text)}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
            {content.process4Steps?.ctaText && (
              <FadeUp delay={0.3}>
                <div className="text-center mt-8 sm:mt-10">
                  <button onClick={() => scrollTo('shop')}
                    className={cn('cta-pulse px-7 py-4 rounded-2xl font-extrabold text-white shadow-lg transition text-sm sm:text-base', accent.bg, accent.bgHover)}>
                    {content.process4Steps.ctaText} →
                  </button>
                </div>
              </FadeUp>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════ QUY TRÌNH 4 BƯỚC ═══════════════ */}
      {content.process4Steps && (
        <section className={cn('py-10 sm:py-14 md:py-20 border-t border-brand-border', accent.bgSoft)}>
          <div className="max-w-6xl mx-auto px-4">
            <FadeUp>
              <div className="text-center mb-8 sm:mb-10">
                {content.process4Steps.eyebrow && (
                  <p className={cn('text-xs font-bold tracking-widest uppercase mb-2', accent.text)}>{content.process4Steps.eyebrow}</p>
                )}
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-3 leading-tight">
                  {content.process4Steps.title}
                </h2>
                {content.process4Steps.subtitle && (
                  <p className="text-sm sm:text-lg text-brand-muted">{content.process4Steps.subtitle}</p>
                )}
              </div>
            </FadeUp>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {content.process4Steps.steps.map((step, i) => (
                <FadeUp key={step.n} delay={i * 0.1}>
                  <div className="bg-white border border-brand-border rounded-2xl p-5 sm:p-6 shadow-sm relative h-full transition-all duration-200 hover:border-orange-400 hover:bg-orange-50 hover:shadow-md">
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-white text-base mb-4', accent.bg)}>
                      {step.n}
                    </div>
                    <h3 className="font-extrabold text-base sm:text-lg mb-2">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">{step.desc}</p>
                    {i < (content.process4Steps?.steps.length ?? 0) - 1 && (
                      <span className={cn('hidden lg:block absolute top-9 -right-3 font-extrabold text-xl z-10', accent.text)}>→</span>
                    )}
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ SHOP ═══════════════ */}
      <ShopCarousel accent={accent} />

      {/* ═══════════════ SO SÁNH SONi VS TIỆM ═══════════════ */}
      {content.comparison && (
        <section className={cn('py-10 sm:py-14 md:py-20 border-t border-brand-border', accent.bgSoft)}>
          <div className="max-w-4xl mx-auto px-4">
            <FadeUp>
              <div className="text-center mb-8 sm:mb-10">
                {content.comparison.eyebrow && (
                  <p className={cn('text-xs font-bold tracking-widest uppercase mb-2', accent.text)}>{content.comparison.eyebrow}</p>
                )}
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-3 leading-tight">
                  {content.comparison.title}
                </h2>
                {content.comparison.subtitle && (
                  <p className="text-sm sm:text-lg text-brand-muted">{content.comparison.subtitle}</p>
                )}
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <div className="overflow-x-auto -mx-4 px-4">
              <div className="rounded-2xl overflow-hidden border border-brand-border shadow-md bg-white min-w-[400px]">
                {/* Header row */}
                <div className="grid grid-cols-[1.4fr_1fr_1fr]">
                  <div className="p-3 sm:p-4 text-xs font-bold text-brand-muted bg-brand-light border-b border-brand-border" />
                  <div className={cn('p-3 sm:p-4 text-sm sm:text-base font-extrabold text-white border-x-2 border-t-2 border-orange-400', accent.bg)}>
                    SONi Online
                  </div>
                  <div className="p-3 sm:p-4 text-sm sm:text-base font-bold text-brand-muted bg-brand-light border-b border-brand-border">Tiệm truyền thống</div>
                </div>
                {content.comparison.rows.map((row, i, arr) => {
                  const isLast = i === arr.length - 1
                  return (
                    <div key={i} className={cn('grid grid-cols-[1.4fr_1fr_1fr] transition-colors duration-150 hover:bg-orange-50/60', !isLast ? 'border-b border-brand-border' : '')}>
                      <div className={cn('p-3 sm:p-4 text-xs sm:text-sm font-semibold text-brand-black', i % 2 === 1 ? 'bg-brand-light/40' : 'bg-white')}>{row.label}</div>
                      <div className={cn('p-3 sm:p-4 text-xs sm:text-sm font-semibold border-x-2 border-orange-400', accent.bgSoft, isLast ? 'border-b-2 rounded-b' : '')}>
                        <span className="mr-1.5 font-bold text-green-600">{row.soniOk !== false ? '✓' : '✗'}</span>
                        {row.soni}
                      </div>
                      <div className={cn('p-3 sm:p-4 text-xs sm:text-sm text-brand-muted', i % 2 === 1 ? 'bg-brand-light/40' : 'bg-white')}>
                        <span className={cn('mr-1.5 font-bold', row.shopOk ? 'text-green-600' : 'text-red-400')}>{row.shopOk ? '✓' : '✗'}</span>
                        {row.shop}
                      </div>
                    </div>
                  )
                })}
              </div>
              </div>
              {content.comparison.note && (
                <p className="text-center text-xs sm:text-sm text-brand-muted mt-4">{content.comparison.note}</p>
              )}
            </FadeUp>
          </div>
        </section>
      )}

      {/* ═══════════════ 4. SOCIAL PROOF ═══════════════ */}
      <section id="team" className="py-10 sm:py-14 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <FadeUp>
            <div className="text-center mb-8 sm:mb-10">
              {content.team.eyebrow && (
                <p className={cn('uppercase tracking-wider text-xs font-bold mb-2', accent.text)}>{content.team.eyebrow}</p>
              )}
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-3 max-w-3xl mx-auto leading-tight">
                {content.team.title}
              </h2>
              {content.team.subtitle && (
                <p className="text-sm sm:text-lg text-brand-muted max-w-2xl mx-auto leading-relaxed">{content.team.subtitle}</p>
              )}
              {content.team.rating && (
                <div className="mt-4 sm:mt-6 inline-flex flex-col items-center gap-1">
                  <p className="text-xl sm:text-2xl tracking-wider">⭐⭐⭐⭐⭐</p>
                  <p className="text-base sm:text-xl font-extrabold">
                    {content.team.rating.score}{' '}
                    <span className="text-xs sm:text-base font-medium text-brand-muted">{content.team.rating.text}</span>
                  </p>
                </div>
              )}
              {content.team.tagline && (
                <p className={cn('mt-3 sm:mt-4 text-xs sm:text-base font-medium italic', accent.text)}>{content.team.tagline}</p>
              )}
            </div>
          </FadeUp>

          {content.team.gallery && content.team.gallery.length > 0 && (
            <FadeUp delay={0.2} className="max-w-md mx-auto">
              <ProofGallerySlider gallery={content.team.gallery} accent={accent} />
            </FadeUp>
          )}

          {content.team.steps && content.team.steps.length > 0 && !content.team.gallery && (
            <div className="relative max-w-3xl mx-auto">
              <div className={cn('absolute left-6 sm:left-7 top-7 bottom-7 w-0.5', accent.bgSoft)} />
              <div className="space-y-4 sm:space-y-5">
                {content.team.steps.map(s => (
                  <div key={s.num} className="relative flex items-start gap-3 sm:gap-5">
                    <div className={cn('flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-extrabold text-white text-base sm:text-xl shadow-md z-10', accent.bg)}>
                      {s.num}
                    </div>
                    <div className="flex-1 bg-white rounded-xl sm:rounded-2xl border border-brand-border p-3 sm:p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        {s.icon && <span className="text-lg sm:text-xl">{s.icon}</span>}
                        <h3 className="font-extrabold text-sm sm:text-lg">{s.title}</h3>
                      </div>
                      <p className="text-xs sm:text-base text-brand-muted leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════ 5. PERSONAS ═══════════════ */}
      <section id="personas" className="py-10 sm:py-14 md:py-20 bg-brand-light">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-3 leading-tight">
              {content.personas.title}
            </h2>
            {content.personas.subtitle && (
              <p className="text-sm sm:text-base text-brand-muted max-w-3xl mx-auto leading-relaxed">{content.personas.subtitle}</p>
            )}
          </div>
          {/* Mobile: 1 cột, SM: 2 cột, LG: 4 cột */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {content.personas.items.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-brand-border flex flex-col">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={cn('flex-shrink-0 w-8 h-8 rounded-full overflow-hidden', !p.avatar && PERSONA_COLORS[i % PERSONA_COLORS.length])}>
                    {p.avatar ? (
                      <Image src={p.avatar} alt={p.name} width={32} height={32} className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center font-extrabold text-sm">{p.initial}</span>
                    )}
                  </div>
                  <span className="font-bold text-sm text-brand-black">{p.name}</span>
                </div>
                <p className="text-yellow-500 text-xs mb-1">⭐⭐⭐⭐⭐</p>
                <p className="text-xs sm:text-sm leading-relaxed italic text-brand-black flex-1">
                  &ldquo;{p.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════ 6. PRICING ═══════════════ */}
      {!content.giftLead && <section id="pricing" className="py-10 sm:py-14 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <FadeUp>
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-3">{content.pricing.title}</h2>
              {content.pricing.subtitle && (
                <p className="text-sm sm:text-base text-brand-muted leading-relaxed max-w-2xl mx-auto">{content.pricing.subtitle}</p>
              )}
            </div>
          </FadeUp>

          {/* Mobile: stack dọc, highlighted lên đầu */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {[...content.pricing.packages].sort((a, b) => (b.highlighted ? 1 : 0) - (a.highlighted ? 1 : 0)).map((pkg, i) => (
              <FadeUp key={pkg.name} delay={i * 0.1}>
              <div
                className={cn(
                  'bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 flex flex-col relative transition-all',
                  pkg.highlighted
                    ? cn('shadow-xl sm:shadow-2xl md:scale-[1.02] border-2', accent.border)
                    : 'shadow-md border border-brand-border'
                )}>
                {pkg.badge && (
                  <span className={cn('absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-bold text-white px-3 py-1 rounded-full shadow whitespace-nowrap', accent.bg)}>
                    {pkg.badge}
                  </span>
                )}
                <h3 className="font-extrabold text-base sm:text-xl mb-1">{pkg.name}</h3>
                <div className="mb-4 sm:mb-5">
                  {pkg.originalPrice && (
                    <p className="text-xs sm:text-sm text-brand-muted line-through">{formatVND(pkg.originalPrice)}</p>
                  )}
                  {pkg.tagline && (
                    <p className={cn('text-sm sm:text-base font-bold', accent.text)}>{pkg.tagline}</p>
                  )}
                  <p className="text-2xl sm:text-4xl font-extrabold text-brand-black">{formatVND(pkg.price)}</p>
                </div>
                <ul className="space-y-1.5 sm:space-y-2 mb-5 sm:mb-6 flex-1">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs sm:text-sm text-brand-black">
                      <span className={cn('flex-shrink-0 mt-0.5', accent.text)}>✓</span><span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => openOrder(pkg.preset)}
                  className={cn(
                    'w-full font-bold py-3 sm:py-3.5 rounded-xl transition-all active:scale-95 text-sm sm:text-base',
                    pkg.highlighted
                      ? cn('cta-pulse text-white shadow-lg', accent.bg, accent.bgHover)
                      : cn('border-2 hover:text-white', accent.border, accent.text, accent.bgHover)
                  )}>
                  {pkg.ctaText}
                </button>
              </div>
              </FadeUp>
            ))}
          </div>

          {content.pricing.footnote && (
            <p className="text-center text-xs sm:text-sm text-brand-muted mt-6 sm:mt-8 max-w-3xl mx-auto leading-relaxed">{content.pricing.footnote}</p>
          )}
        </div>
      </section>}

      {/* ═══════════════ 7. GUARANTEES ═══════════════ */}
      <section id="guarantees" className="py-10 sm:py-14 md:py-20 bg-gray-900 relative overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-orange-500 opacity-5 -top-40 -left-20 blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 relative">
          <FadeUp>
            <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-orange-500/40 bg-gray-800">
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-center sm:items-start">
                {/* Seal */}
                <div className={cn('flex-none w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 flex flex-col items-center justify-center text-center shadow-lg', accent.border)}>
                  <span className={cn('font-extrabold text-2xl sm:text-3xl leading-none', accent.text)}>100%</span>
                  <span className={cn('text-[9px] sm:text-[10px] font-extrabold tracking-widest mt-0.5', accent.text)}>AN TÂM</span>
                </div>
                {/* Content */}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold mb-2 sm:mb-3 leading-tight text-white">{content.guarantees.title}</h2>
                  {content.guarantees.subtitle && (
                    <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-4 sm:mb-5">{content.guarantees.subtitle}</p>
                  )}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                    {content.guarantees.items.map((g, i) => (
                      <span key={i} className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-gray-700 rounded-full px-3 py-2 border border-gray-600 shadow-sm">
                        <span className={cn('font-extrabold', accent.text)}>✓</span>{g.title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════ AI SUGGESTION ═══════════════ */}
      {content.painSolutionQA.aiSuggestion && (
        <section className="py-10 sm:py-14 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <div className={cn('rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-center text-white bg-gradient-to-r', accent.gradient)}>
              <h3 className="text-base sm:text-xl font-extrabold mb-2">{content.painSolutionQA.aiSuggestion.question}</h3>
              <p className="text-xs sm:text-base mb-4 sm:mb-5 opacity-95">{content.painSolutionQA.aiSuggestion.text}</p>
              {content.painSolutionQA.aiSuggestion.ctaHref ? (
                <a href={content.painSolutionQA.aiSuggestion.ctaHref}
                  className="inline-block bg-white text-brand-black font-extrabold px-5 sm:px-7 py-3 sm:py-4 rounded-2xl shadow-lg hover:scale-105 transition text-sm sm:text-base">
                  🤖 {content.painSolutionQA.aiSuggestion.ctaText}
                </a>
              ) : (
                <button onClick={() => content.painSolutionQA.aiSuggestion?.ctaTargetId && scrollTo(content.painSolutionQA.aiSuggestion.ctaTargetId)}
                  className="bg-white text-brand-black font-extrabold px-5 sm:px-7 py-3 sm:py-4 rounded-2xl shadow-lg hover:scale-105 transition text-sm sm:text-base">
                  🤖 {content.painSolutionQA.aiSuggestion.ctaText}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ 8. FAQ ═══════════════ */}
      <section id="faq" className="py-10 sm:py-14 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <FadeUp><h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-6 sm:mb-8 text-center">{content.faq.title}</h2></FadeUp>
          <div className="space-y-2 sm:space-y-3">
            {content.faq.items.map((item, i) => {
              const isOpen = openFaq === i
              return (
                <div key={i} className="bg-brand-light rounded-xl sm:rounded-2xl border border-brand-border">
                  <button onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-start justify-between gap-3 p-4 sm:p-5 text-left">
                    <span className="font-bold text-sm sm:text-base leading-snug pr-2">{item.q}</span>
                    <span className={cn('flex-shrink-0 text-xl sm:text-2xl font-light transition-transform', accent.text, isOpen ? 'rotate-45' : '')}>+</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm sm:text-base text-brand-muted leading-relaxed whitespace-pre-line">{item.a}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ 9. FINAL CTA ═══════════════ */}
      <section id="final-cta" className="py-12 sm:py-16 md:py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-orange-500 opacity-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
        <FadeUp className="max-w-3xl mx-auto px-4 text-center relative">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-3 sm:mb-5 leading-tight text-white">{content.finalCta.title}</h2>
          <p className="text-sm sm:text-lg mb-6 sm:mb-8 text-gray-300 leading-relaxed">{content.finalCta.subtitle}</p>
          <button onClick={() => scrollTo(content.giftLead ? 'shop' : 'pricing')}
            className={cn('cta-pulse font-extrabold text-sm sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl shadow-2xl hover:scale-105 transition text-white', accent.bg, accent.bgHover)}>
            {content.giftLead ? '🛍️ Xem Shop Gọng Kính' : content.finalCta.ctaText}
          </button>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-3 sm:mt-4">🛡️ {content.finalCta.microcopy}</p>
        </FadeUp>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="py-6 sm:py-8 bg-brand-black text-white">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs sm:text-sm">
          <p className="font-extrabold text-base sm:text-lg mb-2">SONi <span className={accent.text}>Cắt Kính Online</span></p>
          <p className="text-brand-muted text-[10px] sm:text-xs">
            Khúc xạ viên 10 năm kinh nghiệm · Hàng ngàn chiếc kính đã cắt online · Bảo hành chính hãng · COD toàn quốc
          </p>
          <div className="flex justify-center gap-4 mt-3 sm:mt-4 text-[10px] sm:text-xs">
            <a href="/" className="text-brand-muted hover:text-white">Trang chủ</a>
            <a href="/chinh-sach" className="text-brand-muted hover:text-white">Chính sách</a>
            <a href="https://zalo.me/0869308231" target="_blank" rel="noopener noreferrer" className="text-brand-muted hover:text-white">Zalo SONi</a>
          </div>
        </div>
      </footer>

      {/* ═══════════════ STICKY BOTTOM CTA (MOBILE) ═══════════════ */}
      {showStickyCta && (
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/96 backdrop-blur border-t border-brand-border shadow-2xl px-3 py-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-sm text-brand-black leading-tight">Cắt kính online</p>
            <p className="text-xs text-brand-muted truncate">chuẩn độ · giao tận nhà</p>
          </div>
          <button onClick={() => scrollTo('shop')}
            className={cn('flex-none cta-pulse font-extrabold py-3 px-5 rounded-xl text-white shadow-lg active:scale-95 transition text-sm', accent.bg, accent.bgHover)}>
            Đặt kính ngay
          </button>
        </div>
      )}

      {/* ═══════════════ ORDER MODAL ═══════════════ */}
      {modalOpen && (
        <OrderModal
          product={product}
          preset={modalPreset}
          selectedColorId={content.showColorGallery ? product.colorVariants[selectedColorIdx]?.id : undefined}
          onClose={closeOrder}
        />
      )}
    </div>
  )
}
