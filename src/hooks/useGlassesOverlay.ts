'use client'

import { useRef, useEffect, useCallback } from 'react'
import type { FaceLandmarkPoint, GlassesOverlayConfig } from '@/types/ar'
import { computeFaceGeometry, drawGlassesOverlay } from '@/lib/landmark-math'

export function useGlassesOverlay(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  videoRef: React.RefObject<HTMLVideoElement>,
  landmarks: FaceLandmarkPoint[] | null,
  config: GlassesOverlayConfig | null
) {
  const overlayImgRef = useRef<HTMLImageElement | null>(null)
  const lastOverlayUrl = useRef<string>('')

  // Load overlay image when config changes
  useEffect(() => {
    if (!config?.overlayImageUrl || config.overlayImageUrl === lastOverlayUrl.current) return
    lastOverlayUrl.current = config.overlayImageUrl

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = config.overlayImageUrl
    img.onload = () => {
      overlayImgRef.current = img
    }
    img.onerror = () => {
      // Use a fallback SVG glasses shape
      const fallbackImg = new Image()
      fallbackImg.src = createFallbackGlassesSVG()
      fallbackImg.onload = () => {
        overlayImgRef.current = fallbackImg
      }
    }
  }, [config?.overlayImageUrl])

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    // Match canvas to video native resolution
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!landmarks || landmarks.length < 468 || !config || !overlayImgRef.current) {
      // Draw a subtle face guide when no face detected
      drawFaceGuide(ctx, canvas.width, canvas.height)
      return
    }

    const geometry = computeFaceGeometry(landmarks, canvas.width, canvas.height)
    drawGlassesOverlay(ctx, overlayImgRef.current, geometry, config)
  }, [canvasRef, videoRef, landmarks, config])

  return { drawFrame }
}

function drawFaceGuide(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save()
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 2
  ctx.setLineDash([8, 8])
  // Oval face guide
  ctx.beginPath()
  ctx.ellipse(w / 2, h / 2.2, w * 0.2, h * 0.3, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

function createFallbackGlassesSVG(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60">
    <rect x="5" y="10" width="85" height="40" rx="20" fill="none" stroke="#333" stroke-width="4"/>
    <rect x="110" y="10" width="85" height="40" rx="20" fill="none" stroke="#333" stroke-width="4"/>
    <line x1="90" y1="30" x2="110" y2="30" stroke="#333" stroke-width="4"/>
    <line x1="0" y1="25" x2="5" y2="25" stroke="#333" stroke-width="3"/>
    <line x1="195" y1="25" x2="200" y2="25" stroke="#333" stroke-width="3"/>
  </svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
}
