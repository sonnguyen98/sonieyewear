import type { FaceLandmarkPoint } from '@/types/ar'

export type FaceShape = 'oval' | 'round' | 'square' | 'heart' | 'rectangle' | 'diamond'

export interface FaceAnalysisResult {
  shape: FaceShape
  shapeName: string
  confidence: number
  description: string
  features: string[]
  recommendedShapes: string[]   // frame shapes phù hợp
  avoidShapes: string[]         // frame shapes nên tránh
  tip: string
}

const SHAPE_INFO: Record<FaceShape, Omit<FaceAnalysisResult, 'shape' | 'confidence'>> = {
  oval: {
    shapeName: 'Khuôn Mặt Trái Xoan',
    description: 'Đây là khuôn mặt lý tưởng — cân đối, hài hòa. Trán hơi rộng hơn hàm, cằm thon nhẹ. Hầu hết các kiểu gọng đều phù hợp với bạn!',
    features: ['Tỉ lệ chiều dài/rộng cân đối', 'Đường hàm thon nhẹ', 'Trán vừa phải'],
    recommendedShapes: ['square', 'rectangle', 'cat-eye', 'aviator', 'geometric'],
    avoidShapes: [],
    tip: 'Bạn may mắn có thể thử mọi kiểu gọng. Hãy chọn theo phong cách cá nhân!',
  },
  round: {
    shapeName: 'Khuôn Mặt Tròn',
    description: 'Khuôn mặt tròn đầy đặn, má rộng, cằm tròn. Các gọng có góc cạnh sẽ giúp khuôn mặt trông thon và dài hơn.',
    features: ['Chiều ngang và chiều dọc gần bằng nhau', 'Má đầy và nổi bật', 'Cằm tròn mềm mại'],
    recommendedShapes: ['square', 'rectangle', 'geometric'],
    avoidShapes: ['round', 'oval'],
    tip: 'Chọn gọng vuông hoặc chữ nhật — góc cạnh giúp khuôn mặt trông thon và có đường nét hơn.',
  },
  square: {
    shapeName: 'Khuôn Mặt Vuông',
    description: 'Khuôn mặt vuông góc cạnh, hàm rõ nét, trán rộng. Các gọng cong sẽ làm mềm những đường nét mạnh mẽ của bạn.',
    features: ['Trán và hàm rộng tương đương', 'Đường hàm vuông góc', 'Khuôn mặt đối xứng cao'],
    recommendedShapes: ['round', 'oval', 'cat-eye'],
    avoidShapes: ['square', 'geometric'],
    tip: 'Gọng tròn hoặc oval sẽ làm mềm đường hàm vuông, tạo sự hài hòa tự nhiên.',
  },
  heart: {
    shapeName: 'Khuôn Mặt Trái Tim',
    description: 'Trán rộng, gò má cao, cằm nhọn thon. Gọng nhẹ ở phần trên và rộng ở dưới giúp cân bằng tỉ lệ.',
    features: ['Trán rộng nổi bật', 'Gò má cao', 'Cằm nhọn và thon'],
    recommendedShapes: ['aviator', 'round', 'oval'],
    avoidShapes: ['cat-eye', 'square'],
    tip: 'Gọng phi công (aviator) là lựa chọn hoàn hảo — rộng dưới giúp cân bằng với trán rộng.',
  },
  rectangle: {
    shapeName: 'Khuôn Mặt Chữ Nhật',
    description: 'Khuôn mặt dài, trán cao, hàm và trán rộng đều nhau. Gọng to bản sẽ làm ngắn gương mặt và tạo sự cân đối.',
    features: ['Chiều dài vượt trội hơn chiều ngang', 'Các đường nét thẳng đều', 'Trán và hàm đều nhau'],
    recommendedShapes: ['round', 'cat-eye', 'oval'],
    avoidShapes: ['rectangle', 'aviator'],
    tip: 'Gọng tròn hoặc mắt mèo giúp khuôn mặt trông ngắn và cân đối hơn.',
  },
  diamond: {
    shapeName: 'Khuôn Mặt Kim Cương',
    description: 'Gò má rộng và nổi bật là điểm đặc trưng. Trán và cằm đều hẹp. Gọng oval hoặc mắt mèo sẽ tôn lên vẻ đẹp cá tính.',
    features: ['Gò má là điểm rộng nhất', 'Trán hẹp và nhọn', 'Cằm thon nhọn'],
    recommendedShapes: ['oval', 'cat-eye', 'round'],
    avoidShapes: ['geometric', 'square'],
    tip: 'Gọng mắt mèo tôn lên đôi mắt và làm nổi bật gò má đẹp của bạn.',
  },
}

