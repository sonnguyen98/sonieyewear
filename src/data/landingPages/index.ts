import type { LandingPageContent } from '@/types/landingPage'
import bulsajo from './gng-bulsajo-hai-cu'
import lpSoni from './lp-soni'

// Registry tất cả landing pages — thêm mẫu mới vào đây sau khi tạo file content
const REGISTRY: Record<string, LandingPageContent> = {
  [bulsajo.slug]: bulsajo,
  [lpSoni.slug]: lpSoni,
}

export function getLandingPage(slug: string): LandingPageContent | undefined {
  return REGISTRY[slug]
}

export function getAllLandingPageSlugs(): string[] {
  return Object.keys(REGISTRY)
}

export function getAllLandingPages(): LandingPageContent[] {
  return Object.values(REGISTRY)
}

export function getLandingPageByProductId(productId: string): LandingPageContent | undefined {
  return Object.values(REGISTRY).find(lp => lp.productId === productId)
}
