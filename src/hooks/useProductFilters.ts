'use client'

import { useState, useMemo, useEffect } from 'react'
import type { FilterState, SortOption } from '@/types/filters'
import type { FrameType, FrameShape, FrameMaterial, Gender, Product } from '@/types/product'
import { MERGED_PRODUCTS } from '@/data/products'

const DEFAULT_FILTERS: FilterState = {
  frameType: [],
  frameShape: [],
  color: [],
  material: [],
  gender: [],
  priceRange: [0, 3000000],
  brand: [],
  sortBy: 'ban-chay',
}

export function useProductFilters() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [products, setProducts] = useState<Product[]>(MERGED_PRODUCTS)

  // Fetch sản phẩm từ KV
  const loadProducts = () => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setProducts(data) })
      .catch(() => {})
  }

  useEffect(() => {
    loadProducts()
    // Tự động refetch khi người dùng quay lại tab
    window.addEventListener('focus', loadProducts)
    return () => window.removeEventListener('focus', loadProducts)
  }, [])

  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (filters.frameType.length > 0)
      result = result.filter(p => filters.frameType.includes(p.type))
    if (filters.frameShape.length > 0)
      result = result.filter(p => filters.frameShape.includes(p.shape))
    if (filters.material.length > 0)
      result = result.filter(p => filters.material.includes(p.material))
    if (filters.gender.length > 0)
      result = result.filter(p => filters.gender.includes(p.gender) || p.gender === 'unisex')
    if (filters.color.length > 0)
      result = result.filter(p => p.colorVariants.some(c => filters.color.includes(c.hex)))

    result = result.filter(
      p => p.basePrice >= filters.priceRange[0] && p.basePrice <= filters.priceRange[1]
    )

    if (filters.sortBy === 'ban-chay')
      result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0) || b.reviewCount - a.reviewCount)
    else if (filters.sortBy === 'gia-tang')
      result.sort((a, b) => a.basePrice - b.basePrice)
    else if (filters.sortBy === 'gia-giam')
      result.sort((a, b) => b.basePrice - a.basePrice)
    else if (filters.sortBy === 'moi-nhat')
      result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))

    return result
  }, [filters, products])

  function toggleFrameType(type: FrameType) {
    setFilters(f => ({ ...f, frameType: f.frameType.includes(type) ? f.frameType.filter(t => t !== type) : [...f.frameType, type] }))
  }
  function toggleFrameShape(shape: FrameShape) {
    setFilters(f => ({ ...f, frameShape: f.frameShape.includes(shape) ? f.frameShape.filter(s => s !== shape) : [...f.frameShape, shape] }))
  }
  function toggleMaterial(mat: FrameMaterial) {
    setFilters(f => ({ ...f, material: f.material.includes(mat) ? f.material.filter(m => m !== mat) : [...f.material, mat] }))
  }
  function toggleGender(g: Gender) {
    setFilters(f => ({ ...f, gender: f.gender.includes(g) ? f.gender.filter(x => x !== g) : [...f.gender, g] }))
  }
  function setSortBy(sortBy: SortOption) { setFilters(f => ({ ...f, sortBy })) }
  function setPriceRange(range: [number, number]) { setFilters(f => ({ ...f, priceRange: range })) }
  function resetFilters() { setFilters(DEFAULT_FILTERS) }

  const activeFilterCount =
    filters.frameType.length + filters.frameShape.length + filters.material.length +
    filters.gender.length + filters.color.length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 3000000 ? 1 : 0)

  return { filters, filteredProducts, activeFilterCount, toggleFrameType, toggleFrameShape, toggleMaterial, toggleGender, setSortBy, setPriceRange, resetFilters }
}
