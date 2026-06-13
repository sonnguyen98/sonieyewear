'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { LandingPageContent } from '@/types/landingPage'
import type { Product } from '@/types/product'
import OrderModal from '@/components/product/OrderModal'
import { formatVND, cn } from '@/lib/utils'

// Map accent → full Tailwind classes (Tailwind JIT cần thấy đầy đủ chuỗi)
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
    bg: 'bg-red-500',
    bgHover: 'hover:bg-red-600',
    bgSoft: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-500',
    ring: 'ring-red-300',
    gradient: 'from-red-500 to-rose-500',
  },
  blue: {
    bg: 'bg-blue-600',
    bgHover: 'hover:bg-blue-700',
    bgSoft: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-600',
    ring: 'ring-blue-300',
    gradient: 'from-blue-600 to-cyan-500',
  },
  green: {
    bg: 'bg-emerald-600',
    bgHover: 'hover:bg-emerald-700',
    bgSoft: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-600',
    ring: 'ring-emerald-300',
    gradient: 'from-emerald-600 to-teal-500',
  },
  gold: {
    bg: 'bg-amber-500',
    bgHover: 'hover:bg-amber-600',
    bgSoft: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-500',
    ring: 'ring-amber-300',
    gradient: 'from-amber-500 to-yellow-500',
  },
} as const

interface Props {
  content: LandingPageContent
  product: Product
}

