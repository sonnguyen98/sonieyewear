import type { FaceLandmarkPoint, ComputedFaceGeometry, GlassesOverlayConfig } from '@/types/ar'
import { LANDMARKS } from '@/constants/landmarks'

// ── Auto-detect vùng kính thật trong ảnh ──────────────────────────────────────
// Quét pixel để tìm bounding box của phần không phải nền (trắng/trong suốt)
export function detectGlassesBounds(
  img: HTMLImageElement
): { sx: number; sy: number; sw: number; sh: number } {
  try {
    const c = document.createElement('canvas')
    c.width  = img.naturalWidth  || img.width
    c.height = img.naturalHeight || img.height
    const ctx = c.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    const { data } = ctx.getImageData(0, 0, c.width, c.height)

    let minX = c.width, maxX = 0, minY = c.height, maxY = 0
    let found = false

    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
        // Bỏ qua: trong suốt (alpha < 20) hoặc trắng/xám rất sáng
        const isBackground = a < 20 || (r > 235 && g > 235 && b > 235)
        if (!isBackground) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
          found = true
        }
      }
    }

    if (!found || maxX <= minX || maxY <= minY) {
      // Fallback: dùng toàn bộ ảnh
      return { sx: 0, sy: 0, sw: c.width, sh: c.height }
    }

    // Padding nhỏ để không cắt sát viền
    const pad = 4
    return {
      sx: Math.max(0, minX - pad),
      sy: Math.max(0, minY - pad),
      sw: Math.min(c.width,  maxX - minX + pad * 2),
      sh: Math.min(c.height, maxY - minY + pad * 2),
    }
  } catch {
    return { sx: 0, sy: 0, sw: img.naturalWidth, sh: img.naturalHeight }
  }
}

// Cache bounds để không scan lại mỗi frame
const boundsCache = new Map<string, { sx: number; sy: number; sw: number; sh: number }>()

export function getCachedBounds(img: HTMLImageElement) {
  const key = img.src
  if (!boundsCache.has(key)) {
    boundsCache.set(key, detectGlassesBounds(img))
  }
  return boundsCache.get(key)!
}

// ── Tính geometry khuôn mặt chính xác ─────────────────────────────────────────
export function computeFaceGeometry(
  landmarks: FaceLandmarkPoint[],
  videoWidth: number,
  videoHeight: number
): ComputedFaceGeometry {
  const px = (i: number) => ({
    x: landmarks[i].x * videoWidth,
    y: landmarks[i].y * videoHeight,
  })

  // Tâm mắt trái: average của 4 điểm outline
  // outer(33), inner(133), top(159), bottom(145)
  const le = [px(33), px(133), px(159), px(145)]
  const leftEyeCenter = {
    x: le.reduce((s, p) => s + p.x, 0) / le.length,
    y: le.reduce((s, p) => s + p.y, 0) / le.length,
  }

  // Tâm mắt phải: outer(263), inner(362), top(386), bottom(374)
  const re = [px(263), px(362), px(386), px(374)]
  const rightEyeCenter = {
    x: re.reduce((s, p) => s + p.x, 0) / re.length,
    y: re.reduce((s, p) => s + p.y, 0) / re.length,
  }

  // Góc nghiêng đầu
  const rotDx = rightEyeCenter.x - leftEyeCenter.x
  const rotDy = rightEyeCenter.y - leftEyeCenter.y
  const rotation = Math.atan2(rotDy, rotDx)

  // Tâm đặt kính = trung điểm 2 tâm mắt
  const centerX = (leftEyeCenter.x + rightEyeCenter.x) / 2
  const centerY = (leftEyeCenter.y + rightEyeCenter.y) / 2

  // Outer eye span (33 → 263)
  const outerLeft  = px(LANDMARKS.LEFT_EYE_OUTER)
  const outerRight = px(LANDMARKS.RIGHT_EYE_OUTER)
  const oDx = outerRight.x - outerLeft.x
  const oDy = outerRight.y - outerLeft.y
  const eyeOuterSpan = Math.sqrt(oDx * oDx + oDy * oDy)

  // Inner eye span
  const innerLeft  = px(LANDMARKS.LEFT_EYE_INNER)
  const innerRight = px(LANDMARKS.RIGHT_EYE_INNER)
  const iDx = innerRight.x - innerLeft.x
  const iDy = innerRight.y - innerLeft.y
  const eyeSpanPx = Math.sqrt(iDx * iDx + iDy * iDy)

  return {
    noseBridgePx: px(LANDMARKS.NOSE_TOP),
    leftEyePx: leftEyeCenter,
    rightEyePx: rightEyeCenter,
    eyeSpanPx,
    frameWidthPx: eyeOuterSpan,
    rotation,
    centerX,
    centerY,
  }
}

