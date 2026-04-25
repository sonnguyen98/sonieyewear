import type { LensPackage } from '@/types/product'

export const LENS_PACKAGES: LensPackage[] = [
  {
    id: 'frame-only',
    name: 'Chỉ Gọng',
    description: 'Mua gọng kính không kèm tròng',
    additionalPrice: 0,
    features: [],
  },
  {
    id: 'basic',
    name: 'Tròng Cơ Bản',
    description: 'Tròng nhựa CR-39 trong suốt, chống UV400, phủ chống trầy',
    additionalPrice: 300000,
    features: ['Chống UV400', 'Phủ chống trầy', 'Chỉ số 1.56', 'Phù hợp 0–4 độ'],
  },
  {
    id: 'blue-light',
    name: 'Chống Ánh Sáng Xanh',
    description: 'Bảo vệ mắt khi dùng máy tính, điện thoại nhiều giờ',
    additionalPrice: 550000,
    features: ['Lọc ánh sáng xanh HEV', 'Chống UV400', 'Giảm mỏi mắt', 'Phủ chống trầy'],
    recommended: true,
  },
  {
    id: 'photochromic',
    name: 'Tự Đổi Màu',
    description: 'Trong suốt trong nhà, tự động tối khi ra ngoài trời nắng',
    additionalPrice: 850000,
    features: ['Đổi màu trong 30 giây', 'Chống UV400', 'Bảo vệ 100% tia UV'],
  },
  {
    id: 'progressive',
    name: 'Đa Tròng',
    description: 'Dành cho người cần kính nhìn gần và xa đồng thời',
    additionalPrice: 1500000,
    features: ['Nhìn gần + trung + xa', 'Không đường phân cách', 'Cần thời gian thích nghi'],
  },
]
