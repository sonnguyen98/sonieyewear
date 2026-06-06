import * as THREE from 'three'

/** Orthographic camera sized to the video stream dimensions. */
export function createCamera(video: HTMLVideoElement): THREE.OrthographicCamera {
  const vw = video.videoWidth
  const vh = video.videoHeight
  const cam = new THREE.OrthographicCamera(-vw / 2, vw / 2, vh / 2, -vh / 2, 0.1, 5000)
  cam.position.set(-vw / 2, -vh / 2, 500)
  return cam
}

/** Video background sprite — horizontally flipped for selfie-mirror view. */
export function createVideoBackground(
  video: HTMLVideoElement,
  camera: THREE.OrthographicCamera
): { bg: THREE.Texture; sprite: THREE.Sprite } {
  const vw = video.videoWidth
  const vh = video.videoHeight

  const bg = new THREE.Texture(video)
  bg.minFilter = THREE.LinearFilter

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: bg, depthWrite: false, sizeAttenuation: false })
  )
  sprite.center.set(0.5, 0.5)
  sprite.scale.set(-vw, vh, 1) // negative x = horizontal flip (selfie mirror)
  sprite.position.copy(camera.position)
  sprite.position.z = 0

  return { bg, sprite }
}

/** Scene lighting: key, fill, rim, accent, ambient. */
export function createLights(): THREE.Light[] {
  const key = new THREE.DirectionalLight(0xffffff, 1.2)
  key.position.set(0, 120, 250)

  const fill = new THREE.DirectionalLight(0xeef0ff, 0.5)
  fill.position.set(-100, 40, 120)

  const rim = new THREE.DirectionalLight(0xffffff, 0.4)
  rim.position.set(60, 80, -100)

  const top = new THREE.DirectionalLight(0xffffff, 0.25)
  top.position.set(0, 200, 50)

  const amb = new THREE.HemisphereLight(0xffffff, 0x444466, 0.5)

  return [key, fill, rim, top, amb]
}

/** WebGL renderer with production-quality settings (Three.js r152+ API). */
export function createRenderer(video: HTMLVideoElement): THREE.WebGLRenderer {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
  r.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  r.setSize(video.videoWidth, video.videoHeight)
  ;(r as unknown as Record<string, unknown>).useLegacyLights = false
  r.toneMapping = THREE.ACESFilmicToneMapping
  r.toneMappingExposure = 1.1
  r.outputColorSpace = THREE.SRGBColorSpace
  return r
}

export function handleResize(
  camera: THREE.OrthographicCamera,
  renderer: THREE.WebGLRenderer,
  video: HTMLVideoElement
): void {
  const vw = video.videoWidth
  const vh = video.videoHeight
  camera.left = -vw / 2
  camera.right = vw / 2
  camera.top = vh / 2
  camera.bottom = -vh / 2
  camera.updateProjectionMatrix()
  renderer.setSize(vw, vh)
}
