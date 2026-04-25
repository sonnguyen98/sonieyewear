'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductBySlug, getRelatedProducts, MERGED_PRODUCTS } from '@/data/products'
import ImageGallery from '@/components/product/ImageGallery'
import OrderModal from '@/components/product/OrderModal'
import CountdownTimer from '@/components/product/CountdownTimer'
import SpecsTable from '@/components/product/SpecsTable'
import RelatedProducts from '@/components/product/RelatedProducts'
import Badge from '@/components/ui/Badge'
import StarRating from '@/components/ui/StarRating'
import Button from '@/components/ui/Button'
import { VI } from '@/constants/vietnamese'
import { formatVND } from '@/lib/utils'
import { useStock } from '@/hooks/useStock'

interface PageProps {
  params: { id: string }
}

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = params
  const staticProduct = getProductBySlug(id)
  const [product, setProduct] = useState(staticProduct)
  const [fetchDone, setFetchDone] = useState(!!staticProduct)

  // Fetch từ KV — cần thiết cho sản phẩm mới thêm qua admin
  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const found = data.find((p: { slug: string }) => p.slug === id)
          if (found) setProduct(found)
        }
        setFetchDone(true)
      })
      .catch(() => setFetchDone(true))
  }, [id])

  // Đang tải từ KV
  if (!fetchDone) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-brand-black border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
          <p className="text-brand-muted text-sm">Đang tải sản phẩm...</p>
        </div>
      </div>
    )
  }

  if (!product) notFound()

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedColorId, setSelectedColorId] = useState(product?.colorVariants?.[0]?.id ?? '')
  const selectedColor = product.colorVariants.find(c => c.id === selectedColorId) ?? product.colorVariants[0]
  const { isProductAvailable, getProductQuantity, getVariantStock } = useStock()
  const variantIds = product.colorVariants.map(v => v.id)
  const defaultStocks = product.colorVariants.map(v => v.inStock)
  const isAvailable = isProductAvailable(variantIds, defaultStocks)
  const totalQty = getProductQuantity(variantIds)
  const isLowStock = totalQty > 0 && totalQty <= 5
  // Màu đang chọn có còn hàng không
  const selectedColorInStock = getVariantStock(selectedColor.id, selectedColor.inStock).inStock

  const related = getRelatedProducts(product, 4)
  const discountedPrice = product.basePrice
  const originalPrice = product.originalPrice

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-brand-muted mb-5 flex items-center gap-1.5">
        <Link href="/" className="hover:text-brand-black transition-colors">{VI.product.breadcrumb.home}</Link>
        <span>/</span>
        <Link href="/gong-kinh" className="hover:text-brand-black transition-colors">{VI.product.breadcrumb.catalog}</Link>
        <span>/</span>
        <span className="text-brand-black font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-4 md:gap-8 lg:gap-12">
        {/* Left: Image Gallery */}
        <div>
          <ImageGallery product={product} selectedColor={selectedColor} />
          <Link href={`/thu-kinh?product=${product.id}`} className="hidden md:block mt-4">
            <Button variant="outline" fullWidth size="md">
              <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {VI.product.tryOnAR}
            </Button>
          </Link>
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col gap-4">
          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            {product.isBestSeller && <Badge variant="gold">Bán Chạy</Badge>}
            {product.isNew && <Badge variant="green">Hàng Mới</Badge>}
            <Badge variant="muted">{product.brand}</Badge>
          </div>

          {/* Name + Rating */}
          <div>
            <h1 className="text-display-md font-black text-brand-black leading-tight">{product.name}</h1>
            <div className="mt-2">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" />
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-black text-brand-black">{formatVND(discountedPrice)}</span>
            {originalPrice && (
              <>
                <span className="text-base text-gray-400 line-through">{formatVND(originalPrice)}</span>
                <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                  -{Math.round((1 - discountedPrice / originalPrice) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* Color picker — chọn màu đổi ảnh gallery */}
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-brand-black">
              Màu sắc:&nbsp;
              <span className="font-normal text-brand-muted">{selectedColor.name}</span>
              {!getVariantStock(selectedColor.id, selectedColor.inStock).inStock && (
                <span className="ml-2 text-xs text-red-500 font-semibold">— Hết hàng</span>
              )}
            </p>
            <div className="flex gap-2 flex-wrap">
              {product.colorVariants.map(v => {
                const vStock = getVariantStock(v.id, v.inStock)
                const vAvail = vStock.inStock
                return (
                  <button
                    key={v.id}
                    onClick={() => { if (vAvail) setSelectedColorId(v.id) }}
                    disabled={!vAvail}
                    title={vAvail ? v.name : `${v.name} — Hết hàng`}
                    className={`relative w-8 h-8 rounded-full border-2 transition-all ${
                      v.id === selectedColorId
                        ? 'border-brand-black ring-2 ring-brand-black ring-offset-2 scale-110'
                        : vAvail ? 'border-gray-300 hover:scale-110' : 'border-gray-200 opacity-40 cursor-not-allowed'
                    }`}
                    style={{ backgroundColor: v.hex }}
                  >
                    {!vAvail && (
                      <span className="absolute inset-0 flex items-center justify-center rounded-full overflow-hidden">
                        <span className="block w-[130%] h-[2px] bg-gray-500 rotate-45"/>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {/* Cảnh báo khi màu đang chọn hết hàng */}
            {!getVariantStock(selectedColor.id, selectedColor.inStock).inStock && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                ⚠️ Màu <strong>{selectedColor.name}</strong> hiện đã hết hàng. Vui lòng chọn màu khác hoặc liên hệ để đặt trước.
              </p>
            )}
          </div>

          {/* ── URGENCY CTA ── */}
          <div className="rounded-2xl border-2 border-red-500 overflow-hidden">
            {/* Timer bar */}
            <div className="bg-red-600 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white flex-shrink-0 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-white text-xs font-bold">
                  <span className="text-yellow-300">Giảm thêm 20%</span> cho đơn hàng trong:
                </span>
              </div>
              <CountdownTimer />
            </div>

            {/* Social proof */}
            <div className="bg-red-50 px-4 py-2 flex items-center gap-2 border-b border-red-100">
              <span className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </span>
              <span className="text-xs text-red-700 font-medium">
                🔥 <strong>23 người</strong> đang xem sản phẩm này
              </span>
            </div>

            {/* CTA button */}
            <div className="p-4 bg-white">
              {isLowStock && (
                <p className="text-center text-xs text-orange-600 font-semibold mb-2 animate-pulse">
                  ⚠️ Chỉ còn {totalQty} sản phẩm — đặt hàng ngay!
                </p>
              )}
              {!isAvailable && (
                <div className="w-full bg-gray-100 text-gray-500 font-bold py-4 rounded-2xl text-center text-base mb-2">
                  Hết Hàng — Liên hệ để đặt trước
                </div>
              )}
              <button
                onClick={() => isAvailable && selectedColorInStock && setModalOpen(true)}
                disabled={!isAvailable || !selectedColorInStock}
                className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all text-base shadow-lg ${
                  isAvailable && selectedColorInStock
                    ? 'bg-brand-zalo hover:bg-blue-700 text-white hover:shadow-xl active:scale-95'
                    : !isAvailable ? 'hidden' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Đặt Hàng Ngay (Giảm 20%)
              </button>
              <p className="text-center text-xs text-brand-muted mt-2">
                🛡️ Tư vấn miễn phí • Đổi trả trong 7 ngày
              </p>
            </div>
          </div>

          {/* Try AR (mobile) */}
          <Link href={`/thu-kinh?product=${product.id}`} className="md:hidden">
            <Button variant="outline" fullWidth size="md">
              <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {VI.product.tryOnAR}
            </Button>
          </Link>

          {/* Features */}
          {product.features.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-brand-black mb-2">Đặc điểm nổi bật</p>
              <ul className="space-y-1">
                {product.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-brand-muted">
                    <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Specs Table */}
      <div className="mt-10">
        <SpecsTable product={product} />
      </div>

      {/* Description */}
      <div className="mt-8 bg-brand-light rounded-2xl p-6">
        <h3 className="text-base font-bold mb-3 text-brand-black">Mô Tả Sản Phẩm</h3>
        <p className="text-sm text-brand-muted leading-relaxed">{product.description}</p>
      </div>

      {/* Related */}
      <RelatedProducts products={related} />

      {/* Order Modal */}
      {modalOpen && (
        <OrderModal product={product} onClose={() => setModalOpen(false)} />
      )}
    </div>
  )
}
