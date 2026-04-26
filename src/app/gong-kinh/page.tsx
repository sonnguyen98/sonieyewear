'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useProductFilters } from '@/hooks/useProductFilters'
import FilterSidebar from '@/components/catalog/FilterSidebar'
import ProductGrid from '@/components/catalog/ProductGrid'
import ViewToggle from '@/components/catalog/ViewToggle'
import SortDropdown from '@/components/catalog/SortDropdown'
import { MERGED_PRODUCTS as PRODUCTS } from '@/data/products'
import { VI } from '@/constants/vietnamese'
import { getFacePhoto, getFaceLandmarks } from '@/lib/faceStore'
import type { FaceLandmarkPoint } from '@/types/ar'
import Link from 'next/link'

function CatalogContent() {
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'static' | 'ar'>('static')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [facePhoto, setFacePhoto] = useState<string | null>(null)
  const [faceLandmarks, setFaceLandmarks] = useState<FaceLandmarkPoint[] | null>(null)

  // Chỉ chạy client-side để tránh hydration mismatch
  useEffect(() => {
    if (searchParams.get('mode') === 'ar') setViewMode('ar')
    setFacePhoto(getFacePhoto())
    setFaceLandmarks(getFaceLandmarks() as FaceLandmarkPoint[] | null)
  }, [])

  useEffect(() => {
    if (viewMode === 'ar') {
      setFacePhoto(getFacePhoto())
      setFaceLandmarks(getFaceLandmarks() as FaceLandmarkPoint[] | null)
    }
  }, [viewMode])

  const {
    filters, filteredProducts, activeFilterCount,
    toggleFrameType, toggleFrameShape, toggleMaterial,
    toggleGender, setSortBy, setPriceRange, resetFilters,
  } = useProductFilters()

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-brand-muted mb-4">
        <span>Trang Chủ</span>
        <span className="mx-1.5">/</span>
        <span className="text-brand-black font-medium">{VI.catalog.title}</span>
      </nav>

      <div className="flex gap-6">
        {/* Desktop Filter Sidebar */}
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

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
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

          {/* AR mode: hiển thị ảnh đang dùng + nút chụp lại */}
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
            total={PRODUCTS.length}
            facePhoto={facePhoto}
            faceLandmarks={faceLandmarks}
          />
        </div>
      </div>

      {/* Mobile filter drawer */}
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

export default function CatalogPage() {
  return <Suspense><CatalogContent/></Suspense>
}
