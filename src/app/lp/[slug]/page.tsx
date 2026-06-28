'use client'

import { useState, useEffect, use } from 'react'
import { notFound } from 'next/navigation'
import type { Product } from '@/types/product'
import { getLandingPage } from '@/data/landingPages'
import { getProductById } from '@/data/products'
import LandingPageView from '@/components/landing/LandingPageView'

interface PageProps {
  params: Promise<{ slug: string }>
}

const DUMMY_PRODUCT: Product = {
  id: 'general',
  slug: 'general',
  name: 'SONi',
  brand: 'SONi',
  type: 'full-rim',
  shape: 'round',
  material: 'metal',
  gender: 'unisex',
  basePrice: 0,
  rating: 5,
  reviewCount: 0,
  colorVariants: [],
  specs: { bridgeWidth: 0, lensWidth: 0, templeLength: 0, frameWidth: '', weight: 0 },
  description: '',
  features: [],
  lensPackages: [],
  images: [],
  modelImages: [],
  isBestSeller: false,
  isNew: false,
  tags: [],
}

export default function LandingPage({ params }: PageProps) {
  const { slug } = use(params)
  const content = getLandingPage(slug)

  const staticProduct = content ? (getProductById(content.productId) as Product | undefined) : undefined
  const [product, setProduct] = useState<Product | undefined>(staticProduct)
  const [fetched, setFetched] = useState(!!staticProduct)

  useEffect(() => {
    if (!content) return
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const found = data.find((p: Product) => p.id === content.productId)
          if (found) setProduct(found)
        }
        setFetched(true)
      })
      .catch(() => setFetched(true))
  }, [content])

  if (!content) notFound()

  if (!fetched && !content.giftLead) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-brand-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-brand-muted text-sm">Đang tải trang...</p>
        </div>
      </div>
    )
  }

  if (!product && !content.giftLead) notFound()

  return <LandingPageView content={content} product={product ?? DUMMY_PRODUCT} />
}
