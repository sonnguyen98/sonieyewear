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
              <button key={p.id} onClick={() => setQuickView(p)}
                className="flex-shrink-0 w-[60vw] sm:w-56 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-shadow group text-left">
                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                  {thumb && (
                    <Image src={thumb} alt={p.name} fill className="object-contain p-3 group-hover:scale-105 transition-transform" sizes="(max-width: 640px) 42vw, 192px" />
                  )}
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                    -{pDiscount}%
                  </span>
                </div>
                <div className="p-2.5 sm:p-3">
                  <p className="text-xs sm:text-sm font-bold text-brand-black line-clamp-2 leading-tight mb-1.5">{p.name}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 line-through">{formatVND(p.basePrice)}</p>
                  <p className={cn('text-sm sm:text-base font-extrabold', accent.text)}>{formatVND(discounted)}</p>
                </div>
              </button>
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
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-brand-border flex items-start gap-4">
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
  const accent = ACCENT[content.accent ?? 'orange']
  const heroImage = content.heroImage ?? product.images?.[0] ?? product.colorVariants?.[0]?.imageUrl ?? ''

  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
      {/* ═══════════════ 0. TOP NAV ═══════════════ */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-12 sm:h-14 flex items-center justify-between gap-2">
          <a href="/" className="font-extrabold text-base sm:text-lg tracking-tight flex-shrink-0">
            SONi <span className={accent.text}>Cắt Kính Online</span>
          </a>
          {content.navAnchors && content.navAnchors.length > 0 && (
            <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto no-scrollbar text-xs sm:text-sm font-medium text-brand-muted">
              {content.navAnchors.map(a => (
                <button key={a.targetId} onClick={() => scrollTo(a.targetId)}
                  className="hover:text-brand-black transition whitespace-nowrap px-1.5 sm:px-0 py-1">
                  {a.label}
                </button>
              ))}
            </div>
          )}
          <a href="https://zalo.me/0869308231" target="_blank" rel="noopener noreferrer"
            className={cn('px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-white text-xs sm:text-sm shadow transition flex-shrink-0', accent.bg, accent.bgHover)}>
            💬 Zalo
          </a>
        </div>
      </nav>

      {/* ═══════════════ GIFT LEAD (thay Hero + Gifts) ═══════════════ */}
      {content.giftLead && (
        <GiftLeadSection giftLead={content.giftLead} accent={accent} slug={content.slug} />
      )}

      {/* ═══════════════ 1. HERO ═══════════════ */}
      {!content.giftLead && <section className="relative overflow-hidden">
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
              <div key={i} className="rounded-2xl overflow-hidden shadow-md sm:shadow-lg border border-brand-border bg-white flex flex-col">
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

      {/* ═══════════════ SHOP ═══════════════ */}
      <ShopCarousel accent={accent} />

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
      <section id="guarantees" className={cn('py-10 sm:py-14 md:py-20', accent.bgSoft)}>
        <div className="max-w-5xl mx-auto px-4">
          <FadeUp>
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-3">{content.guarantees.title}</h2>
              {content.guarantees.subtitle && (
                <p className="text-sm sm:text-base text-brand-muted leading-relaxed">{content.guarantees.subtitle}</p>
              )}
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
            {content.guarantees.items.map((g, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0">
                  <div className="text-2xl sm:text-3xl sm:mb-2 flex-shrink-0">{g.icon}</div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-lg sm:mb-2 leading-snug">{g.title}</h3>
                    {g.desc && <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">{g.desc}</p>}
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
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
                    <span className="font-bold text-xs sm:text-base leading-snug pr-2">{item.q}</span>
                    <span className={cn('flex-shrink-0 text-xl sm:text-2xl font-light transition-transform', accent.text, isOpen ? 'rotate-45' : '')}>+</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-base text-brand-muted leading-relaxed whitespace-pre-line">{item.a}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ 9. FINAL CTA ═══════════════ */}
      <section id="final-cta" className={cn('py-12 sm:py-16 md:py-24 text-white bg-gradient-to-br', accent.gradient)}>
        <FadeUp className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-3 sm:mb-5 leading-tight">{content.finalCta.title}</h2>
          <p className="text-sm sm:text-lg mb-6 sm:mb-8 opacity-95 leading-relaxed">{content.finalCta.subtitle}</p>
          <button onClick={() => scrollTo(content.giftLead ? 'shop' : 'pricing')}
            className="bg-white text-brand-black font-extrabold text-sm sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl shadow-2xl hover:scale-105 transition">
            {content.giftLead ? '🛍️ Xem Shop Gọng Kính' : content.finalCta.ctaText}
          </button>
          <p className="text-[10px] sm:text-xs opacity-90 mt-3 sm:mt-4">🛡️ {content.finalCta.microcopy}</p>
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
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur border-t border-brand-border shadow-2xl p-2.5 pb-safe">
          <button onClick={() => scrollTo(content.giftLead ? 'shop' : 'pricing')}
            className={cn('cta-pulse w-full font-extrabold py-3.5 rounded-xl text-white shadow-lg active:scale-95 transition flex items-center justify-center gap-2 text-sm', accent.bg, accent.bgHover)}>
            <span>{content.giftLead ? '🛍️ Xem Shop — Đang Giảm Giá' : 'Mua Ngay — Xem Bảng Giá'}</span>
            <span className="text-base">→</span>
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
