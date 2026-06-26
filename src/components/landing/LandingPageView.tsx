'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { LandingPageContent, LandingPagePreset, LpTargetId } from '@/types/landingPage'
import type { Product } from '@/types/product'
import OrderModal from '@/components/product/OrderModal'
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

      {/* ═══════════════ 1. HERO ═══════════════ */}
      <section className="relative overflow-hidden">
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
      </section>

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
      <section id="gifts" className="py-10 sm:py-14 md:py-20 bg-white">
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
      </section>

      {/* ═══════════════ 3. PAIN ↔ SOLUTION Q&A ═══════════════ */}
      <section id="pain-solution" className="py-10 sm:py-14 md:py-20 bg-brand-light">
        <div className="max-w-2xl mx-auto px-4">
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

          <div className="space-y-6 sm:space-y-8">
            {content.painSolutionQA.items.map((qa, i) => (
              <div key={i} className="bg-white rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg overflow-hidden">
                <div className={cn('px-4 sm:px-6 py-3 sm:py-4 text-center bg-gradient-to-r text-white', accent.gradient)}>
                  <h3 className="text-base sm:text-xl font-extrabold">{qa.pain.question}</h3>
                </div>
                <div className="p-4 sm:p-6">
                  {qa.pain.image && (
                    <div className="mb-2">
                      <div className="rounded-xl sm:rounded-2xl overflow-hidden aspect-[4/3] bg-gray-100 relative">
                        <Image src={qa.pain.image} alt={qa.pain.text} fill className="object-cover" sizes="(max-width: 768px) 100vw, 600px" />
                        <span className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow">TRƯỚC</span>
                      </div>
                      <p className="text-center text-xs sm:text-sm text-brand-muted mt-1.5 italic">{qa.pain.text}</p>
                    </div>
                  )}
                  <div className={cn('flex justify-center py-2 sm:py-3 text-2xl sm:text-3xl font-bold', accent.text)}>↓</div>
                  {qa.solution.image && (
                    <div className="mb-4 sm:mb-5">
                      <div className="rounded-xl sm:rounded-2xl overflow-hidden aspect-[4/3] bg-gray-100 relative">
                        <Image src={qa.solution.image} alt={qa.solution.text} fill className="object-cover" sizes="(max-width: 768px) 100vw, 600px" />
                        <span className={cn('absolute top-2 sm:top-3 left-2 sm:left-3 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow', accent.bg)}>SAU</span>
                      </div>
                      <p className={cn('text-center text-xs sm:text-sm font-semibold mt-1.5', accent.text)}>{qa.solution.text}</p>
                    </div>
                  )}
                  <div className={cn('rounded-xl sm:rounded-2xl p-4 sm:p-5', accent.bgSoft)}>
                    <p className={cn('text-xs sm:text-sm font-extrabold mb-2 sm:mb-3', accent.text)}>{qa.solution.title}</p>
                    {qa.solution.bullets && (
                      <ul className="space-y-2">
                        {qa.solution.bullets.map((b, bi) => (
                          <li key={bi} className="flex items-start gap-2 text-xs sm:text-base font-medium text-brand-black">
                            <span className={cn('flex-shrink-0 mt-0.5 font-bold', accent.text)}>✓</span>{b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {content.painSolutionQA.aiSuggestion && (
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
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════ 4. SOCIAL PROOF ═══════════════ */}
      <section id="team" className="py-10 sm:py-14 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
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

          {content.team.gallery && content.team.gallery.length > 0 && (
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
              {content.team.gallery.map((img, i) => (
                <div key={i} className="aspect-square rounded-lg sm:rounded-2xl overflow-hidden bg-gray-100 relative group">
                  <Image src={img.src} alt={img.alt} fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 33vw, 280px" />
                </div>
              ))}
            </div>
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
              <div key={i} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-brand-border flex flex-col">
                <div className="flex items-center gap-3 mb-2 sm:mb-3">
                  <div className={cn('flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 rounded-full overflow-hidden',
                    !p.avatar && PERSONA_COLORS[i % PERSONA_COLORS.length])}>
                    {p.avatar ? (
                      <Image src={p.avatar} alt={p.name} width={56} height={56} className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center font-extrabold text-base sm:text-xl">{p.initial}</span>
                    )}
                  </div>
                  <div className="leading-tight">
                    <p className="font-extrabold text-sm">{p.name} · {p.age} tuổi</p>
                    <p className="text-[11px] sm:text-xs text-brand-muted">{p.role}</p>
                    {p.location && <p className="text-[11px] sm:text-xs text-brand-muted">{p.location}</p>}
                  </div>
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
      <section id="pricing" className="py-10 sm:py-14 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-3">{content.pricing.title}</h2>
            {content.pricing.subtitle && (
              <p className="text-sm sm:text-base text-brand-muted leading-relaxed max-w-2xl mx-auto">{content.pricing.subtitle}</p>
            )}
          </div>

          {/* Mobile: stack dọc, highlighted lên đầu */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {[...content.pricing.packages].sort((a, b) => (b.highlighted ? 1 : 0) - (a.highlighted ? 1 : 0)).map((pkg) => (
              <div key={pkg.name}
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
            ))}
          </div>

          {content.pricing.footnote && (
            <p className="text-center text-xs sm:text-sm text-brand-muted mt-6 sm:mt-8 max-w-3xl mx-auto leading-relaxed">{content.pricing.footnote}</p>
          )}
        </div>
      </section>

      {/* ═══════════════ 7. GUARANTEES ═══════════════ */}
      <section id="guarantees" className={cn('py-10 sm:py-14 md:py-20', accent.bgSoft)}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-3">{content.guarantees.title}</h2>
            {content.guarantees.subtitle && (
              <p className="text-sm sm:text-base text-brand-muted leading-relaxed">{content.guarantees.subtitle}</p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
            {content.guarantees.items.map((g, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0">
                <div className="text-2xl sm:text-3xl sm:mb-2 flex-shrink-0">{g.icon}</div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-lg sm:mb-2 leading-snug">{g.title}</h3>
                  {g.desc && <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">{g.desc}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 8. FAQ ═══════════════ */}
      <section id="faq" className="py-10 sm:py-14 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-6 sm:mb-8 text-center">{content.faq.title}</h2>
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
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-3 sm:mb-5 leading-tight">{content.finalCta.title}</h2>
          <p className="text-sm sm:text-lg mb-6 sm:mb-8 opacity-95 leading-relaxed">{content.finalCta.subtitle}</p>
          <button onClick={() => scrollTo('pricing')}
            className="bg-white text-brand-black font-extrabold text-sm sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl shadow-2xl hover:scale-105 transition">
            {content.finalCta.ctaText}
          </button>
          <p className="text-[10px] sm:text-xs opacity-90 mt-3 sm:mt-4">🛡️ {content.finalCta.microcopy}</p>
        </div>
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
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-brand-border shadow-2xl p-2.5 pb-safe">
          <button onClick={() => scrollTo('pricing')}
            className={cn('cta-pulse w-full font-extrabold py-3.5 rounded-xl text-white shadow-lg active:scale-95 transition flex items-center justify-center gap-2 text-sm', accent.bg, accent.bgHover)}>
            <span>Mua Ngay — Xem Bảng Giá</span>
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
