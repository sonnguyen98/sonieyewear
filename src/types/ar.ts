export type CameraState = 'idle' | 'requesting' | 'active' | 'denied' | 'error'

export interface FaceLandmarkPoint {
  x: number
  y: number
  z: number
}

export interface ComputedFaceGeometry {
  noseBridgePx: { x: number; y: number }
  leftEyePx: { x: number; y: number }
  rightEyePx: { x: number; y: number }
  eyeSpanPx: number
  frameWidthPx?: number   // temple-to-temple distance
  rotation: number
  centerX: number
  centerY: number
}

export interface GlassesOverlayConfig {
  productId: string
  overlayType: 'png' | 'svg' | 'glb'
  overlayImageUrl: string
  productImageUrl?: string   // ảnh sản phẩm thật để dùng blend mode
  frameColor: string         // hex color của gọng
  frameShape: string
  glbModelUrl?: string
  verticalOffset: number
  scaleMultiplier: number
  templeCrop?: number   // cắt càng kính mỗi bên 0–0.35, mặc định 0.18
}

export interface ARSession {
  cameraState: CameraState
  selectedProductId: string | null
  isDetecting: boolean
  fps: number
  landmarks: FaceLandmarkPoint[] | null
}
