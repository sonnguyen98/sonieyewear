import type { FaceLandmarker } from '@mediapipe/tasks-vision'

// VIDEO mode (for live camera)
let videoInstance: FaceLandmarker | null = null
let videoPromise: Promise<FaceLandmarker> | null = null

// IMAGE mode (for static photo)
let imageInstance: FaceLandmarker | null = null
let imagePromise: Promise<FaceLandmarker> | null = null

async function createLandmarker(mode: 'VIDEO' | 'IMAGE'): Promise<FaceLandmarker> {
  const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
  )
  return FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
      delegate: 'GPU',
    },
    runningMode: mode,
    numFaces: 1,
    minFaceDetectionConfidence: 0.5,
    minFacePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false,
  })
}

export async function getFaceLandmarker(): Promise<FaceLandmarker> {
  if (videoInstance) return videoInstance
  if (videoPromise) return videoPromise
  videoPromise = createLandmarker('VIDEO').then(l => { videoInstance = l; return l })
  return videoPromise
}

export async function getFaceLandmarkerForImage(): Promise<FaceLandmarker> {
  if (imageInstance) return imageInstance
  if (imagePromise) return imagePromise
  imagePromise = createLandmarker('IMAGE').then(l => { imageInstance = l; return l })
  return imagePromise
}

export function resetFaceLandmarker() {
  videoInstance?.close(); videoInstance = null; videoPromise = null
  imageInstance?.close(); imageInstance = null; imagePromise = null
}
