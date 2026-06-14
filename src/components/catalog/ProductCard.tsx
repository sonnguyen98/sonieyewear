'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types/product'
import { VI } from '@/constants/vietnamese'
import { buildZaloOrderMessage, openZalo } from '@/lib/zalo'
import Badge from '@/components/ui/Badge'
import PriceTag from '@/components/ui/PriceTag'
import Button from '@/components/ui/Button'
import { useStock } from '@/hooks/useStock'

interface ProductCardProps {
  product: Product
  showZaloCTA?: boolean
}

export default function ProductCard({ product, showZaloCTA = true }: ProductCardProps) {
  const [selectedColorIdx, setSelectedColorIdx] = useState(0)
  const [imgError, setImgError] = useState(false)
  const { getVariantStock, isProductAvailable } = useStock()

  const selectedColor = product.colorVariants[selectedColorIdx]
  const colorImgs = selectedColor.images?.length ? selectedColor.images : null
  const displayImage = colorImgs?.[0] ?? (product.images?.length ? product.images[0] : null) ?? selectedColor.imageUrl
  // Ảnh thứ 2 hiển thị khi hover: ảnh tiếp theo của màu đang chọn, hoặc ảnh thứ 2 của sản phẩm, hoặc model
  const hoverImage = colorImgs?.[1]
    ?? (product.images?.length > 1 ? product.images[1] : null)
    ?? product.modelImages?.[0]
    ?? null

  // Kiểm tra tồn kho
  const variantIds = product.colorVariants.map(v => v.id)
  const defaultStocks = product.colorVariants.map(v => v.inStock)
  const isAvailable = isProductAvailable(variantIds, defaultStocks)
  const selectedVariantStock = getVariantStock(selectedColor.id, selectedColor.inStock)

  function handleZaloCTA(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const defaultLens = product.lensPackages?.[0]
    const msg = defaultLens
      ? buildZaloOrderMessage(product, selectedColor, defaultLens)
      : `Xin chào SONi Kính! Tôi muốn đặt hàng:\n- Gọng: ${product.name}\n- Màu: ${selectedColor.name}\nVui lòng tư vấn thêm ạ.`
    openZalo(msg)
  }

  return (
    <Link
      href={isAvailable ? `/gong-kinh/${product.id}` : '#'}
      onClick={e => { if (!isAvailable) e.preventDefault() }}
      className={`group block ${!isAvailable ? 'cursor-not-allowed' : ''}`}
    >
      <div className="relative bg-white rounded-2xl overflow-hidden border border-brand-border hover:border-gray-300 hover:shadow-lg transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-brand-light overflow-hidden">
          {!imgError ? (
            <>
              {/* Ảnh chính */}
              <Image
                src={displayImage}
                alt={`${product.name} - ${selectedColor.name}`}
                fill
                className={`object-contain transition-all duration-500 ${
                  hoverImage ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'
                }`}
                sizes="(max-width: 768px) 50vw, 33vw"
                onError={() => setImgError(true)}
              />
              {/* Ảnh hover (ảnh thứ 2 / model) — hiện khi di chuột vào */}
              {hoverImage && (
                <Image
                  src={hoverImage}
                  alt={`${product.name} - hover`}
                  fill
                  className="object-contain opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 absolute inset-0"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="7" cy="12" r="3" strokeWidth="1.5"/>
                <circle cx="17" cy="12" r="3" strokeWidth="1.5"/>
                <path strokeLinecap="round" strokeWidth="1.5" d="M10 12h4M1 12h3M20 12h3"/>
              </svg>
            </div>
          )}

          {/* Overlay hết hàng */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
              <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                Hết Hàng
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
            {!isAvailable
              ? <Badge variant="muted">Hết Hàng</Badge>
              : product.isBestSeller
              ? <Badge variant="gold">Bán Chạy</Badge>
              : product.isNew
              ? <Badge variant="green">Hàng Mới</Badge>
              : null
            }
          </div>

          {/* Wishlist */}
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation() }}
            className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={VI.productCard.addToWishlist}
          >
            <svg className="w-4 h-4 text-gray-400 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-sm font-semibold text-brand-black line-clamp-1 mb-0.5">{product.name}</h3>
          <p className="text-xs text-brand-muted mb-2">
            {VI.catalog.materials[product.material]} • {VI.catalog.frameShapes[product.shape]}
          </p>

          {/* Color swatches */}
          <div className="flex gap-1 mb-2.5">
            {product.colorVariants.map((c, i) => {
              const vStock = getVariantStock(c.id, c.inStock)
              const vAvail = vStock.inStock
              return (
                <button
                  key={c.id}
                  onClick={e => { e.preventDefault(); e.stopPropagation(); if (vAvail) setSelectedColorIdx(i) }}
                  disabled={!vAvail}
                  title={vAvail ? c.name : `${c.name} — Hết hàng`}
                  className={`relative w-4 h-4 rounded-full border-2 transition-all ${
                    i === selectedColorIdx ? 'border-brand-black scale-110' : 'border-transparent'
                  } ${!vAvail ? 'opacity-40 cursor-not-allowed' : ''}`}
                  style={{ backgroundColor: c.hex }}
                >
                  {!vAvail && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="block w-full h-[1.5px] bg-gray-500 rotate-45"/>
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <PriceTag price={product.basePrice} originalPrice={product.originalPrice} size="sm" className="mb-2.5" />

          {showZaloCTA && (
            isAvailable ? (
              <div className="relative">
                {/* Hiệu ứng pulse phía sau button */}
                <div className="absolute inset-0 rounded-xl bg-brand-zalo opacity-40 animate-ping" style={{ animationDuration: '1.8s' }}/>
                <div className="relative bg-brand-zalo hover:bg-blue-700 active:scale-95 text-white text-xs font-bold py-2 rounded-xl text-center transition-all shadow-md hover:shadow-blue-300/60 hover:shadow-lg">
                  Đặt Hàng Ngay
                </div>
              </div>
            ) : (
              <div className="w-full bg-gray-100 text-gray-400 text-xs font-bold py-2 rounded-xl text-center">
                Hết Hàng
              </div>
            )
          )}
        </div>
      </div>
    </Link>
  )
}
