'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import type { CameraState } from '@/types/ar'

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null) as React.RefObject<HTMLVideoElement>
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraState, setCameraState] = useState<CameraState>('idle')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')

  const startCamera = useCallback(async (facing: 'user' | 'environment' = 'user') => {
    setCameraState('requesting')
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await new Promise<void>(resolve => {
          videoRef.current!.onloadedmetadata = () => resolve()
        })
        await videoRef.current.play()
      }

      setCameraState('active')
      setFacingMode(facing)
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraState('denied')
        } else {
          setCameraState('error')
        }
      } else {
        setCameraState('error')
      }
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraState('idle')
  }, [])

  const switchCamera = useCallback(() => {
    const next = facingMode === 'user' ? 'environment' : 'user'
    startCamera(next)
  }, [facingMode, startCamera])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  return { videoRef, cameraState, facingMode, startCamera, stopCamera, switchCamera }
}
