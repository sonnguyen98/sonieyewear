import type { Product, ColorVariant, LensPackage } from '@/types/product'
import { ZALO_PHONE, ZALO_BASE_URL } from '@/constants/zalo'

export function buildZaloOrderMessage(
  product: Product,
  color: ColorVariant,
  lens: LensPackage
): string {
  return (
    `Xin chào SONi Kính! Tôi muốn đặt hàng:\n` +
    `- Gọng: ${product.name}\n` +
    `- Màu: ${color.name}\n` +
    `- Tròng: ${lens.name}\n` +
    `- Mã SP: ${product.id}\n` +
    `Vui lòng tư vấn thêm ạ.`
  )
}

export function openZalo(message: string): void {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(message).catch(() => {})
  }
  window.open(`${ZALO_BASE_URL}/${ZALO_PHONE}`, '_blank', 'noopener,noreferrer')
}

export function openZaloDefault(): void {
  window.open(`${ZALO_BASE_URL}/${ZALO_PHONE}`, '_blank', 'noopener,noreferrer')
}