// ── Vẽ kính lên canvas ─────────────────────────────────────────────────────────
export function drawGlassesOverlay(
  ctx: CanvasRenderingContext2D,
  overlayImg: HTMLImageElement,
  geometry: ComputedFaceGeometry,
  config: GlassesOverlayConfig
): void {
  const { centerX, centerY, frameWidthPx, eyeSpanPx, rotation } = geometry

  // 1. Auto-detect vùng kính thật (bỏ nền trắng/trong suốt)
  const bounds = getCachedBounds(overlayImg)

  // 2. Tỉ lệ khung hình của vùng kính đã crop
  const cropAR = bounds.sw / bounds.sh

  // 3. Kích thước hiển thị:
  //    - Outer eye span × 1.15 = chiều rộng vừa khít phần tròng kính
  //    - scaleMultiplier để tinh chỉnh
  const glassesWidth  = (frameWidthPx ?? eyeSpanPx * 2.0) * 1.15 * (config.scaleMultiplier ?? 1.0)
  const glassesHeight = glassesWidth / cropAR

  // 4. Dịch dọc
  const offsetY = eyeSpanPx * (config.verticalOffset ?? 0)

  ctx.save()
  ctx.translate(centerX, centerY - offsetY)
  ctx.rotate(rotation)

  if (config.overlayType === 'svg') {
    ctx.shadowColor   = 'rgba(0,0,0,0.2)'
    ctx.shadowBlur    = eyeSpanPx * 0.04
    ctx.shadowOffsetY = eyeSpanPx * 0.01
  }

  // 5. Vẽ CHỈ vùng kính đã detect (loại bỏ viền trắng/trong suốt)
  ctx.drawImage(
    overlayImg,
    bounds.sx, bounds.sy, bounds.sw, bounds.sh,   // source: vùng kính thật
    -glassesWidth / 2, -glassesHeight / 2,          // dest: căn giữa tâm 2 mắt
    glassesWidth, glassesHeight
  )

  ctx.restore()
}

// ── SVG fallback có màu ────────────────────────────────────────────────────────
export function generateColoredGlassesSVG(shape: string, color: string): string {
  const c  = color || '#222222'
  const f  = hexToRgba(c, 0.12)
  const sh = hexToRgba('#ffffff', 0.3)

  const svgs: Record<string, string> = {
    round: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 200" fill="none">
      <circle cx="150" cy="100" r="85" fill="${f}" stroke="${c}" stroke-width="10"/>
      <circle cx="450" cy="100" r="85" fill="${f}" stroke="${c}" stroke-width="10"/>
      <path d="M235 90 Q300 75 365 90" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
    </svg>`,
    square: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 200" fill="none">
      <rect x="20" y="20" width="250" height="160" rx="12" fill="${f}" stroke="${c}" stroke-width="10"/>
      <rect x="370" y="20" width="250" height="160" rx="12" fill="${f}" stroke="${c}" stroke-width="10"/>
      <path d="M270 85 Q320 70 370 85" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
    </svg>`,
    rectangle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 170" fill="none">
      <rect x="15" y="18" width="275" height="134" rx="9" fill="${f}" stroke="${c}" stroke-width="9"/>
      <rect x="370" y="18" width="275" height="134" rx="9" fill="${f}" stroke="${c}" stroke-width="9"/>
      <path d="M290 75 Q330 62 370 75" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
    </svg>`,
    'cat-eye': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 200" fill="none">
      <path d="M20 130 Q15 55 110 20 Q200 5 250 70 Q265 105 235 140 Q175 165 90 158 Q35 150 20 130Z" fill="${f}" stroke="${c}" stroke-width="10"/>
      <path d="M620 130 Q625 55 530 20 Q440 5 390 70 Q375 105 405 140 Q465 165 550 158 Q605 150 620 130Z" fill="${f}" stroke="${c}" stroke-width="10"/>
      <path d="M250 82 Q320 68 390 82" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
    </svg>`,
    oval: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 190" fill="none">
      <ellipse cx="150" cy="95" rx="125" ry="80" fill="${f}" stroke="${c}" stroke-width="10"/>
      <ellipse cx="470" cy="95" rx="125" ry="80" fill="${f}" stroke="${c}" stroke-width="10"/>
      <path d="M275 82 Q320 68 345 82" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
    </svg>`,
    aviator: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 210" fill="none">
      <path d="M130 28 Q40 28 20 95 Q6 140 55 172 Q100 196 145 185 Q215 170 232 115 Q248 58 185 30 Q160 26 130 28Z" fill="${f}" stroke="${c}" stroke-width="8"/>
      <path d="M510 28 Q600 28 620 95 Q634 140 585 172 Q540 196 495 185 Q425 170 408 115 Q392 58 455 30 Q480 26 510 28Z" fill="${f}" stroke="${c}" stroke-width="8"/>
      <path d="M232 38 Q320 26 408 38" stroke="${c}" stroke-width="6" stroke-linecap="round"/>
    </svg>`,
    geometric: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 200" fill="none">
      <polygon points="90,18 200,18 255,100 200,182 90,182 35,100" fill="${f}" stroke="${c}" stroke-width="10" stroke-linejoin="round"/>
      <polygon points="440,18 550,18 605,100 550,182 440,182 385,100" fill="${f}" stroke="${c}" stroke-width="10" stroke-linejoin="round"/>
      <path d="M255 82 Q320 68 385 82" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
    </svg>`,
    rimless: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 190" fill="none">
      <ellipse cx="150" cy="95" rx="120" ry="72" fill="rgba(180,210,255,0.12)"/>
      <ellipse cx="150" cy="95" rx="120" ry="72" fill="none" stroke="${c}" stroke-width="2" opacity="0.5"/>
      <ellipse cx="470" cy="95" rx="120" ry="72" fill="rgba(180,210,255,0.12)"/>
      <ellipse cx="470" cy="95" rx="120" ry="72" fill="none" stroke="${c}" stroke-width="2" opacity="0.5"/>
      <path d="M270 82 Q320 68 350 82" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
  }

  const svg = svgs[shape] ?? svgs['oval']
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
