import type { FrameType, FrameShape, FrameMaterial, Gender } from './product'

export type SortOption = 'ban-chay' | 'gia-tang' | 'gia-giam' | 'moi-nhat'

export interface FilterState {
  frameType: FrameType[]
  frameShape: FrameShape[]
  color: string[]
  material: FrameMaterial[]
  gender: Gender[]
  priceRange: [number, number]
  brand: string[]
  sortBy: SortOption
}

export interface FilterOption<T = string> {
  value: T
  label: string
  icon?: string
  count?: number
}
