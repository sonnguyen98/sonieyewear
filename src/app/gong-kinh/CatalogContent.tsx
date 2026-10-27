'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useProductFilters } from '@/hooks/useProductFilters'
import FilterSidebar from '@/components/catalog/FilterSidebar'
import ProductGrid from '@/components/catalog/ProductGrid'
import ViewToggle from '@/components/catalog/ViewToggle'
import SortDropdown from '@/components/catalog/SortDropdown'
import { VI } from '@/constants/vietnamese'
import { getFacePhoto, getFaceLandmarks } from '@/lib/faceStore'
import type { FaceLandmarkPoint } from '@/types/ar'
import type { Product } from '@/types/product'
import Link from 'next/link'

type TierGate = 350000 | 650000 | 900000 | 'all'

const TIER_GATE_OPTIONS: { value: TierGate; label: string; sub: string }[] = [
  { value: 350000, label: '350k', sub: 'Tròng 1.61' },
  { value: 650000, label: '650k', sub: 'Tròng 1.67' },
  { value: 900000, label: '900k', sub: 'Tròng 1.71' },
  { value: 'all', label: 'Chỉ Xem Gọng', sub: 'Toàn bộ gọng' },
]

export default function CatalogContent({ initialProducts }: { initialProducts: Product[] }) {
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'static' | 'ar'>('static')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [facePhoto, setFacePhoto] = useState<string | null>(null)
  const [faceLandmarks, setFaceLandmarks] = useState<FaceLandmarkPoint[] | null>(null)
  // Lọc gọng theo mức tròng — chỉ là filter để lướt xem, không khoá chọn gói lúc đặt hàng.
  const [tierGate, setTierGate] = useState<TierGate>('all')

  useEffect(() => {
    if (searchParams.get('mode') === 'ar') setViewMode('ar')
    setFacePhoto(getFacePhoto())
    setFaceLandmarks(getFaceLandmarks() as FaceLandmarkPoint[] | null)
    const tierParam = searchParams.get('tier')
    if (tierParam === '350000' || tierParam === '650000' || tierParam === '900000') {
      setTierGate(Number(tierParam) as TierGate)
    }
  }, [])

  useEffect(() => {
    if (viewMode === 'ar') {
      setFacePhoto(getFacePhoto())
      setFaceLandmarks(getFaceLandmarks() as FaceLandmarkPoint[] | null)
    }
  }, [viewMode])

  const {
    filters, filteredProducts: baseFilteredProducts, activeFilterCount,
    toggleFrameType, toggleFrameShape, toggleMaterial,
    toggleGender, setSortBy, setPriceRange, resetFilters,
  } = useProductFilters(initialProducts)

  // Gói 900k & Chỉ Xem Gọng: hiện toàn bộ, không giới hạn giá.
  // Gói 350k/650k: chỉ hiện gọng niêm yết <= giá mức đó (đúng trường hợp xấu nhất đã tính margin).
  const filteredProducts = tierGate === 'all'
    ? baseFilteredProducts
    : baseFilteredProducts.filter(p => p.basePrice <= tierGate)

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <nav className="text-xs text-brand-muted mb-4">
        <span>Trang Chủ</span>
        <span className="mx-1.5">/</span>
        <span className="text-brand-black font-medium">{VI.catalog.title}</span>
      </nav>

      {/* Banner gói đang chọn */}
      {tierGate !== 'all' && (
        <div className="mb-3 bg-brand-black text-white rounded-2xl px-4 py-2.5 flex items-center justify-between gap-2 flex-wrap">
          <p className="text-xs sm:text-sm font-semibold">
            Bạn đang chọn gói <span className="text-amber-300">{TIER_GATE_OPTIONS.find(o => o.value === tierGate)?.sub}</span> – {new Intl.NumberFormat('vi-VN').format(tierGate)}đ
            {' · '}Chọn 1 gọng tặng (tối đa {new Intl.NumberFormat('vi-VN').format(tierGate)}đ)
            {tierGate >= 650000 && <>{' · '}🚚 Free ship</>}
          </p>
          <button onClick={() => setTierGate('all')} className="text-[11px] text-gray-300 hover:text-white underline underline-offset-2 flex-shrink-0">
            Đổi gói
          </button>
        </div>
      )}

      {/* Chọn mức tròng trước khi xem gọng */}
      <div className="mb-4 bg-brand-light rounded-2xl p-3">
        <p className="text-xs font-semibold text-brand-black mb-2">Bạn muốn cắt tròng mức nào?</p>
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {TIER_GATE_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setTierGate(opt.value)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl border-2 text-left transition-all ${
                tierGate === opt.value ? 'border-brand-black bg-white' : 'border-transparent bg-white/60 hover:border-gray-300'
              }`}>
              <p className="text-sm font-bold text-brand-black leading-tight">{opt.label}</p>
              <p className="text-[10px] text-brand-muted">{opt.sub}</p>
            </button>
          ))}
        </div>
        {tierGate !== 'all' && (
          <p className="text-[11px] text-brand-muted mt-2">
            Đang hiện gọng niêm yết ≤ {new Intl.NumberFormat('vi-VN').format(tierGate)}đ — tặng kèm miễn phí khi chọn gói tròng tương ứng. Bạn vẫn chọn được gói khác lúc đặt hàng.
          </p>
        )}
      </div>

      <div className="flex gap-6">
        <aside className="hidden md:block w-60 flex-shrink-0">
          <FilterSidebar
            filters={filters}
            onToggleFrameType={toggleFrameType}
            onToggleFrameShape={toggleFrameShape}
            onToggleMaterial={toggleMaterial}
            onToggleGender={toggleGender}
            onSetPriceRange={setPriceRange}
            onReset={resetFilters}
            activeCount={activeFilterCount}
          />
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="md:hidden flex items-center gap-1.5 border border-brand-border rounded-lg px-3 py-1.5 text-xs font-medium text-brand-black bg-white"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                </svg>
                {VI.catalog.filterToggle}
                {activeFilterCount > 0 && (
                  <span className="bg-brand-black text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <h1 className="text-lg font-black text-brand-black">{VI.catalog.title}</h1>
              <span className="text-xs text-brand-muted hidden sm:block">
                ({filteredProducts.length} sản phẩm)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ViewToggle mode={viewMode} onChange={setViewMode}/>
              <SortDropdown value={filters.sortBy} onChange={setSortBy}/>
            </div>
          </div>

          {viewMode === 'ar' && facePhoto && (
            <div className="flex items-center gap-3 bg-brand-light border border-brand-border rounded-xl px-4 py-2.5 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={facePhoto} alt="face" className="w-10 h-10 rounded-lg object-cover flex-shrink-0"/>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-brand-black">Đang dùng ảnh của bạn</p>
                <p className="text-[11px] text-brand-muted">Mỗi sản phẩm sẽ hiện gọng kính trên khuôn mặt bạn</p>
              </div>
              <Link href="/thu-kinh"
                className="flex-shrink-0 text-xs font-bold text-brand-zalo border border-brand-zalo px-3 py-1.5 rounded-full hover:bg-blue-50 transition-colors">
                📸 Chụp lại
              </Link>
            </div>
          )}

          <ProductGrid
            products={filteredProducts}
            mode={viewMode}
            total={initialProducts.length}
            facePhoto={facePhoto}
            faceLandmarks={faceLandmarks}
            tierGate={tierGate}
          />
        </div>
      </div>

      <FilterSidebar
        filters={filters}
        onToggleFrameType={toggleFrameType}
        onToggleFrameShape={toggleFrameShape}
        onToggleMaterial={toggleMaterial}
        onToggleGender={toggleGender}
        onSetPriceRange={setPriceRange}
        onReset={resetFilters}
        activeCount={activeFilterCount}
        mobileOpen={mobileFilterOpen}
        onMobileClose={() => setMobileFilterOpen(false)}
      />
    </div>
  )
}
