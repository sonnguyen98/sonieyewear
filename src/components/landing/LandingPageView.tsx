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
    bg: 'bg-emerald-600', bgHover: 'hover:bg-emerald-700', bgSoft: 'bg-emerald-50',
    text: 'text-emerald-600', border: 'border-emerald-600', ring: 'ring-emerald-300',
    gradient: 'from-emerald-600 to-teal-500',
  },
  gold: {
    bg: 'bg-amber-500', bgHover: 'hover:bg-amber-600', bgSoft: 'bg-amber-50',
    text: 'text-amber-700', border: 'border-amber-500', ring: 'ring-amber-300',
    gradient: 'from-amber-500 to-yellow-500',
  },
} as const

// Màu xen kẽ cho avatar personas
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

interface Props {
  content: LandingPageContent
  product: Product
}

export default function LandingPageView({ content, product }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalPreset, setModalPreset] = useState<LandingPagePreset | undefined>(undefined)
  const [showStickyCta, setShowStickyCta] = useState(false)
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

  // Cuộn smooth tới section
  const scrollTo = (id: LpTargetId) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="bg-white text-brand-black">
      {/* ═══════════════ 0. TOP NAV ═══════════════ */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <a href="/" className="font-extrabold text-lg tracking-tight flex-shrink-0">
            SONi <span className={accent.text}>Cắt Kính Online</span>
          </a>
          {content.navAnchors && content.navAnchors.length > 0 && (
            <div className="hidden lg:flex items-center gap-5 text-sm font-medium text-brand-muted">
              {content.navAnchors.map(a => (
                <button
                  key={a.targetId}
                  onClick={() => scrollTo(a.targetId)}
                  className="hover:text-brand-black transition"
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}
          <a
            href="https://zalo.me/0869308231"
            target="_blank"
            rel="noopener noreferrer"
            className={cn('px-4 py-2 rounded-full font-bold text-white text-sm shadow transition', accent.bg, accent.bgHover)}
          >
            💬 Zalo SONi
          </a>
        </div>
      </nav>

      {/* ═══════════════ 1. HERO ═══════════════ */}
      <section className="relative overflow-hidden">
        <div className={cn('absolute inset-0 opacity-50', accent.bgSoft)} />
        <div className="relative max-w-6xl mx-auto px-4 py-10 md:py-16 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Trái — Text */}
          <div className="order-2 lg:order-1 space-y-5">
            {content.hero.eyebrow && (
              <p className={cn('uppercase tracking-wider text-xs font-bold', accent.text)}>
                {content.hero.eyebrow}
              </p>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
              {content.hero.title}{' '}
              {content.hero.titleHighlight && (
                <span className={accent.text}>{content.hero.titleHighlight}</span>
              )}
            </h1>
            <p className="text-base sm:text-lg text-brand-muted leading-relaxed">
              {content.hero.subtitle}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => scrollTo(content.hero.ctaPrimary.targetId)}
                className={cn(
                  'px-6 py-4 rounded-2xl font-bold text-white shadow-lg transition active:scale-95',
                  accent.bg, accent.bgHover
                )}
              >
                {content.hero.ctaPrimary.text} →
              </button>
              {content.hero.ctaSecondary && (
                <a
                  href={content.hero.ctaSecondary.href ?? '#'}
                  onClick={(e) => {
                    if (content.hero.ctaSecondary?.targetId) {
                      e.preventDefault()
                      scrollTo(content.hero.ctaSecondary.targetId)
                    }
                  }}
                  className={cn(
                    'px-6 py-4 rounded-2xl font-bold border-2 transition',
                    accent.border, accent.text, 'hover:bg-brand-light'
                  )}
                >
                  🤖 {content.hero.ctaSecondary.text}
                </a>
              )}
            </div>
            <p className="text-xs text-brand-muted">🛡️ {content.hero.ctaMicrocopy}</p>
            <ul className="grid grid-cols-2 sm:grid-cols-2 gap-2 pt-2 text-sm">
              {content.hero.trustStrip.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-brand-black">
                  <span className={cn('flex-shrink-0 mt-0.5 font-bold', accent.text)}>✓</span>
                  <span className="leading-snug">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Phải — Ảnh model */}
          <div className="order-1 lg:order-2 relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-brand-light shadow-2xl">
              {heroImage && (
                <Image
                  src={heroImage}
                  alt={product.name}
                  width={1200}
                  height={1500}
                  className="w-full h-full object-cover"
                  priority
                />
              )}
            </div>
            <div className={cn('absolute -bottom-4 right-4 px-4 py-2 rounded-full font-bold text-white text-sm shadow-xl', accent.bg)}>
              -30% Hôm nay
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ 2. GIFTS ═══════════════ */}
      <section id="gifts" className="py-14 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            {content.gifts.eyebrow && (
              <p className={cn('uppercase tracking-wider text-xs font-bold mb-2', accent.text)}>
                {content.gifts.eyebrow}
              </p>
            )}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3">
              {content.gifts.title}
            </h2>
            {content.gifts.subtitle && (
              <p className="text-base text-brand-muted max-w-2xl mx-auto leading-relaxed">
                {content.gifts.subtitle}
              </p>
            )}
          </div>
          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            {content.gifts.items.map((g, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-3xl p-6 sm:p-7 flex flex-col border-2 transition-all hover:shadow-xl',
                  accent.bgSoft, accent.border
                )}
              >
                <div className="text-4xl mb-3">{g.icon ?? '🎁'}</div>
                <h3 className="font-extrabold text-lg mb-2">{g.name}</h3>
                <p className="text-sm text-brand-muted leading-relaxed mb-4 flex-1">{g.desc}</p>
                {g.value && (
                  <p className={cn('text-xs font-bold mb-4 inline-block', accent.text)}>
                    {g.value}
                  </p>
                )}
                <button
                  onClick={() => scrollTo(g.ctaTargetId)}
                  className={cn(
                    'w-full py-3 rounded-xl font-bold text-white shadow transition active:scale-95',
                    accent.bg, accent.bgHover
                  )}
                >
                  {g.ctaText} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 3. PAIN ↔ SOLUTION Q&A ═══════════════ */}
      <section id="pain-solution" className="py-14 md:py-20 bg-brand-light">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3">
              {content.painSolutionQA.title}
            </h2>
            {content.painSolutionQA.subtitle && (
              <p className="text-base text-brand-muted max-w-2xl mx-auto leading-relaxed">
                {content.painSolutionQA.subtitle}
              </p>
            )}
          </div>

          <div className="space-y-12">
            {content.painSolutionQA.items.map((qa, i) => (
              <div key={i} className="bg-white rounded-3xl p-5 sm:p-8 shadow-md">
                {/* Q — Nỗi đau */}
                <div className="flex items-start gap-3 mb-4">
                  <span className={cn('flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-white', accent.bg)}>?</span>
                  <h3 className="text-lg sm:text-xl font-bold leading-snug mt-1">
                    {qa.pain.question}
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-5 md:gap-7">
                  {/* Trái — Pain text + image */}
                  <div>
                    <p className="text-sm sm:text-base text-brand-muted leading-relaxed mb-3">
                      {qa.pain.text}
                    </p>
                    {qa.pain.image && (
                      <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-brand-light relative">
                        <Image
                          src={qa.pain.image}
                          alt={`Vấn đề ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                        <span className="absolute top-3 left-3 bg-black/70 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          Trước
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Phải — Solution text + image */}
                  <div className={cn('rounded-2xl p-5', accent.bgSoft)}>
                    <p className={cn('text-xs font-bold uppercase tracking-wider mb-2', accent.text)}>
                      ✓ SONi giải quyết
                    </p>
                    <h4 className="font-extrabold text-base sm:text-lg mb-2 leading-snug">
                      {qa.solution.title}
                    </h4>
                    <p className="text-sm sm:text-base leading-relaxed mb-3">
                      {qa.solution.text}
                    </p>
                    {qa.solution.image && (
                      <div className="rounded-xl overflow-hidden aspect-[4/3] bg-white relative">
                        <Image
                          src={qa.solution.image}
                          alt={`Giải pháp ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                        <span className={cn('absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full', accent.bg)}>
                          Sau
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* AI Suggestion — câu hỏi đặc biệt */}
            {content.painSolutionQA.aiSuggestion && (
              <div className={cn('rounded-3xl p-6 sm:p-10 text-center text-white bg-gradient-to-r', accent.gradient)}>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center font-extrabold">?</span>
                  <h3 className="text-lg sm:text-xl font-bold">{content.painSolutionQA.aiSuggestion.question}</h3>
                </div>
                <p className="text-sm sm:text-base mb-6 max-w-2xl mx-auto opacity-95 leading-relaxed">
                  {content.painSolutionQA.aiSuggestion.text}
                </p>
                {content.painSolutionQA.aiSuggestion.ctaHref ? (
                  <a
                    href={content.painSolutionQA.aiSuggestion.ctaHref}
                    className="inline-block bg-white text-brand-black font-extrabold px-7 py-4 rounded-2xl shadow-lg hover:scale-105 transition"
                  >
                    🤖 {content.painSolutionQA.aiSuggestion.ctaText}
                  </a>
                ) : (
                  <button
                    onClick={() => content.painSolutionQA.aiSuggestion?.ctaTargetId && scrollTo(content.painSolutionQA.aiSuggestion.ctaTargetId)}
                    className="bg-white text-brand-black font-extrabold px-7 py-4 rounded-2xl shadow-lg hover:scale-105 transition"
                  >
                    🤖 {content.painSolutionQA.aiSuggestion.ctaText}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════ 4. TEAM + 5 BƯỚC + TẦM QUAN TRỌNG ═══════════════ */}
      <section id="team" className="py-14 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            {content.team.eyebrow && (
              <p className={cn('uppercase tracking-wider text-xs font-bold mb-2', accent.text)}>
                {content.team.eyebrow}
              </p>
            )}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3 max-w-3xl mx-auto leading-tight">
              {content.team.title}
            </h2>
            {content.team.subtitle && (
              <p className="text-base text-brand-muted max-w-3xl mx-auto leading-relaxed">
                {content.team.subtitle}
              </p>
            )}
          </div>

          {/* 5 bước — timeline dọc */}
          <div className="relative max-w-3xl mx-auto">
            {/* Đường nối dọc */}
            <div className={cn('absolute left-6 sm:left-7 top-7 bottom-7 w-0.5', accent.bgSoft)} />
            <div className="space-y-5">
              {content.team.steps.map(s => (
                <div key={s.num} className="relative flex items-start gap-4 sm:gap-5">
                  <div className={cn(
                    'flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-extrabold text-white text-lg sm:text-xl shadow-md z-10',
                    accent.bg
                  )}>
                    {s.num}
                  </div>
                  <div className="flex-1 bg-white rounded-2xl border border-brand-border p-4 sm:p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                      {s.icon && <span className="text-xl">{s.icon}</span>}
                      <h3 className="font-extrabold text-base sm:text-lg">{s.title}</h3>
                    </div>
                    <p className="text-sm sm:text-base text-brand-muted leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tầm quan trọng cắt kính cận */}
          {content.team.importanceBlock && (
            <div className={cn('mt-12 rounded-3xl p-6 sm:p-10 max-w-3xl mx-auto', accent.bgSoft)}>
              <h3 className="text-xl sm:text-2xl font-extrabold mb-3 leading-snug">
                {content.team.importanceBlock.title}
              </h3>
              <p className="text-sm sm:text-base text-brand-black leading-relaxed mb-5">
                {content.team.importanceBlock.text}
              </p>
              {content.team.importanceBlock.ctaText && content.team.importanceBlock.ctaTargetId && (
                <button
                  onClick={() => content.team.importanceBlock?.ctaTargetId && scrollTo(content.team.importanceBlock.ctaTargetId)}
                  className={cn(
                    'px-6 py-3.5 rounded-xl font-bold text-white shadow transition active:scale-95',
                    accent.bg, accent.bgHover
                  )}
                >
                  {content.team.importanceBlock.ctaText} →
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════ 5. PERSONAS ═══════════════ */}
      <section id="personas" className="py-14 md:py-20 bg-brand-light">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3">
              {content.personas.title}
            </h2>
            {content.personas.subtitle && (
              <p className="text-base text-brand-muted max-w-3xl mx-auto leading-relaxed">
                {content.personas.subtitle}
              </p>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {content.personas.items.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-brand-border flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    'flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-extrabold text-lg sm:text-xl',
                    PERSONA_COLORS[i % PERSONA_COLORS.length]
                  )}>
                    {p.initial}
                  </div>
                  <div className="leading-tight">
                    <p className="font-extrabold text-sm sm:text-base">{p.name} · {p.age} tuổi</p>
                    <p className="text-xs text-brand-muted">{p.role}</p>
                    <p className="text-xs text-brand-muted">{p.location}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed italic text-brand-black flex-1">
                  &ldquo;{p.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>
          {content.personas.note && (
            <p className="text-center text-xs text-brand-muted mt-8 max-w-2xl mx-auto leading-relaxed">
              {content.personas.note}
            </p>
          )}
        </div>
      </section>

      {/* ═══════════════ 6. PRICING ═══════════════ */}
      <section id="pricing" className="py-14 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3">
              {content.pricing.title}
            </h2>
            {content.pricing.subtitle && (
              <p className="text-base text-brand-muted leading-relaxed max-w-2xl mx-auto">
                {content.pricing.subtitle}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            {content.pricing.packages.map((pkg) => (
              <div
                key={pkg.name}
                className={cn(
                  'bg-white rounded-3xl p-6 sm:p-7 flex flex-col relative transition-all',
                  pkg.highlighted
                    ? cn('shadow-2xl scale-[1.02] border-2', accent.border)
                    : 'shadow-md border border-brand-border'
                )}
              >
                {pkg.badge && (
                  <span className={cn('absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-white px-3 py-1 rounded-full shadow whitespace-nowrap', accent.bg)}>
                    {pkg.badge}
                  </span>
                )}
                <h3 className="font-extrabold text-lg sm:text-xl mb-1">{pkg.name}</h3>
                <p className="text-sm text-brand-muted mb-5">{pkg.tagline}</p>

                <div className="mb-5">
                  {pkg.originalPrice && (
                    <p className="text-sm text-brand-muted line-through">{formatVND(pkg.originalPrice)}</p>
                  )}
                  <p className="text-3xl sm:text-4xl font-extrabold text-brand-black">{formatVND(pkg.price)}</p>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-brand-black">
                      <span className={cn('flex-shrink-0 mt-0.5', accent.text)}>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => openOrder(pkg.preset)}
                  className={cn(
                    'w-full font-bold py-3.5 rounded-xl transition-all active:scale-95',
                    pkg.highlighted
                      ? cn('text-white shadow-lg', accent.bg, accent.bgHover)
                      : cn('border-2 hover:text-white', accent.border, accent.text, accent.bgHover)
                  )}
                >
                  {pkg.ctaText}
                </button>
              </div>
            ))}
          </div>

          {content.pricing.footnote && (
            <p className="text-center text-sm text-brand-muted mt-8 max-w-3xl mx-auto leading-relaxed">
              {content.pricing.footnote}
            </p>
          )}
        </div>
      </section>

      {/* ═══════════════ 7. GUARANTEES ═══════════════ */}
      <section id="guarantees" className={cn('py-14 md:py-20', accent.bgSoft)}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3">
              {content.guarantees.title}
            </h2>
            {content.guarantees.subtitle && (
              <p className="text-base text-brand-muted leading-relaxed">{content.guarantees.subtitle}</p>
            )}
          </div>
          <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
            {content.guarantees.items.map((g, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="text-3xl mb-2">{g.icon}</div>
                <h3 className="font-extrabold text-base sm:text-lg mb-2 leading-snug">{g.title}</h3>
                <p className="text-sm text-brand-muted leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 8. FAQ ═══════════════ */}
      <section id="faq" className="py-14 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-8 text-center">
            {content.faq.title}
          </h2>
          <div className="space-y-3">
            {content.faq.items.map((item, i) => {
              const isOpen = openFaq === i
              return (
                <div key={i} className="bg-brand-light rounded-2xl border border-brand-border">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-start justify-between gap-4 p-5 text-left"
                  >
                    <span className="font-bold text-sm sm:text-base leading-snug pr-2">{item.q}</span>
                    <span className={cn('flex-shrink-0 text-2xl font-light transition-transform', accent.text, isOpen ? 'rotate-45' : '')}>
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm sm:text-base text-brand-muted leading-relaxed whitespace-pre-line">
                      {item.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ 9. FINAL CTA ═══════════════ */}
      <section id="final-cta" className={cn('py-16 md:py-24 text-white bg-gradient-to-br', accent.gradient)}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-5 leading-tight">
            {content.finalCta.title}
          </h2>
          <p className="text-base sm:text-lg mb-8 opacity-95 leading-relaxed">
            {content.finalCta.subtitle}
          </p>
          <button
            onClick={() => scrollTo('pricing')}
            className="bg-white text-brand-black font-extrabold text-base sm:text-lg px-8 py-4 rounded-2xl shadow-2xl hover:scale-105 transition"
          >
            {content.finalCta.ctaText} →
          </button>
          <p className="text-xs opacity-90 mt-4">🛡️ {content.finalCta.microcopy}</p>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="py-8 bg-brand-black text-white">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm">
          <p className="font-extrabold text-lg mb-2">SONi <span className={accent.text}>Cắt Kính Online</span></p>
          <p className="text-brand-muted text-xs">
            Khúc xạ viên 10 năm kinh nghiệm · Hàng ngàn chiếc kính đã cắt online · Bảo hành chính hãng · COD toàn quốc
          </p>
          <div className="flex justify-center gap-4 mt-4 text-xs">
            <a href="/" className="text-brand-muted hover:text-white">Trang chủ</a>
            <a href="/chinh-sach" className="text-brand-muted hover:text-white">Chính sách</a>
            <a href="https://zalo.me/0869308231" target="_blank" rel="noopener noreferrer" className="text-brand-muted hover:text-white">Zalo SONi</a>
          </div>
        </div>
      </footer>

      {/* ═══════════════ STICKY BOTTOM CTA (MOBILE) ═══════════════ */}
      {showStickyCta && (
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-brand-border shadow-2xl p-3 pb-safe">
          <button
            onClick={() => scrollTo('pricing')}
            className={cn(
              'w-full font-extrabold py-4 rounded-xl text-white shadow-lg active:scale-95 transition flex items-center justify-center gap-2',
              accent.bg, accent.bgHover
            )}
          >
            <span>Mua ngay — Giảm 30%</span>
            <span className="text-lg">→</span>
          </button>
          <p className="text-center text-[10px] text-brand-muted mt-1.5">
            {content.hero.ctaMicrocopy}
          </p>
        </div>
      )}

      {/* ═══════════════ ORDER MODAL ═══════════════ */}
      {modalOpen && (
        <OrderModal product={product} preset={modalPreset} onClose={closeOrder} />
      )}
    </div>
  )
}
