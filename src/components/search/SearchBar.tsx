'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatVND } from '@/lib/utils'

interface SearchItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  href: string
  type: 'gong' | 'trong'
}

interface SearchBarProps {
  onClose?: () => void
}

export default function SearchBar({ onClose }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchItem[]>([])
  const [allItems, setAllItems] = useState<SearchItem[]>([])
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()).catch(() => []),
      fetch('/api/lens-products').then(r => r.json()).catch(() => []),
    ]).then(([products, lenses]) => {
      const items: SearchItem[] = []

      if (Array.isArray(products)) {
        for (const p of products) {
          items.push({
            id: p.id,
            name: p.name,
            price: Math.round(p.basePrice * (1 - (p.discountPercent ?? 20) / 100)),
            originalPrice: p.basePrice,
            image: p.images?.[0] ?? p.colorVariants?.[0]?.imageUrl ?? '',
            href: `/gong-kinh/${p.id}`,
            type: 'gong',
          })
        }
      }

      if (Array.isArray(lenses)) {
        for (const l of lenses) {
          items.push({
            id: l.id,
            name: l.name,
            price: l.price,
            image: l.image ?? '',
            href: '/trong-kinh',
            type: 'trong',
          })
        }
      }

      setAllItems(items)
    })
  }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const q = query.toLowerCase().trim()
    const filtered = allItems.filter(item =>
      item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)
    ).slice(0, 8)
    setResults(filtered)
  }, [query, allItems])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSelect = () => {
    setQuery('')
    setFocused(false)
    onClose?.()
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Tìm gọng kính, tròng kính..."
          className="w-full pl-10 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-brand-zalo focus:ring-1 focus:ring-brand-zalo/30 outline-none transition-all"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {focused && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-[400px] overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-brand-muted">
              Không tìm thấy sản phẩm nào
            </div>
          ) : (
            <>
              {results.map(item => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={handleSelect}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  {item.image ? (
                    <div className="relative w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-contain p-1" sizes="48px" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-lg">
                      {item.type === 'trong' ? '🔵' : '👓'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brand-black truncate">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-brand-black">{formatVND(item.price)}</span>
                      {item.originalPrice && item.originalPrice !== item.price && (
                        <span className="text-xs text-gray-400 line-through">{formatVND(item.originalPrice)}</span>
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        item.type === 'trong' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {item.type === 'trong' ? 'Tròng' : 'Gọng'}
                      </span>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
