'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const SLIDES = [
  {
    id: 1,
    image: '/images/hero/hero-1.png',
    accent: '#d97706',
    accentClass: 'text-amber-600',
    badgeBg: 'bg-amber-500',
    btnPrimary: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200',
    btnSecond: 'bg-white/90 hover:bg-white text-amber-700 border border-amber-200',
    dot: 'bg-amber-400',
    tag: '🎉 Ưu đãi hôm nay',
    heading: 'Kính Đẹp,\nĐúng Mốt,\nNét Như SONi',
    sub: 'Thử kính ảo ngay trên khuôn mặt — không cần ra cửa hàng.',
    cta: 'Thử Kính Ngay',
    ctaHref: '/thu-kinh',
    cta2: 'Xem Bộ Sưu Tập',
    cta2Href: '/gong-kinh',
    stats: [{ value: '500+', label: 'Mẫu gọng' }, { value: '10K+', label: 'Khách hài lòng' }, { value: '-20%', label: 'Mọi đơn' }],
  },
  {
    id: 2,
    image: '/images/hero/hero-2.png',
    accent: '#0284c7',
    accentClass: 'text-sky-600',
    badgeBg: 'bg-sky-500',
    btnPrimary: 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-200',
    btnSecond: 'bg-white/90 hover:bg-white text-sky-700 border border-sky-200',
    dot: 'bg-sky-400',
    tag: '✨ Tư vấn AI miễn phí',
    heading: 'Phân Tích\nKhuôn Mặt —\nĐề Xuất Gọng',
    sub: 'Chụp ảnh — AI phân tích và đề xuất 3–5 mẫu phù hợp chỉ trong vài giây.',
    cta: 'Tư Vấn Ngay',
    ctaHref: '/thu-kinh',
    cta2: 'Xem Bộ Sưu Tập',
    cta2Href: '/gong-kinh',
    stats: [{ value: 'AI', label: 'Phân tích mặt' }, { value: '5s', label: 'Kết quả' }, { value: '100%', label: 'Miễn phí' }],
  },
  {
    id: 3,
    image: '/images/hero/hero-3.png',
    accent: '#e11d48',
    accentClass: 'text-rose-600',
    badgeBg: 'bg-rose-500',
    btnPrimary: 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200',
    btnSecond: 'bg-white/90 hover:bg-white text-rose-700 border border-rose-200',
    dot: 'bg-rose-400',
    tag: '🔥 Ưu đãi đặc biệt',
    heading: 'Giảm Ngay\n20% Toàn\nBộ Sản Phẩm',
    sub: 'Áp dụng cho tất cả gọng kính và tròng kính. Đặt hàng ngay hôm nay.',
    cta: 'Mua Ngay Giảm 20%',
    ctaHref: '/gong-kinh',
    cta2: 'Xem Tròng Kính',
    cta2Href: '/trong-kinh',
    stats: [{ value: '20%', label: 'Giảm ngay' }, { value: '7', label: 'Ngày đổi trả' }, { value: '12', label: 'Tháng BH' }],
  },
  {
    id: 4,
    image: '/images/hero/hero-4.png',
    accent: '#0d9488',
    accentClass: 'text-teal-600',
    badgeBg: 'bg-teal-500',
    btnPrimary: 'bg-teal-500 hover:bg-teal-600 text-white shadow-teal-200',
    btnSecond: 'bg-white/90 hover:bg-white text-teal-700 border border-teal-200',
    dot: 'bg-teal-400',
    tag: '✅ Cam kết chất lượng',
    heading: 'Minh Bạch,\nRõ Ràng —\nĐúng Chất Lượng',
    sub: 'Làm kính và quay video gửi Zalo — đúng gọng, đúng tròng, đúng độ trước khi giao.',
    cta: 'Tìm Hiểu Thêm',
    ctaHref: '/chinh-sach',
    cta2: 'Nhắn Zalo Ngay',
    cta2Href: '#',
    stats: [{ value: '100%', label: 'Minh bạch' }, { value: '📹', label: 'Video xác nhận' }, { value: '0đ', label: 'Rủi ro KH' }],
  },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 8000)
    return () => clearInterval(t)
  }, [paused])

  const slide = SLIDES[current]

  return (
    <section
      className="relative overflow-hidden min-h-[420px] sm:min-h-[480px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Ảnh nền */}
      <div className="absolute inset-0">
        {SLIDES.map((s, i) => (
          <div key={s.id} className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}>
            <Image src={s.image} alt="" fill className="object-cover object-center" priority={i === 0} sizes="100vw"/>
          </div>
        ))}
        {/* Overlay gradient nhẹ toàn màn */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-10 sm:py-14 flex items-center min-h-[420px] sm:min-h-[480px]">
        {/* Glass card */}
        <div className="w-full max-w-sm sm:max-w-md bg-white/80 backdrop-blur-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/60">

          {/* Badge */}
          <div className={`inline-flex items-center gap-2 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 ${slide.badgeBg}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse"/>
            {slide.tag}
          </div>

          {/* Heading */}
          <h1 className="font-black text-gray-900 tracking-tight mb-3 leading-tight">
            {slide.heading.split('\n').map((line, i, arr) => (
              <span key={i} className={`block ${i === 1 ? slide.accentClass : ''} ${i === 0 ? 'text-2xl sm:text-3xl md:text-4xl' : i === 1 ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-xl sm:text-2xl md:text-3xl text-gray-600'}`}>
                {line}
              </span>
            ))}
          </h1>

          {/* Sub */}
          <p className="text-sm text-gray-600 leading-relaxed mb-5">{slide.sub}</p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-2.5 mb-6">
            <Link href={slide.ctaHref}
              className={`flex-1 text-center px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg hover:shadow-xl active:scale-95 ${slide.btnPrimary}`}>
              {slide.cta}
            </Link>
            <Link href={slide.cta2Href}
              className={`flex-1 text-center px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all active:scale-95 ${slide.btnSecond}`}>
              {slide.cta2}
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            {slide.stats.map(s => (
              <div key={s.label} className="flex-1 text-center">
                <div className={`text-xl font-black ${slide.accentClass}`}>{s.value}</div>
                <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full ${i === current ? `w-6 h-2 ${slide.dot}` : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}/>
        ))}
      </div>

      {/* Arrows */}
      <button onClick={() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-all z-10 backdrop-blur-sm">
        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <button onClick={() => setCurrent(c => (c + 1) % SLIDES.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-all z-10 backdrop-blur-sm">
        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </section>
  )
}
