export type FrameType = 'full-rim' | 'rimless' | 'semi-rimless'
export type FrameShape = 'round' | 'square' | 'rectangle' | 'cat-eye' | 'aviator' | 'oval' | 'geometric'
export type FrameMaterial = 'metal' | 'plastic' | 'titanium' | 'combination'
export type Gender = 'nam' | 'nu' | 'unisex'

export interface ColorVariant {
  id: string
  name: string
  hex: string
  imageUrl: string       // ảnh đầu tiên (backward compat)
  images?: string[]      // nhiều ảnh mô tả cho màu này
  overlayImageUrl: string
  glbModelUrl?: string
  inStock: boolean
}

export interface LensPackage {
  id: string
  name: string
  description: string
  additionalPrice: number
  features: string[]
  recommended?: boolean
}

export interface FrameSpecs {
  bridgeWidth: number
  lensWidth: number
  templeLength: number
  frameWidth: string
  weight: number
}

export interface Product {
  id: string
  slug: string
  name: string
  sku?: string
  brand: string
  type: FrameType
  shape: FrameShape
  material: FrameMaterial
  gender: Gender
  basePrice: number
  originalPrice?: number
  rating: number
  reviewCount: number
  colorVariants: ColorVariant[]
  specs: FrameSpecs
  description: string
  features: string[]
  lensPackages: LensPackage[]
  images: string[]
  modelImages: string[]
  discountPercent?: number
  isBestSeller?: boolean
  isNew?: boolean
  tags: string[]
}