// ── Phân tích hình dạng khuôn mặt từ MediaPipe landmarks ──────────────────────
export function analyzeFaceShape(
  landmarks: FaceLandmarkPoint[],
  w: number,
  h: number
): FaceAnalysisResult {
  const pt = (i: number) => ({ x: landmarks[i].x * w, y: landmarks[i].y * h })
  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)

  // Các điểm đo lường chính
  const leftCheek   = pt(234)   // má trái
  const rightCheek  = pt(454)   // má phải
  const foreheadTop = pt(10)    // đỉnh trán
  const chinBottom  = pt(152)   // cằm dưới
  const leftJaw     = pt(172)   // góc hàm trái
  const rightJaw    = pt(397)   // góc hàm phải
  const leftTemple  = pt(127)   // thái dương trái
  const rightTemple = pt(356)   // thái dương phải
  const leftChin    = pt(58)    // cằm trái
  const rightChin   = pt(288)   // cằm phải
  const leftZyg     = pt(116)   // gò má trái
  const rightZyg    = pt(345)   // gò má phải

  const faceWidth     = dist(leftCheek, rightCheek)
  const faceHeight    = dist(foreheadTop, chinBottom)
  const foreheadWidth = dist(leftTemple, rightTemple)
  const jawWidth      = dist(leftJaw, rightJaw)
  const chinWidth     = dist(leftChin, rightChin)
  const cheekWidth    = dist(leftZyg, rightZyg)

  // Tỉ lệ
  const heightRatio     = faceHeight / faceWidth        // > 1.4 = dài
  const jawRatio        = jawWidth / faceWidth           // hàm so với gò má
  const foreheadRatio   = foreheadWidth / faceWidth      // trán so với gò má
  const chinRatio       = chinWidth / faceWidth          // cằm so với gò má
  const cheekRatio      = cheekWidth / faceWidth         // gò má nổi bật

  let shape: FaceShape = 'oval'
  let confidence = 0.7

  if (heightRatio > 1.45) {
    // Khuôn mặt dài
    shape = 'rectangle'
    confidence = Math.min(0.95, 0.6 + (heightRatio - 1.45) * 2)
  } else if (cheekRatio > 1.05 && foreheadRatio < 0.88 && chinRatio < 0.65) {
    // Gò má nổi, trán và cằm hẹp → kim cương
    shape = 'diamond'
    confidence = 0.75
  } else if (foreheadRatio > 0.95 && chinRatio < 0.65) {
    // Trán rộng, cằm nhọn → trái tim
    shape = 'heart'
    confidence = 0.80
  } else if (jawRatio > 0.90 && foreheadRatio > 0.90 && heightRatio < 1.2) {
    // Hàm và trán đều rộng, mặt không dài → vuông
    shape = 'square'
    confidence = Math.min(0.95, 0.65 + jawRatio * 0.3)
  } else if (heightRatio < 1.15 && jawRatio > 0.75) {
    // Mặt tròn gần đều
    shape = 'round'
    confidence = Math.min(0.92, 0.6 + (1.2 - heightRatio))
  } else {
    // Trái xoan (mặc định cân đối)
    shape = 'oval'
    confidence = 0.78
  }

  return { shape, confidence, ...SHAPE_INFO[shape] }
}

// ── Lọc sản phẩm phù hợp theo hình dáng khuôn mặt ────────────────────────────
export function getRecommendedFrameShapes(faceShape: FaceShape): string[] {
  return SHAPE_INFO[faceShape].recommendedShapes
}
