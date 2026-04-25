'use client'

import { useEffect, useRef } from 'react'
import type { FaceLandmarkPoint, GlassesOverlayConfig } from '@/types/ar'
import { useGlassesOverlay } from '@/hooks/useGlassesOverlay'
import { VI } from '@/constants/vietnamese'

interface ARTryOnCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement>
  landmarks: FaceLandmarkPoint[] | null
  isDetecting: boolean
  isLoading: boolean
  fps: number
  config: GlassesOverlayConfig | null
  onSwitchCamera: () => void
}

export default function ARTryOnCanvas({
  videoRef,
  landmarks,
  isDetecting,
  isLoading,
  fps,
  config,
  onSwitchCamera,
}: ARTryOnCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null) as React.RefObject<HTMLCanvasElement>
  const { drawFrame } = useGlassesOverlay(canvasRef, videoRef, landmarks, config)
  const rafRef = useRef<number>(0)

  // Drive the draw loop from RAF
  useEffect(() => {
    let active = true

    function loop() {
      if (!active) return
      drawFrame()
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      active = false
      cancelAnimationFrame(rafRef.current)
    }
  }, [drawFrame])

  return (
    <div className="relative w-full h-full bg-black overflow-hidden rounded-2xl">
      {/* Video layer (mirrored for selfie view) */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
        autoPlay
        playsInline
        muted
      />

      {/* Canvas overlay (also mirrored to match video) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ transform: 'scaleX(-1)' }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white">
          <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium">{VI.ar.loadingModel}</p>
        </div>
      )}

      {/* Status bar */}
      {!isLoading && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4">
          <div className="bg-black/50 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full font-medium">
            {isDetecting ? '✓ Đã nhận diện khuôn mặt' : VI.ar.faceNotFound}
          </div>
        </div>
      )}

      {/* Switch camera button */}
      <button
        onClick={onSwitchCamera}
        className="absolute top-3 right-3 w-9 h-9 bg-black/40 backdrop-blur text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
        aria-label={VI.ar.switchCamera}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      {/* FPS counter (dev info) */}
      {fps > 0 && (
        <div className="absolute top-3 left-3 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full font-mono">
          {fps}fps
        </div>
      )}
    </div>
  )
}
