'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { FaceLandmarkPoint, GlassesOverlayConfig } from '@/types/ar'
import { getFaceLandmarkerForImage } from '@/lib/mediapipe'
import { computeFaceGeometry, drawGlassesOverlay, generateColoredGlassesSVG } from '@/lib/landmark-math'

interface TryOnViewProps {
  photoDataUrl: string
  config: GlassesOverlayConfig | null
  tryOnMode: boolean
  onRetake: () => void
}

export default function TryOnView({ photoDataUrl, config, tryOnMode, onRetake }: TryOnViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const photoImgRef = useRef<HTMLImageElement | null>(null)
  const landmarksRef = useRef<FaceLandmarkPoint[] | null>(null)
  const overlayImgRef = useRef<HTMLImageElement | null>(null)
  const [detecting, setDetecting] = useState(true)
  const [faceFound, setFaceFound] = useState(false)

  // Load photo + detect face once
  useEffect(() => {
    const img = new Image()
    img.src = photoDataUrl
    img.onload = async () => {
      photoImgRef.current = img

      // Draw photo to canvas immediately
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)

      // Run face detection on static image
      try {
        const lm = await getFaceLandmarkerForImage()
        const results = lm.detect(img)
        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          landmarksRef.current = results.faceLandmarks[0] as FaceLandmarkPoint[]
          setFaceFound(true)
        } else {
          setFaceFound(false)
        }
      } catch (e) {
        console.error('Face detect error:', e)
      }
      setDetecting(false)
    }
  }, [photoDataUrl])

  // Load overlay image
  // Ưu tiên: 1) ảnh PNG thật từ product (nếu có, đã xóa nền)
  //           2) SVG màu theo shape + color (fallback)
  useEffect(() => {
    if (!config) { overlayImgRef.current = null; return }

    const loadImg = (src: string): Promise<HTMLImageElement> =>
      new Promise((res, rej) => {
        const i = new Image()
        i.crossOrigin = 'anonymous'
        i.onload = () => res(i)
        i.onerror = rej
        i.src = src
      })

    const svgUrl = generateColoredGlassesSVG(config.frameShape, config.frameColor)

    // Thử load ảnh PNG thật trước, fallback về SVG
    const tryLoad = async () => {
      if (config.productImageUrl) {
        try {
          const img = await loadImg(config.productImageUrl)
          overlayImgRef.current = img
          redraw()
          return
        } catch {}
      }
      // Fallback: SVG có màu
      const svgImg = await loadImg(svgUrl)
      overlayImgRef.current = svgImg
      redraw()
    }

    tryLoad()
  }, [config?.productImageUrl, config?.frameShape, config?.frameColor])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    const photo = photoImgRef.current
    if (!canvas || !photo) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(photo, 0, 0)

    if (tryOnMode && landmarksRef.current && config && overlayImgRef.current) {
      const geo = computeFaceGeometry(landmarksRef.current, canvas.width, canvas.height)
      drawGlassesOverlay(ctx, overlayImgRef.current, geo, config)
    }
  }, [tryOnMode, config])

  // Redraw whenever tryOnMode or config changes
  useEffect(() => { redraw() }, [redraw])

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-contain" />

      {/* Detecting overlay */}
      {detecting && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-sm font-medium">Đang nhận diện khuôn mặt...</p>
        </div>
      )}

      {/* No face warning */}
      {!detecting && !faceFound && tryOnMode && (
        <div className="absolute bottom-24 left-4 right-4">
          <div className="bg-red-500/80 text-white text-xs text-center px-4 py-2 rounded-xl">
            ⚠️ Không nhận diện được khuôn mặt — hãy chụp lại ảnh rõ hơn
          </div>
        </div>
      )}

      {/* Retake button */}
      <button onClick={onRetake}
        className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/50 text-white text-xs font-semibold px-3 py-2 rounded-full backdrop-blur hover:bg-black/70 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Chụp lại
      </button>
    </div>
  )
}

