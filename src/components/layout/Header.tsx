'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { VI } from '@/constants/vietnamese'
import { openZaloDefault } from '@/lib/zalo'
import { useCart } from '@/lib/cartStore'
import CartDrawer from '@/components/cart/CartDrawer'
import SearchBar from '@/components/search/SearchBar'

const NAV_LINKS = [
  { href: '/gong-kinh',  label: 'Gọng Kính' },
  { href: '/trong-kinh', label: 'Tròng Kính' },
  { href: '/so-y-ba',    label: '📋 Sổ Theo Dõi Độ' },
]

const MORE_LINKS = [
  { href: '/chinh-sach', label: 'Chính Sách Bảo Hành' },
  { href: '/soni-share', label: 'SONi Share' },
  { href: '/he-thong',   label: 'Hệ Thống Cửa Hàng' },
]

const ALL_LINKS = [...NAV_LINKS, ...MORE_LINKS]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { totalItems } = useCart()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const isMoreActive = MORE_LINKS.some(l => pathname === l.href || pathname.startsWith(l.href))

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-brand-border shadow-sm">
        {/* Affiliate top bar */}
        <div className="bg-gray-900 text-center py-1.5 px-4">
          <Link href="/affiliate" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-amber-400 transition-colors">
            <span className="text-amber-400">💰</span>
            Kiếm tiền cùng SONi — Nhận <span className="text-amber-400 font-black">10% hoa hồng</span> mỗi đơn hàng thành công
            <span className="hidden sm:inline bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-400/30">Đăng ký ngay →</span>
          </Link>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-baseline gap-1 sm:gap-1.5 flex-shrink-0 select-none">
            <span className="text-2xl sm:text-3xl font-black tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
              <span style={{ color: '#5A5A5A' }}>S</span>
              <span style={{ color: '#C9A84C' }}>O</span>
              <span style={{ color: '#5A5A5A' }}>N</span>
              <span style={{ color: '#1E4D78' }}>i</span>
            </span>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.08em] sm:tracking-[0.1em] uppercase hidden xs:block leading-tight" style={{ color: '#7A7A7A' }}>
              Cắt Kính<br className="sm:hidden"/> Online
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center bg-gray-100 rounded-full px-1 py-1 gap-0 flex-shrink min-w-0">
            {NAV_LINKS.map(link => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <Link key={link.href} href={link.href}
                  className={cn(
                    'relative px-2.5 lg:px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition-all duration-150 whitespace-nowrap',
                    isActive ? 'bg-orange-100 text-brand-black shadow-sm' : 'text-gray-600 hover:bg-orange-100 hover:text-brand-black'
                  )}>
                  {link.label}
                </Link>
              )
            })}

            {/* More dropdown */}
            <div ref={moreRef} className="relative">
              <button
                onClick={() => setMoreOpen(o => !o)}
                className={cn(
                  'flex items-center gap-1 px-2.5 lg:px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition-all duration-150 whitespace-nowrap',
                  isMoreActive ? 'bg-orange-100 text-brand-black shadow-sm' : 'text-gray-600 hover:bg-orange-100 hover:text-brand-black'
                )}
              >
                Thêm
                <svg className={cn('w-3.5 h-3.5 transition-transform', moreOpen && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {moreOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl py-1 min-w-[200px] z-50">
                  {MORE_LINKS.map(link => (
                    <Link key={link.href} href={link.href}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        'block px-4 py-2.5 text-sm font-semibold transition-colors',
                        pathname === link.href ? 'bg-orange-50 text-brand-black' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-black'
                      )}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right: Search + Cart + CTA + Zalo + Hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Search */}
            <button onClick={() => setSearchOpen(o => !o)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Tìm kiếm">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Cart */}
            <button onClick={() => setCartOpen(true)} className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Giỏ hàng">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] min-h-[18px] flex items-center justify-center rounded-full leading-none">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* CTA */}
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 2a8 8 0 110 16A8 8 0 0112 4zm-3 5a1 1 0 100 2h6a1 1 0 100-2H9zm0 4a1 1 0 100 2h4a1 1 0 100-2H9z"/>
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

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-gray-100 px-4 py-3 bg-white">
            <div className="max-w-2xl mx-auto">
              <SearchBar onClose={() => setSearchOpen(false)} />
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-brand-border bg-white">
            <nav className="flex flex-col py-2">
              <Link href="/thu-kinh" onClick={() => setMenuOpen(false)}
                className="mx-4 my-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-sm font-bold py-3 rounded-2xl text-center">
                ✨ Gọng Nào Hợp Mặt Bạn?
              </Link>
              {ALL_LINKS.map(link => (
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

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
