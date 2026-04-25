'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { VI } from '@/constants/vietnamese'
import { openZaloDefault } from '@/lib/zalo'

const NAV_LINKS = [
  { href: '/gong-kinh',   label: 'Gọng Kính' },
  { href: '/trong-kinh',  label: 'Tròng Kính' },
  { href: '/chinh-sach',  label: 'Chính Sách Bảo Hành' },
  { href: '/soni-share',  label: 'SONi Share' },
  { href: '/he-thong',    label: 'Hệ Thống Cửa Hàng' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-brand-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">

        {/* Logo */}
        <Link href="/" className="flex items-baseline gap-1 sm:gap-1.5 flex-shrink-0 select-none">
          <span className="text-2xl sm:text-3xl font-black tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            <span style={{ color: '#5A5A5A' }}>S</span>
            <span style={{ color: '#C9A84C' }}>O</span>
            <span style={{ color: '#5A5A5A' }}>N</span>
            <span style={{ color: '#1E4D78' }}>i</span>
          </span>
          <span className="text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase hidden xs:block" style={{ color: '#7A7A7A' }}>
            eyewear
          </span>
        </Link>

        {/* Desktop Nav — chỉ các mục thông thường */}
        <nav className="hidden md:flex items-center bg-gray-100 rounded-full px-1 py-1 gap-0 flex-shrink min-w-0">
          {NAV_LINKS.map(link => {
            const isActive = pathname === link.href ||
              (link.href !== '/' && pathname.startsWith(link.href))
            return (
              <Link key={link.href} href={link.href}
                className={cn(
                  'relative px-2.5 lg:px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition-all duration-150 whitespace-nowrap',
                  isActive
                    ? 'bg-orange-100 text-brand-black shadow-sm'
                    : 'text-gray-600 hover:bg-orange-100 hover:text-brand-black'
                )}>
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right: CTA nổi bật + Zalo + Hamburger */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* CTA chính — nổi bật, tách biệt */}
          <Link href="/thu-kinh"
            className={cn(
              'hidden lg:flex items-center gap-1.5 font-bold text-xs px-3.5 py-2 rounded-full transition-all whitespace-nowrap shadow-sm',
              pathname.startsWith('/thu-kinh')
                ? 'bg-amber-500 text-white'
                : 'bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:from-amber-500 hover:to-orange-500 hover:shadow-md'
            )}>
            ✨ Gọng Nào Hợp Mặt Bạn?
          </Link>

          {/* Zalo */}
          <button onClick={openZaloDefault}
            className="hidden sm:flex items-center gap-1.5 bg-brand-zalo text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-blue-700 transition-colors">
            <svg width="14" height="14" viewBox="0 0 50 50" fill="none">
              <text x="50%" y="68%" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold" fontFamily="Arial">Z</text>
            </svg>
            Zalo
          </button>

          {/* Hamburger */}
          <button className="md:hidden p-2 rounded-lg hover:bg-brand-light transition-colors"
            onClick={() => setMenuOpen(o => !o)} aria-label={menuOpen ? VI.nav.close : VI.nav.menu}>
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-brand-border bg-white">
          <nav className="flex flex-col py-2">
            {/* CTA đầu tiên trên mobile */}
            <Link href="/thu-kinh" onClick={() => setMenuOpen(false)}
              className="mx-4 my-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-sm font-bold py-3 rounded-2xl text-center">
              ✨ Gọng Nào Hợp Mặt Bạn?
            </Link>
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'px-4 py-3 text-sm font-semibold transition-colors border-b border-gray-50 last:border-0',
                  pathname === link.href ? 'bg-gray-50 text-brand-black' : 'text-gray-700 hover:bg-gray-50'
                )}>
                {link.label}
              </Link>
            ))}
            <button onClick={() => { openZaloDefault(); setMenuOpen(false) }}
              className="mx-4 my-2 bg-brand-zalo text-white text-sm font-semibold py-2.5 rounded-full">
              Tư Vấn Zalo
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