export default function LandingPageView({ content, product }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [showStickyCta, setShowStickyCta] = useState(false)
  const accent = ACCENT[content.accent ?? 'orange']
  const heroImage = content.heroImage ?? product.images?.[0] ?? product.colorVariants?.[0]?.imageUrl ?? ''
  const storyImage = content.storyImage

  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const openOrder = () => setModalOpen(true)

  return (
    <div className="bg-white text-brand-black">
      {/* ───────────── NAV ───────────── */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="font-extrabold text-lg tracking-tight">
            SONi <span className={accent.text}>Kính</span>
          </a>
          <button
            onClick={openOrder}
            className={cn(
              'hidden sm:flex items-center gap-2 text-sm font-bold text-white px-4 py-2 rounded-xl shadow',
              accent.bg, accent.bgHover
            )}
          >
            Đặt hàng — Giảm 30%
          </button>
        </div>
      </nav>

      {/* ───────────── HERO ───────────── */}
      <section className="relative overflow-hidden">
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-[0.04]', accent.gradient)} />
        <div className="max-w-6xl mx-auto px-4 pt-10 pb-14 lg:pt-16 lg:pb-20 grid lg:grid-cols-2 gap-10 items-center relative">
          <div className="order-2 lg:order-1">
            {content.hero.eyebrow && (
              <span className={cn('inline-block text-xs font-bold tracking-widest uppercase mb-3 px-3 py-1 rounded-full', accent.bgSoft, accent.text)}>
                {content.hero.eyebrow}
              </span>
            )}
            <h1 className="font-extrabold leading-[1.05] tracking-tight text-3xl sm:text-4xl lg:text-5xl mb-4">
              {content.hero.title}{' '}
              {content.hero.titleHighlight && (
                <span className={accent.text}>{content.hero.titleHighlight}</span>
              )}
            </h1>
            <p className="text-base sm:text-lg text-brand-muted leading-relaxed mb-6 max-w-xl">
              {content.hero.subtitle}
            </p>

            <button
              onClick={openOrder}
              className={cn(
                'w-full sm:w-auto text-white font-bold text-base sm:text-lg px-8 py-4 rounded-2xl shadow-xl transition-all active:scale-95',
                accent.bg, accent.bgHover
              )}
            >
              {content.hero.ctaText} →
            </button>
            <p className="text-xs text-brand-muted mt-3">🛡️ {content.hero.ctaMicrocopy}</p>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {content.hero.trustStrip.map((item) => (
                <div key={item} className="flex items-start gap-2 text-xs text-brand-muted">
                  <span className={accent.text}>✓</span>
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

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
            <div className={cn('absolute -bottom-4 -right-4 sm:bottom-6 sm:right-6 px-4 py-2 rounded-2xl shadow-lg text-white font-extrabold text-sm sm:text-base', accent.bg)}>
              -30% Hôm nay
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── STORY — VẤN ĐỀ ───────────── */}
      <section className="bg-brand-light py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-center leading-tight mb-4">
            {renderTitleWithItalic(content.story.title)}
          </h2>
          <p className="text-base sm:text-lg text-brand-muted text-center leading-relaxed mb-12 italic">
            {content.story.intro}
          </p>

          {/* Breaking point card */}
          <div className={cn('rounded-3xl border-l-4 bg-white shadow-md p-6 sm:p-8 mb-12', accent.border)}>
            <p className={cn('text-xs font-bold uppercase tracking-widest mb-2', accent.text)}>
              {content.story.breakingPoint.timeLabel}
            </p>
            <p className="text-base sm:text-lg leading-relaxed text-brand-black">
              {content.story.breakingPoint.text}
            </p>
          </div>

          {/* Timeline */}
          <div className="relative pl-10">
            <div className={cn('absolute left-3 top-2 bottom-2 w-0.5', accent.bg, 'opacity-30')} />
            {content.story.timeline.map((step, i) => (
              <div key={i} className="relative mb-8 last:mb-0">
                <div
                  className={cn(
                    'absolute -left-10 top-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow',
                    step.isClimax ? 'bg-red-500 ring-4 ring-red-200 animate-pulse' : accent.bg
                  )}
                >
                  {i + 1}
                </div>
                <div className={cn('rounded-2xl bg-white shadow-sm p-5', step.isClimax && 'ring-2 ring-red-200')}>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className={cn('text-xs font-bold px-2 py-0.5 rounded', accent.bgSoft, accent.text)}>
                      {step.time}
                    </span>
                    <span className="font-bold text-sm sm:text-base">
                      {step.isClimax && '⚡ '}{step.label}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-brand-muted leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Villain reframe */}
          <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-brand-border">
            <p className="text-base sm:text-lg text-brand-muted leading-relaxed mb-4">
              {content.story.villain.myth}
            </p>
            <p className="text-base sm:text-xl font-bold leading-relaxed text-brand-black">
              {content.story.villain.truth}
            </p>
          </div>

          {/* Twist */}
          <p className="mt-8 text-center text-base sm:text-lg text-brand-black italic leading-relaxed">
            {content.story.twist}
          </p>

          {/* Story image — chuyển cảnh sang giải pháp */}
          {storyImage && (
            <div className="mt-10 rounded-3xl overflow-hidden shadow-xl max-w-xl mx-auto">
              <Image
                src={storyImage}
                alt="Người đeo gọng Bulsajo"
                width={1200}
                height={1500}
                className="w-full h-auto object-cover"
              />
            </div>
          )}
        </div>
      </section>

      {/* ───────────── SOLUTION ───────────── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl mb-3">
              {content.solution.title}
            </h2>
            <p className="text-base sm:text-lg text-brand-muted leading-relaxed">
              {content.solution.subtitle}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
            {content.solution.items.map((item) => (
              <div key={item.featureLabel} className="bg-white border border-brand-border rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">{item.icon}</div>
                <p className={cn('text-[11px] font-bold uppercase tracking-widest mb-2', accent.text)}>
                  {item.featureLabel}
                </p>
                <h3 className="font-extrabold text-lg sm:text-xl mb-2 leading-tight">
                  {item.benefitTitle}
                </h3>
                <p className="text-sm sm:text-base text-brand-muted leading-relaxed">
                  {item.mechanism}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── PROOF ───────────── */}
      <section className="bg-brand-light py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-center mb-10">
            {content.proof.title}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {content.proof.stats.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-5 text-center shadow-sm">
                <div className={cn('text-3xl sm:text-4xl font-extrabold mb-1', accent.text)}>{s.value}</div>
                <div className="text-xs sm:text-sm text-brand-muted leading-snug">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
            {content.proof.testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm relative">
                {t.isPlaceholder && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">
                    MẪU
                  </span>
                )}
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i2) => (
                    <span key={i2} className={i2 < t.rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                  ))}
                </div>
                <p className="text-sm text-brand-black leading-relaxed mb-4 italic">"{t.text}"</p>
                <div className="text-xs">
                  <p className="font-bold text-brand-black">{t.name}</p>
                  <p className="text-brand-muted">{t.role}</p>
                </div>
              </div>
            ))}
          </div>

          {content.proof.placeholderNote && (
            <p className="text-center text-xs text-brand-muted mt-6 max-w-xl mx-auto italic">
              {content.proof.placeholderNote}
            </p>
          )}
        </div>
      </section>

      {/* ───────────── GUARANTEES ───────────── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-center mb-10">
            {content.guarantees.title}
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {content.guarantees.items.map((g) => (
              <div key={g.title} className={cn('rounded-2xl p-5 sm:p-6 border', accent.bgSoft, accent.border)}>
                <div className="text-3xl mb-2">{g.icon}</div>
                <h3 className="font-extrabold text-base sm:text-lg mb-1.5">{g.title}</h3>
                <p className="text-sm text-brand-muted leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── PRICING ───────────── */}
      <section className="bg-brand-light py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl mb-3">
              {content.pricing.title}
            </h2>
            {content.pricing.subtitle && (
              <p className="text-base text-brand-muted leading-relaxed">{content.pricing.subtitle}</p>
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
                  <span className={cn('absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-white px-3 py-1 rounded-full shadow', accent.bg)}>
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
                  onClick={openOrder}
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
            <p className="text-center text-sm text-brand-muted mt-8 max-w-2xl mx-auto">
              {content.pricing.footnote}
            </p>
          )}
        </div>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-center mb-10">
            {content.faq.title}
          </h2>
          <div className="space-y-3">
            {content.faq.items.map((item, i) => (
              <details key={i} className="group bg-brand-light rounded-2xl p-5 sm:p-6 cursor-pointer">
                <summary className="font-bold text-base sm:text-lg flex justify-between items-start gap-4 list-none">
                  <span>{item.q}</span>
                  <span className={cn('flex-shrink-0 transition-transform group-open:rotate-45 text-2xl leading-none', accent.text)}>+</span>
                </summary>
                <p className="mt-3 text-sm sm:text-base text-brand-muted leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── FINAL CTA ───────────── */}
      <section className={cn('py-16 lg:py-24 text-white relative overflow-hidden', accent.bg)}>
        <div className="absolute inset-0 bg-gradient-to-br opacity-30 from-black to-transparent" />
        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl leading-tight mb-4">
            {content.finalCta.title}
          </h2>
          <p className="text-base sm:text-lg leading-relaxed mb-8 opacity-95">
            {content.finalCta.subtitle}
          </p>
          <button
            onClick={openOrder}
            className="w-full sm:w-auto bg-white text-brand-black font-extrabold text-base sm:text-lg px-10 py-4 rounded-2xl shadow-xl active:scale-95 hover:bg-gray-100 transition-all"
          >
            {content.finalCta.ctaText} →
          </button>
          <p className="text-xs mt-3 opacity-90">{content.finalCta.microcopy}</p>
        </div>
      </section>

      {/* ───────────── FOOTER ───────────── */}
      <footer className="bg-brand-black text-white py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="font-extrabold text-lg mb-2">SONi Kính</p>
          <p className="text-xs text-gray-400 mb-4">
            Kính mắt cao cấp · Đổi trả 7 ngày · Bảo hành 12 tháng · Giao hàng toàn quốc
          </p>
          <div className="flex justify-center gap-4 text-xs text-gray-400">
            <a href="/" className="hover:text-white">Trang chủ</a>
            <span>·</span>
            <a href="/chinh-sach" className="hover:text-white">Chính sách</a>
            <span>·</span>
            <a href="/he-thong" className="hover:text-white">Hệ thống cửa hàng</a>
          </div>
        </div>
      </footer>

      {/* ───────────── STICKY MOBILE CTA ───────────── */}
      <div
        className={cn(
          'fixed bottom-0 inset-x-0 z-40 p-3 bg-white border-t border-brand-border shadow-2xl transition-transform sm:hidden',
          showStickyCta ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <button
          onClick={openOrder}
          className={cn('w-full text-white font-bold py-4 rounded-xl shadow-lg active:scale-95', accent.bg, accent.bgHover)}
        >
          {content.hero.ctaText} — Giảm 30%
        </button>
        <p className="text-center text-[10px] text-brand-muted mt-1.5">
          {content.hero.ctaMicrocopy}
        </p>
      </div>

      {/* Padding để sticky CTA không che footer trên mobile */}
      <div className="h-24 sm:hidden" />

      {/* ───────────── ORDER MODAL ───────────── */}
      {modalOpen && (
        <OrderModal product={product} onClose={() => setModalOpen(false)} />
      )}
    </div>
  )
}

/** Render tiêu đề có *italic* — dùng cú pháp markdown *text* */
function renderTitleWithItalic(title: string) {
  const parts = title.split(/(\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic font-extrabold">{part.slice(1, -1)}</em>
    }
    return <span key={i}>{part}</span>
  })
}
