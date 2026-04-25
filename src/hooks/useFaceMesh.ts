'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import type { FaceLandmarkPoint } from '@/types/ar'
import { getFaceLandmarker } from '@/lib/mediapipe'

export function useFaceMesh(videoRef: React.RefObject<HTMLVideoElement>) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [landmarks, setLandmarks] = useState<FaceLandmarkPoint[] | null>(null)
  const [fps, setFps] = useState(0)

  const rafRef = useRef<number>(0)
  const activeRef = useRef(false)
  const lastTimeRef = useRef(0)
  const fpsCountRef = useRef(0)
  const fpsLastSecRef = useRef(0)

  const startDetection = useCallback(async () => {
    setIsLoading(true)
    activeRef.current = true

    try {
      const landmarker = await getFaceLandmarker()
      setIsLoading(false)

      let lastVideoTime = -1

      const detect = (now: number) => {
        if (!activeRef.current) return

        const video = videoRef.current
        if (!video || video.readyState < 2) {
          rafRef.current = requestAnimationFrame(detect)
          return
        }

        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime
          const results = landmarker.detectForVideo(video, now)

          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const lms = results.faceLandmarks[0] as FaceLandmarkPoint[]
            setLandmarks(lms)
            setIsDetecting(true)
          } else {
            setLandmarks(null)
            setIsDetecting(false)
          }
        }

        // FPS tracking
        fpsCountRef.current++
        if (now - fpsLastSecRef.current >= 1000) {
          setFps(fpsCountRef.current)
          fpsCountRef.current = 0
          fpsLastSecRef.current = now
        }

        lastTimeRef.current = now
        rafRef.current = requestAnimationFrame(detect)
      }

      rafRef.current = requestAnimationFrame(detect)
    } catch (err) {
      console.error('FaceMesh init failed:', err)
      setIsLoading(false)
    }
  }, [videoRef])

  const stopDetection = useCallback(() => {
    activeRef.current = false
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
    setLandmarks(null)
    setIsDetecting(false)
  }, [])

  useEffect(() => {
    return () => {
      activeRef.current = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return { isLoading, isDetecting, landmarks, fps, startDetection, stopDetection }
}
