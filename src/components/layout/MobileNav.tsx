'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  {
    href: '/',
    label: 'Trang Chủ',
    icon: (active: boolean) => (
      <svg className={cn('w-5 h-5', active ? 'text-brand-black' : 'text-brand-muted')} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/gong-kinh',
    label: 'Gọng Kính',
    icon: (active: boolean) => (
      <svg className={cn('w-5 h-5', active ? 'text-brand-black' : 'text-brand-muted')} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <circle cx="7" cy="12" r="3" />
        <circle cx="17" cy="12" r="3" />
        <path strokeLinecap="round" d="M10 12h4M1 12h3M20 12h3" />
      </svg>
    ),
  },
  {
    href: '/trong-kinh',
    label: 'Tròng Kính',
    icon: (active: boolean) => (
      <svg className={cn('w-5 h-5', active ? 'text-brand-black' : 'text-brand-muted')} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M12 3v2M12 19v2M3 12h2M19 12h2" />
      </svg>
    ),
  },
  {
    href: '/thu-kinh',
    label: 'AI Tư Vấn',
    icon: (active: boolean) => (
      <svg className={cn('w-5 h-5', active ? 'text-brand-zalo' : 'text-brand-muted')} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    special: true,
  },
  {
    href: '/so-y-ba',
    label: 'Sổ Theo Dõi Độ',
    icon: (active: boolean) => (
      <svg className={cn('w-5 h-5', active ? 'text-blue-600' : 'text-brand-muted')} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    special: false,
    activeColor: 'text-blue-600',
  },
]

export default function MobileNav() {
  const pathname = usePathname()
  if (pathname === '/thu-kinh' || pathname.startsWith('/admin') || pathname.startsWith('/so-y-ba')) return null

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-brand-border" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex">
        {TABS.map(tab => {
          const active = tab.href ? (pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))) : false
          return (
            <Link key={tab.href} href={tab.href}
              className={cn('flex-1 flex flex-col items-center justify-center py-2.5 transition-colors', active && 'bg-gray-50')}>
              {tab.icon(active)}
              <span className={cn('text-[10px] font-semibold mt-0.5', active ? (tab.activeColor ?? (tab.special ? 'text-brand-zalo' : 'text-brand-black')) : 'text-brand-muted')}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
