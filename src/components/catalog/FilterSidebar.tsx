'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { VI } from '@/constants/vietnamese'
import type { FilterState } from '@/types/filters'
import type { FrameType, FrameShape, FrameMaterial, Gender } from '@/types/product'
import { formatVND } from '@/lib/utils'

interface FilterSidebarProps {
  filters: FilterState
  onToggleFrameType: (t: FrameType) => void
  onToggleFrameShape: (s: FrameShape) => void
  onToggleMaterial: (m: FrameMaterial) => void
  onToggleGender: (g: Gender) => void
  onSetPriceRange: (r: [number, number]) => void
  onReset: () => void
  activeCount: number
  mobileOpen?: boolean
  onMobileClose?: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-brand-border pb-4 mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full text-sm font-semibold text-brand-black mb-3"
      >
        {title}
        <svg className={cn('w-4 h-4 transition-transform', !open && '-rotate-90')} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && children}
    </div>
  )
}

const FRAME_TYPES: FrameType[] = ['full-rim', 'rimless', 'semi-rimless']
const FRAME_SHAPES: FrameShape[] = ['round', 'square', 'rectangle', 'cat-eye', 'oval', 'geometric']
const MATERIALS: FrameMaterial[] = ['metal', 'plastic', 'titanium', 'combination']
const GENDERS: Gender[] = ['nam', 'nu', 'unisex']

// Unique colors from all products
const COMMON_COLORS = [
  { hex: '#1A1A1A', name: 'Đen' },
  { hex: '#C0C0C0', name: 'Bạc' },
  { hex: '#D4A853', name: 'Vàng' },
  { hex: '#B76E79', name: 'Hồng Vàng' },
  { hex: '#6B4226', name: 'Đồi Mồi' },
  { hex: '#800020', name: 'Đỏ' },
  { hex: '#4169E1', name: 'Xanh' },
]

export default function FilterSidebar({
  filters, onToggleFrameType, onToggleFrameShape, onToggleMaterial,
  onToggleGender, onSetPriceRange, onReset, activeCount,
  mobileOpen, onMobileClose,
}: FilterSidebarProps) {
  const content = (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="font-bold text-base text-brand-black">{VI.catalog.filterTitle}</span>
          {activeCount > 0 && (
            <span className="bg-brand-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={onReset} className="text-xs text-brand-muted underline hover:text-brand-black">
            {VI.catalog.resetFilters}
          </button>
        )}
      </div>

      {/* Frame Type */}
      <Section title={VI.catalog.filterSections.frameType}>
        <div className="flex flex-wrap gap-2">
          {FRAME_TYPES.map(t => (
            <button
              key={t}
              onClick={() => onToggleFrameType(t)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                filters.frameType.includes(t)
                  ? 'bg-brand-black text-white border-brand-black'
                  : 'bg-white text-brand-black border-brand-border hover:border-brand-black'
              )}
            >
              {VI.catalog.frameTypes[t]}
            </button>
          ))}
        </div>
      </Section>

      {/* Frame Shape */}
      <Section title={VI.catalog.filterSections.frameShape}>
        <div className="flex flex-wrap gap-2">
          {FRAME_SHAPES.map(s => (
            <button
              key={s}
              onClick={() => onToggleFrameShape(s)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                filters.frameShape.includes(s)
                  ? 'bg-brand-black text-white border-brand-black'
                  : 'bg-white text-brand-black border-brand-border hover:border-brand-black'
              )}
            >
              {VI.catalog.frameShapes[s]}
            </button>
          ))}
        </div>
      </Section>

      {/* Color */}
      <Section title={VI.catalog.filterSections.color}>
        <div className="flex flex-wrap gap-2">
          {COMMON_COLORS.map(c => (
            <button
              key={c.hex}
              onClick={() => {}} // color filter is by hex, keeping simple
              title={c.name}
              className={cn(
                'w-7 h-7 rounded-full border-2 transition-all hover:scale-110',
                filters.color.includes(c.hex)
                  ? 'border-brand-black scale-110'
                  : 'border-brand-border'
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </Section>

      {/* Material */}
      <Section title={VI.catalog.filterSections.material}>
        <div className="flex flex-col gap-2">
          {MATERIALS.map(m => (
            <label key={m} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.material.includes(m)}
                onChange={() => onToggleMaterial(m)}
                className="w-4 h-4 rounded border-gray-300 text-brand-black focus:ring-brand-black"
              />
              <span className="text-sm text-brand-black">{VI.catalog.materials[m]}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Gender */}
      <Section title={VI.catalog.filterSections.gender}>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map(g => (
            <button
              key={g}
              onClick={() => onToggleGender(g)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                filters.gender.includes(g)
                  ? 'bg-brand-black text-white border-brand-black'
                  : 'bg-white text-brand-black border-brand-border hover:border-brand-black'
              )}
            >
              {VI.catalog.genders[g]}
            </button>
          ))}
        </div>
      </Section>

      {/* Price Range */}
      <Section title={VI.catalog.filterSections.price}>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-brand-muted">
            <span>{formatVND(filters.priceRange[0])}</span>
            <span>{formatVND(filters.priceRange[1])}</span>
          </div>
          <input
            type="range"
            min={0}
            max={3000000}
            step={100000}
            value={filters.priceRange[1]}
            onChange={e => onSetPriceRange([filters.priceRange[0], +e.target.value])}
            className="w-full accent-brand-black"
          />
        </div>
      </Section>
    </div>
  )

  // Desktop: always visible
  if (!mobileOpen && mobileOpen !== false) {
    return <div className="w-64 flex-shrink-0">{content}</div>
  }

  // Mobile: slide-over drawer
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <div className="relative w-80 max-w-full bg-white h-full overflow-y-auto ml-auto animate-slide-up">
            <div className="sticky top-0 bg-white border-b border-brand-border flex items-center justify-between p-4">
              <span className="font-bold">{VI.catalog.filterTitle}</span>
              <button onClick={onMobileClose} className="p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  )
}
